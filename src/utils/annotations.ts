import type { BoundingBox, ClassDef, ImageFile, LabelFormat } from "../types";
import { listEntries, readTextFile, type ProgressCb } from "./filesystem";
import { pickClassColor, uid } from "./id";

const LABEL_EXT_TO_FORMAT: Record<string, LabelFormat[]> = {
  txt: ["yolo"],
  json: ["coco", "json"],
  xml: ["voc"],
  csv: ["csv"],
  jsonl: ["jsonl"],
};

const SHARED_LABEL_FILES: Record<LabelFormat, string[]> = {
  coco: [
    "_annotations.coco.json",
    "annotations.json",
    "instances.json",
    "coco.json",
  ],
  json: ["labels.json", "dataset.json"],
  csv: ["labels.csv"],
  jsonl: ["labels.jsonl"],
  yolo: [],
  voc: [],
};

function baseName(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? name : name.slice(0, i);
}

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
}

function newBoxId(): string {
  return `b-${Math.random().toString(36).slice(2, 9)}`;
}

type JsonRecord = Record<string, unknown>;

function asArray(val: unknown): JsonRecord[] {
  return Array.isArray(val) ? (val as JsonRecord[]) : [];
}

function numAt(rec: JsonRecord, key: string): number | undefined {
  const v = rec[key];
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function strAt(rec: JsonRecord, key: string): string {
  const v = rec[key];
  return v == null ? "" : String(v);
}

function buildClassDefs(names: string[]): ClassDef[] {
  const seen = new Set<string>();
  const out: ClassDef[] = [];
  let i = 0;
  for (const raw of names) {
    const n = String(raw ?? "").trim();
    if (!n) continue;
    const key = n.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ id: uid(), name: n, color: pickClassColor(i, out) });
    i += 1;
  }
  return out;
}

function parseYoloLine(
  line: string,
  classes: ClassDef[],
  width: number,
  height: number,
): BoundingBox | null {
  const parts = line.trim().split(/\s+/);
  if (parts.length < 5) return null;
  const cls = Number(parts[0]);
  if (!Number.isInteger(cls) || cls < 0 || cls >= classes.length) return null;
  let cx = Number(parts[1]);
  let cy = Number(parts[2]);
  let w = Number(parts[3]);
  let h = Number(parts[4]);
  if (![cx, cy, w, h].every(Number.isFinite)) return null;
  // YOLO spec stores normalized [0,1] coords. Auto-scale to pixels when image
  // dimensions are known. Allow values slightly above 1 (boxes drawn past an
  // edge); only treat as absolute pixels when they're clearly > 2.
  if (width > 0 && height > 0 && Math.max(cx, cy, w, h) <= 2) {
    cx *= width;
    cy *= height;
    w *= width;
    h *= height;
  }
  return {
    id: newBoxId(),
    classId: classes[cls].id,
    x: cx - w / 2,
    y: cy - h / 2,
    w,
    h,
  };
}

function vocObjectNames(xml: string): string[] {
  try {
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    return Array.from(doc.getElementsByTagName("object"))
      .map((o) => o.getElementsByTagName("name")[0]?.textContent ?? "")
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function vocToBoxes(xml: string, classes: ClassDef[]): BoundingBox[] {
  const out: BoundingBox[] = [];
  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(xml, "application/xml");
  } catch {
    return out;
  }
  const objs = Array.from(doc.getElementsByTagName("object"));
  for (const obj of objs) {
    const name = obj.getElementsByTagName("name")[0]?.textContent ?? "";
    const cls = classes.find(
      (c) => c.name.toLowerCase() === name.trim().toLowerCase(),
    );
    if (!cls) continue;
    const bnd = obj.getElementsByTagName("bndbox")[0];
    if (!bnd) continue;
    const xmin = Number(bnd.getElementsByTagName("xmin")[0]?.textContent ?? NaN);
    const ymin = Number(bnd.getElementsByTagName("ymin")[0]?.textContent ?? NaN);
    const xmax = Number(bnd.getElementsByTagName("xmax")[0]?.textContent ?? NaN);
    const ymax = Number(bnd.getElementsByTagName("ymax")[0]?.textContent ?? NaN);
    if ([xmin, ymin, xmax, ymax].some((n) => !Number.isFinite(n))) continue;
    out.push({
      id: newBoxId(),
      classId: cls.id,
      x: xmin,
      y: ymin,
      w: xmax - xmin,
      h: ymax - ymin,
    });
  }
  return out;
}

function isYoloLine(line: string): boolean {
  const p = line.trim().split(/\s+/);
  if (p.length < 5) return false;
  if (!/^\d+$/.test(p[0])) return false;
  return p.slice(1, 5).every((n) => Number.isFinite(Number(n)));
}

/**
 * Sniff the label format from file content. Returns null if undeterminable.
 */
export function detectLabelFormat(text: string): LabelFormat | null {
  const t = text.trim();
  if (!t) return null;

  // VOC / XML
  if (/^<\?xml|<annotation[\s>]/i.test(t)) return "voc";

  const firstLine = t.split(/\r?\n/)[0].trim();

  // JSON document (single object)
  if (t[0] === "{") {
    try {
      const d = JSON.parse(t);
      if (
        Array.isArray(d?.annotations) ||
        (Array.isArray(d?.images) && Array.isArray(d?.categories))
      ) {
        return "coco";
      }
      if (Array.isArray(d?.classes) || Array.isArray(d?.images)) {
        return "json";
      }
      return "coco";
    } catch {
      return null;
    }
  }

  // JSONL (one object per line)
  if (firstLine[0] === "{") {
    try {
      const obj = JSON.parse(firstLine);
      if ("file" in obj && "labels" in obj) return "jsonl";
    } catch {
      /* fall through */
    }
  }

  // CSV (header)
  if (/^filename\s*,\s*labels/i.test(firstLine)) return "csv";

  // YOLO (lines of "int float float float float [...]")
  const lines = t.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  if (lines.length > 0 && lines.every(isYoloLine)) return "yolo";

  return null;
}

async function readLabelFile(
  dir: FileSystemDirectoryHandle,
  name: string,
): Promise<string | null> {
  try {
    const handle = await dir.getFileHandle(name);
    return await readTextFile(handle);
  } catch {
    return null;
  }
}

/**
 * Detect the dominant label format inside a labels folder by sampling file
 * contents (not just extensions). Shared/single-file datasets are checked
 * first, then per-image files.
 */
export async function detectFolderFormat(
  labelsDir: FileSystemDirectoryHandle,
  labelNames?: Set<string>,
): Promise<LabelFormat | null> {
  const names = labelNames ?? new Set(await listEntries(labelsDir));

  // 1) Known shared/single-file datasets first.
  for (const fmt of ["coco", "json", "csv", "jsonl"] as LabelFormat[]) {
    for (const candidate of SHARED_LABEL_FILES[fmt]) {
      if (!names.has(candidate)) continue;
      const text = await readLabelFile(labelsDir, candidate);
      if (text && detectLabelFormat(text)) return detectLabelFormat(text);
    }
  }

  // 2) Sample per-image label files.
  let sampled = 0;
  for (const name of names) {
    if (sampled >= 8) break;
    if (name.toLowerCase() === "classes.txt") continue;
    const ext = extOf(name);
    const fmts = LABEL_EXT_TO_FORMAT[ext];
    if (!fmts) continue;
    const text = await readLabelFile(labelsDir, name);
    sampled += 1;
    if (!text) continue;
    const detected = detectLabelFormat(text);
    if (detected) return detected;
  }
  return null;
}

/** Parse a quoted CSV row that supports "" escaping inside quoted fields. */
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function matchImage(
  images: ImageFile[],
  fileName: string,
): ImageFile | undefined {
  if (!fileName) return undefined;
  return (
    images.find((im) => im.name === fileName) ??
    images.find((im) => baseName(im.name) === baseName(fileName))
  );
}

export interface ImportedDataset {
  classes: ClassDef[];
  boxes: Record<string, BoundingBox[]>;
  classifications: Record<string, string[]>;
  format: LabelFormat | null;
}

/**
 * Read all labels from a labels directory using content-based format detection.
 * Imports classes (from classes.txt, COCO categories, VOC object names, JSON
 * classes, or CSV/JSONL labels), parses bounding boxes / classifications and
 * distributes them across the given images.
 */
export async function importDataset(
  labelsDir: FileSystemDirectoryHandle,
  images: ImageFile[],
  onProgress?: ProgressCb,
): Promise<ImportedDataset> {
  const labelNames = new Set(await listEntries(labelsDir));
  onProgress?.(0, 1, "detect");
  const format = await detectFolderFormat(labelsDir, labelNames);

  const boxes: Record<string, BoundingBox[]> = {};
  const classifications: Record<string, string[]> = {};
  for (const img of images) {
    boxes[img.id] = [];
    classifications[img.id] = [];
  }

  if (!format || images.length === 0) {
    onProgress?.(1, 1, "done");
    return { classes: [], boxes, classifications, format };
  }

  const total = images.length;
  const tick = (done: number, label: string) => onProgress?.(done, total, label);
  // Cooperatively yield so the UI can paint during large imports.
  const yield_ = () => new Promise((r) => setTimeout(r, 0));

  if (format === "yolo") {
    let classNames: string[] = [];
    if (labelNames.has("classes.txt")) {
      const text = await readLabelFile(labelsDir, "classes.txt");
      if (text) {
        classNames = text
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }
    const classDefs = buildClassDefs(classNames);
    let done = 0;
    for (const img of images) {
      tick(done, img.name);
      await yield_();
      const text = await readLabelFile(labelsDir, `${baseName(img.name)}.txt`);
      if (text) {
        const lines = text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
        boxes[img.id] = lines
          .map((l) => parseYoloLine(l, classDefs, img.width, img.height))
          .filter(Boolean) as BoundingBox[];
      }
      done += 1;
      tick(done, img.name);
    }
    onProgress?.(1, 1, "done");
    return { classes: classDefs, boxes, classifications, format };
  }

  if (format === "voc") {
    // First pass: collect object names preserving first-seen order.
    const order: string[] = [];
    const seen = new Set<string>();
    const perFileText: Record<string, string> = {};
    let done = 0;
    for (const img of images) {
      tick(done, img.name);
      await yield_();
      const text = await readLabelFile(labelsDir, `${baseName(img.name)}.xml`);
      if (text) {
        perFileText[img.id] = text;
        for (const n of vocObjectNames(text)) {
          const key = n.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            order.push(n);
          }
        }
      }
      done += 1;
      tick(done, img.name);
    }
    const classDefs = buildClassDefs(order);
    for (const img of images) {
      const text = perFileText[img.id];
      if (!text) continue;
      boxes[img.id] = vocToBoxes(text, classDefs);
    }
    return { classes: classDefs, boxes, classifications, format };
  }

  if (format === "coco" || format === "json") {
    onProgress?.(0, 1, format);
    const sharedName =
      SHARED_LABEL_FILES[format].find((n) => labelNames.has(n)) ?? null;
    const text = sharedName
      ? await readLabelFile(labelsDir, sharedName)
      : null;
    if (!text) {
      onProgress?.(1, 1, "done");
      return { classes: [], boxes, classifications, format };
    }

    let data: JsonRecord;
    try {
      data = JSON.parse(text) as JsonRecord;
    } catch {
      onProgress?.(1, 1, "done");
      return { classes: [], boxes, classifications, format };
    }

    let classNames: string[] = [];
    if (format === "coco") {
      const cats = asArray(data.categories)
        .slice()
        .sort((a, b) => Number(a.id ?? 0) - Number(b.id ?? 0));
      classNames = cats
        .map((c) => strAt(c, "name"))
        .filter(Boolean);
    } else {
      classNames = asArray(data.classes)
        .map((c) => (typeof c === "string" ? c : strAt(c, "name")))
        .filter(Boolean);
    }
    const classDefs = buildClassDefs(classNames);
    const byName = new Map(
      classDefs.map((c) => [c.name.toLowerCase(), c]),
    );

    if (format === "coco") {
      const imgMetaById = new Map<unknown, JsonRecord>(
        asArray(data.images).map((im) => [im.id, im]),
      );
      const catById = new Map<unknown, JsonRecord>(
        asArray(data.categories).map((c) => [c.id, c]),
      );
      for (const ann of asArray(data.annotations)) {
        const meta = imgMetaById.get(ann.image_id);
        const target = meta
          ? matchImage(images, strAt(meta, "file_name"))
          : undefined;
        if (!target) continue;
        const cat = catById.get(ann.category_id);
        const cls = cat
          ? byName.get(strAt(cat, "name").toLowerCase())
          : undefined;
        if (!cls) continue;
        const bbox = Array.isArray(ann.bbox) ? ann.bbox : [];
        const [x, y, w, h] = bbox as unknown[];
        if (
          ![x, y, w, h].every((n) => typeof n === "number" && Number.isFinite(n))
        )
          continue;
        boxes[target.id].push({
          id: newBoxId(),
          classId: cls.id,
          x: x as number,
          y: y as number,
          w: w as number,
          h: h as number,
        });
      }
    } else {
      for (const im of asArray(data.images)) {
        const target = matchImage(
          images,
          strAt(im, "file") || strAt(im, "file_name"),
        );
        if (!target) continue;
        for (const b of asArray(im.boxes)) {
          const cls = byName.get(strAt(b, "class").toLowerCase());
          if (!cls) continue;
          const x = numAt(b, "x");
          const y = numAt(b, "y");
          const w = numAt(b, "w");
          const h = numAt(b, "h");
          if (x == null || y == null || w == null || h == null) continue;
          boxes[target.id].push({ id: newBoxId(), classId: cls.id, x, y, w, h });
        }
        for (const cn of asArray(im.classifications)) {
          const label =
            typeof cn === "string" ? cn : strAt(cn as JsonRecord, "class");
          const cls = byName.get(label.toLowerCase());
          if (cls) classifications[target.id].push(cls.id);
        }
      }
    }
    onProgress?.(1, 1, "done");
    return { classes: classDefs, boxes, classifications, format };
  }

  if (format === "csv" || format === "jsonl") {
    onProgress?.(0, 1, format);
    const sharedName =
      SHARED_LABEL_FILES[format].find((n) => labelNames.has(n)) ?? null;
    const text = sharedName
      ? await readLabelFile(labelsDir, sharedName)
      : null;
    if (!text) {
      onProgress?.(1, 1, "done");
      return { classes: [], boxes, classifications, format };
    }

    const order: string[] = [];
    const seen = new Set<string>();
    const addName = (n: string) => {
      const v = String(n ?? "").trim();
      if (!v) return;
      const key = v.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        order.push(v);
      }
    };

    type Row = { file: string; labels: string[] };
    const rows: Row[] = [];

    if (format === "jsonl") {
      for (const line of text.split(/\r?\n/)) {
        const s = line.trim();
        if (!s) continue;
        try {
          const obj = JSON.parse(s) as JsonRecord;
          const rawLabels = Array.isArray(obj.labels) ? obj.labels : [];
          const labels = rawLabels.map((l) => String(l));
          labels.forEach(addName);
          rows.push({ file: strAt(obj, "file"), labels });
        } catch {
          /* skip */
        }
      }
    } else {
      const lines = text.split(/\r?\n/);
      const start = /^filename\s*,\s*labels/i.test(lines[0]?.trim() ?? "")
        ? 1
        : 0;
      for (let i = start; i < lines.length; i++) {
        const raw = lines[i];
        if (!raw || !raw.trim()) continue;
        const cols = parseCsvLine(raw);
        const file = (cols[0] ?? "").trim();
        const labelsStr = (cols[1] ?? "").trim();
        const labels = labelsStr
          ? labelsStr.split(";").map((s) => s.trim()).filter(Boolean)
          : [];
        labels.forEach(addName);
        rows.push({ file, labels });
      }
    }

    const classDefs = buildClassDefs(order);
    const byName = new Map(classDefs.map((c) => [c.name.toLowerCase(), c]));
    for (const r of rows) {
      const target = matchImage(images, r.file);
      if (!target) continue;
      for (const l of r.labels) {
        const cls = byName.get(l.toLowerCase());
        if (cls) classifications[target.id].push(cls.id);
      }
    }
    onProgress?.(1, 1, "done");
    return { classes: classDefs, boxes, classifications, format };
  }

  onProgress?.(1, 1, "done");
  return { classes: [], boxes, classifications, format };
}

export function boxesToYolo(
  boxes: BoundingBox[],
  classes: ClassDef[],
  width: number,
  height: number,
): string {
  const idxOf = new Map(classes.map((c, i) => [c.id, i]));
  const lines = boxes.map((b) => {
    const i = idxOf.get(b.classId);
    if (i == null) return null;
    const cx = (b.x + b.w / 2) / width;
    const cy = (b.y + b.h / 2) / height;
    const w = b.w / width;
    const h = b.h / height;
    return `${i} ${cx.toFixed(6)} ${cy.toFixed(6)} ${w.toFixed(6)} ${h.toFixed(6)}`;
  });
  return lines.filter(Boolean).join("\n");
}

export function boxesToCoco(
  images: ImageFile[],
  allBoxes: Record<string, BoundingBox[]>,
  classes: ClassDef[],
): string {
  const cocoImages = images.map((img, i) => ({
    id: i + 1,
    file_name: img.name,
    width: img.width,
    height: img.height,
  }));
  const categories = classes.map((c, i) => ({
    id: i + 1,
    name: c.name,
    supercategory: "object",
  }));
  const idMap = new Map(images.map((img, i) => [img.id, i + 1]));
  const clsId = new Map(classes.map((c, i) => [c.id, i + 1]));

  const annotations: object[] = [];
  let annId = 1;
  for (const img of images) {
    const boxes = allBoxes[img.id] ?? [];
    for (const b of boxes) {
      annotations.push({
        id: annId++,
        image_id: idMap.get(img.id),
        category_id: clsId.get(b.classId),
        bbox: [b.x, b.y, b.w, b.h],
        area: b.w * b.h,
        iscrowd: 0,
      });
    }
  }
  return JSON.stringify(
    {
      info: { description: "Exported from Box2Box" },
      images: cocoImages,
      categories,
      annotations,
    },
    null,
    2,
  );
}

export function boxesToVoc(
  img: ImageFile,
  boxes: BoundingBox[],
  classes: ClassDef[],
): string {
  const clsName = new Map(classes.map((c) => [c.id, c.name]));
  const objects = boxes
    .map((b) => {
      const name = clsName.get(b.classId) ?? "unknown";
      const xmin = Math.round(b.x);
      const ymin = Math.round(b.y);
      const xmax = Math.round(b.x + b.w);
      const ymax = Math.round(b.y + b.h);
      return `  <object>
    <name>${escapeXml(name)}</name>
    <pose>Unspecified</pose>
    <truncated>0</truncated>
    <difficult>0</difficult>
    <bndbox>
      <xmin>${xmin}</xmin>
      <ymin>${ymin}</ymin>
      <xmax>${xmax}</xmax>
      <ymax>${ymax}</ymax>
    </bndbox>
  </object>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<annotation>
  <filename>${escapeXml(img.name)}</filename>
  <size>
    <width>${img.width}</width>
    <height>${img.height}</height>
    <depth>3</depth>
  </size>
  <segmented>0</segmented>
${objects}
</annotation>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function classesToJson(
  images: ImageFile[],
  allBoxes: Record<string, BoundingBox[]>,
  allClassifications: Record<string, string[]>,
  classes: ClassDef[],
): string {
  return JSON.stringify(
    {
      classes: classes.map((c, i) => ({ id: i, name: c.name, color: c.color })),
      images: images.map((img) => ({
        file: img.name,
        width: img.width,
        height: img.height,
        boxes: (allBoxes[img.id] ?? []).map((b) => ({
          class: classes.find((c) => c.id === b.classId)?.name,
          x: b.x,
          y: b.y,
          w: b.w,
          h: b.h,
        })),
        classifications: (allClassifications[img.id] ?? []).map(
          (id) => classes.find((c) => c.id === id)?.name,
        ),
      })),
    },
    null,
    2,
  );
}

// ---- Classification-mode exports (image-level labels, not bounding boxes) ----

export function classificationsToCsv(
  images: ImageFile[],
  allClassifications: Record<string, string[]>,
  classes: ClassDef[],
): string {
  const nameOf = new Map(classes.map((c) => [c.id, c.name]));
  const rows = ["filename,labels"];
  for (const img of images) {
    const labels = (allClassifications[img.id] ?? [])
      .map((id) => nameOf.get(id) ?? "")
      .filter(Boolean);
    const cell = labels.join(";").replace(/"/g, '""');
    rows.push(`"${img.name.replace(/"/g, '""')}","${cell}"`);
  }
  return rows.join("\n");
}

export function classificationsToJsonl(
  images: ImageFile[],
  allClassifications: Record<string, string[]>,
  classes: ClassDef[],
): string {
  const nameOf = new Map(classes.map((c) => [c.id, c.name]));
  return images
    .map((img) => {
      const labels = (allClassifications[img.id] ?? [])
        .map((id) => nameOf.get(id) ?? "")
        .filter(Boolean);
      return JSON.stringify({ file: img.name, labels });
    })
    .join("\n");
}

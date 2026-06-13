import type { BoundingBox, ClassDef, ImageFile } from "../types";
import { readTextFile } from "./filesystem";

function yoloToBox(line: string, classes: ClassDef[]): BoundingBox | null {
  const parts = line.trim().split(/\s+/);
  if (parts.length < 5) return null;
  const cls = Number(parts[0]);
  if (!Number.isInteger(cls) || cls < 0 || cls >= classes.length) return null;
  const cx = Number(parts[1]);
  const cy = Number(parts[2]);
  const w = Number(parts[3]);
  const h = Number(parts[4]);
  if ([cx, cy, w, h].some((n) => !Number.isFinite(n))) return null;
  return {
    id: `b-${Math.random().toString(36).slice(2, 9)}`,
    classId: classes[cls].id,
    x: cx - w / 2,
    y: cy - h / 2,
    w,
    h,
  };
}

function vocToBox(
  xml: string,
  classes: ClassDef[],
): BoundingBox[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  const objs = Array.from(doc.getElementsByTagName("object"));
  const size = doc.getElementsByTagName("size")[0];
  const wEl = size?.getElementsByTagName("width")[0];
  const hEl = size?.getElementsByTagName("height")[0];
  const imgW = Number(wEl?.textContent ?? 0);
  const imgH = Number(hEl?.textContent ?? 0);
  const out: BoundingBox[] = [];
  for (const obj of objs) {
    const name = obj.getElementsByTagName("name")[0]?.textContent ?? "";
    const cls = classes.find(
      (c) => c.name.toLowerCase() === name.toLowerCase(),
    );
    if (!cls) continue;
    const bnd = obj.getElementsByTagName("bndbox")[0];
    if (!bnd) continue;
    const xmin = Number(bnd.getElementsByTagName("xmin")[0]?.textContent ?? 0);
    const ymin = Number(bnd.getElementsByTagName("ymin")[0]?.textContent ?? 0);
    const xmax = Number(bnd.getElementsByTagName("xmax")[0]?.textContent ?? 0);
    const ymax = Number(bnd.getElementsByTagName("ymax")[0]?.textContent ?? 0);
    out.push({
      id: `b-${Math.random().toString(36).slice(2, 9)}`,
      classId: cls.id,
      x: xmin,
      y: ymin,
      w: xmax - xmin,
      h: ymax - ymin,
    });
  }
  // The imgW/H are returned via closure if needed later.
  void imgW;
  void imgH;
  return out;
}

function cocoToBoxes(
  json: string,
  classes: ClassDef[],
): { boxes: BoundingBox[]; classIds: string[] } {
  const data = JSON.parse(json);
  const boxes: BoundingBox[] = [];
  const classIds: string[] = [];
  if (Array.isArray(data?.annotations)) {
    const idToClass = new Map<number, string>();
    if (Array.isArray(data?.categories)) {
      for (const cat of data.categories) {
        const cls = classes.find(
          (c) => c.name.toLowerCase() === String(cat.name ?? "").toLowerCase(),
        );
        if (cls) idToClass.set(cat.id, cls.id);
      }
    }
    for (const ann of data.annotations) {
      const classId = idToClass.get(ann.category_id);
      if (!classId) continue;
      const [x, y, w, h] = ann.bbox ?? [];
      if ([x, y, w, h].some((n: unknown) => typeof n !== "number")) continue;
      boxes.push({
        id: `b-${Math.random().toString(36).slice(2, 9)}`,
        classId,
        x,
        y,
        w,
        h,
      });
      classIds.push(classId);
    }
  }
  if (Array.isArray(data?.classifications)) {
    for (const c of data.classifications) {
      const cls = classes.find(
        (x) => x.name.toLowerCase() === String(c.class ?? "").toLowerCase(),
      );
      if (cls) classIds.push(cls.id);
    }
  }
  return { boxes, classIds };
}

export async function readBoxesForImage(
  img: ImageFile,
  classes: ClassDef[],
): Promise<{ boxes: BoundingBox[]; classifications: string[] }> {
  if (!img.labelHandle) return { boxes: [], classifications: [] };
  const text = await readTextFile(img.labelHandle);
  if (!text.trim()) return { boxes: [], classifications: [] };

  if (img.labelFormat === "yolo") {
    const lines = text.split(/\r?\n/).filter(Boolean);
    const boxes = lines
      .map((l) => yoloToBox(l, classes))
      .filter(Boolean) as BoundingBox[];
    return { boxes, classifications: [] };
  }
  if (img.labelFormat === "voc") {
    return { boxes: vocToBox(text, classes), classifications: [] };
  }
  if (img.labelFormat === "coco" || img.labelFormat === "json") {
    const r = cocoToBoxes(text, classes);
    return { boxes: r.boxes, classifications: r.classIds };
  }
  return { boxes: [], classifications: [] };
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

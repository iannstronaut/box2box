import type { ImageFile, LabelFormat } from "../types";

const IMG_EXTS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "bmp",
  "gif",
  "tif",
  "tiff",
]);

const LABEL_EXTS: Record<LabelFormat, string[]> = {
  yolo: ["txt"],
  coco: ["json"],
  voc: ["xml"],
  json: ["json"],
  csv: ["csv"],
  jsonl: ["jsonl"],
};

function baseName(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? name : name.slice(0, i);
}

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
}

interface PickerOptions {
  mode?: "read" | "readwrite";
}

declare global {
  interface Window {
    showDirectoryPicker?: (
      options?: PickerOptions,
    ) => Promise<FileSystemDirectoryHandle>;
  }
}

export function isFsApiSupported(): boolean {
  return typeof window !== "undefined" && !!window.showDirectoryPicker;
}

export async function pickDirectory(): Promise<FileSystemDirectoryHandle> {
  if (!isFsApiSupported()) {
    throw new Error(
      "File System Access API is not supported in this browser. Use Chrome, Edge, or another Chromium-based browser.",
    );
  }
  return window.showDirectoryPicker!({ mode: "readwrite" });
}

export async function readImageDimensions(
  url: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

async function ensureSubdir(
  parent: FileSystemDirectoryHandle,
  name: string,
): Promise<FileSystemDirectoryHandle> {
  return parent.getDirectoryHandle(name, { create: true });
}

async function listEntries(
  dir: FileSystemDirectoryHandle,
): Promise<string[]> {
  const names: string[] = [];
  // @ts-expect-error - values() is on the standard but TS lib may not have it
  for await (const entry of dir.values()) {
    names.push(entry.name);
  }
  return names;
}

export interface ProjectLayout {
  rootHandle: FileSystemDirectoryHandle;
  imagesDirHandle: FileSystemDirectoryHandle;
  labelsDirHandle: FileSystemDirectoryHandle;
}

export async function loadProjectLayout(
  root: FileSystemDirectoryHandle,
): Promise<ProjectLayout> {
  // Auto-detect common structures.
  // 1) {images, labels}/...
  // 2) {train, val, test}/{images, labels}/...
  // 3) Flat: images and labels at root.
  const entries = await listEntries(root);
  const lower = new Set(entries.map((e) => e.toLowerCase()));

  if (lower.has("images") && lower.has("labels")) {
    const imagesDirHandle = await root.getDirectoryHandle("images");
    const labelsDirHandle = await root.getDirectoryHandle("labels");
    return { rootHandle: root, imagesDirHandle, labelsDirHandle };
  }

  // Check nested split (train/images etc)
  const splitNames = ["train", "val", "valid", "validation", "test"];
  for (const split of splitNames) {
    if (lower.has(split)) {
      const splitDir = await root.getDirectoryHandle(split);
      const inner = await listEntries(splitDir);
      const innerLower = new Set(inner.map((e) => e.toLowerCase()));
      if (innerLower.has("images") && innerLower.has("labels")) {
        // Use first split's images and labels.
        const imagesDirHandle = await splitDir.getDirectoryHandle("images");
        const labelsDirHandle = await splitDir.getDirectoryHandle("labels");
        return { rootHandle: root, imagesDirHandle, labelsDirHandle };
      }
    }
  }

  // Fallback: root is images; create sibling labels dir
  const imagesDirHandle = root;
  let labelsDirHandle: FileSystemDirectoryHandle;
  try {
    labelsDirHandle = await root.getDirectoryHandle("labels");
  } catch {
    labelsDirHandle = await ensureSubdir(root, "labels");
  }
  return { rootHandle: root, imagesDirHandle, labelsDirHandle };
}

export async function readProjectImages(
  layout: ProjectLayout,
): Promise<ImageFile[]> {
  const imagesDir = layout.imagesDirHandle;
  const labelsDir = layout.labelsDirHandle;
  const labelNames = new Set(await listEntries(labelsDir));

  const result: ImageFile[] = [];
  // @ts-expect-error - values() iterator
  for await (const entry of imagesDir.values()) {
    if (entry.kind !== "file") continue;
    if (!IMG_EXTS.has(extOf(entry.name))) continue;
    const handle = entry as FileSystemFileHandle;
    const file = await handle.getFile();
    const url = URL.createObjectURL(file);
    const dims = await readImageDimensions(url).catch(() => ({
      width: 0,
      height: 0,
    }));

    const base = baseName(entry.name);
    let labelHandle: FileSystemFileHandle | null = null;
    let labelFormat: LabelFormat | null = null;
    for (const fmt of ["yolo", "coco", "voc", "json"] as LabelFormat[]) {
      for (const ext of LABEL_EXTS[fmt]) {
        const candidate = `${base}.${ext}`;
        if (labelNames.has(candidate)) {
          try {
            labelHandle = await labelsDir.getFileHandle(candidate);
            labelFormat = fmt;
            break;
          } catch {
            // ignore
          }
        }
      }
      if (labelHandle) break;
    }

    result.push({
      id: base,
      name: entry.name,
      handle,
      file,
      url,
      width: dims.width,
      height: dims.height,
      labelHandle,
      labelFormat,
    });
  }
  result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
}

export async function ensureLabelHandle(
  labelsDir: FileSystemDirectoryHandle,
  base: string,
  format: LabelFormat,
): Promise<FileSystemFileHandle> {
  const ext = LABEL_EXTS[format][0];
  return labelsDir.getFileHandle(`${base}.${ext}`, { create: true });
}

export async function writeTextFile(
  handle: FileSystemFileHandle,
  text: string,
): Promise<void> {
  const writable = await handle.createWritable();
  await writable.write(text);
  await writable.close();
}

export async function readTextFile(handle: FileSystemFileHandle): Promise<string> {
  const file = await handle.getFile();
  return file.text();
}

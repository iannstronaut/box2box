export type AnnotationMode = "detection" | "classification";

export type LabelFormat = "yolo" | "coco" | "voc" | "json";

export type ExportFormat = "yolo" | "coco" | "voc" | "json";

export const UNCLASS_ID = "__unclass__";

export interface ClassDef {
  id: string;
  name: string;
  color: string;
  hotkey?: string;
}

export function isUnclass(classId: string): boolean {
  return classId === UNCLASS_ID;
}

export function getUnclassClass(): ClassDef {
  return {
    id: UNCLASS_ID,
    name: "unclass",
    color: "#888888",
  };
}

export interface BoundingBox {
  id: string;
  classId: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ClassAssignment {
  imageId: string;
  classId: string;
}

export interface ImageFile {
  id: string;
  name: string;
  handle: FileSystemFileHandle;
  file: File;
  url: string;
  width: number;
  height: number;
  labelHandle?: FileSystemFileHandle | null;
  labelFormat?: LabelFormat | null;
}

export interface WorkspaceData {
  mode: AnnotationMode;
  rootHandle: FileSystemDirectoryHandle;
  imagesDirHandle: FileSystemDirectoryHandle;
  labelsDirHandle: FileSystemDirectoryHandle;
  classes: ClassDef[];
  images: ImageFile[];
  boxes: Record<string, BoundingBox[]>;
  classifications: Record<string, string[]>;
}

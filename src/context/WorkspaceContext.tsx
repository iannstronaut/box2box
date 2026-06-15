import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type {
  AnnotationMode,
  BoundingBox,
  ClassDef,
  ImageFile,
  LabelFormat,
} from "../types";
import { UNCLASS_ID, getUnclassClass, isUnclass } from "../types";
import { pickClassColor, uid } from "../utils/id";
import {
  ensureLabelHandle,
  loadProjectLayout,
  pickDirectory,
  readProjectImages,
  writeTextFile,
} from "../utils/filesystem";
import { importDataset } from "../utils/annotations";
import {
  boxesToCoco,
  boxesToVoc,
  boxesToYolo,
  classesToJson,
  classificationsToCsv,
  classificationsToJsonl,
} from "../utils/annotations";

interface WorkspaceState {
  mode: AnnotationMode;
  rootName: string;
  images: ImageFile[];
  classes: ClassDef[];
  boxes: Record<string, BoundingBox[]>;
  classifications: Record<string, string[]>;
  currentImageId: string | null;
  setCurrentImageId: (id: string | null) => void;
  goNext: () => void;
  goPrev: () => void;
  selectedClassId: string | null;
  setSelectedClassId: (id: string | null) => void;
  addClass: (name: string) => ClassDef;
  removeClass: (id: string) => void;
  updateClass: (id: string, patch: Partial<ClassDef>) => void;
  setBoxes: (imageId: string, boxes: BoundingBox[]) => void;
  setBoxClass: (imageId: string, boxId: string, classId: string) => void;
  toggleClassification: (imageId: string, classId: string) => void;
  setExportFormat: (fmt: LabelFormat) => void;
  exportFormat: LabelFormat;
  exportAll: () => Promise<void>;
  exportDataset: (
    fmt: LabelFormat,
  ) => Promise<{ savedToFolder: boolean; fileCount: number }>;
  isExporting: boolean;
  exportProgress: { done: number; total: number; label: string } | null;
  isImporting: boolean;
  importProgress: {
    done: number;
    total: number;
    label: string;
    phase: string;
  } | null;
  openFromPicker: (mode: AnnotationMode) => Promise<void>;
  loadDemo: (mode: AnnotationMode) => void;
  reset: () => void;
  status: string;
  setStatus: (s: string) => void;
  isReady: boolean;
  hasFileSystem: boolean;
  appendImages: (imgs: ImageFile[]) => void;
}

const Ctx = createContext<WorkspaceState | null>(null);

export function useWorkspace() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AnnotationMode>("detection");
  const [rootName, setRootName] = useState<string>("");
  const [images, setImages] = useState<ImageFile[]>([]);
  const [classes, setClasses] = useState<ClassDef[]>([getUnclassClass()]);
  const [boxes, setBoxesMap] = useState<Record<string, BoundingBox[]>>({});
  const [classifications, setClassMap] = useState<Record<string, string[]>>({});
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(UNCLASS_ID);
  const [exportFormat, setExportFormat] = useState<LabelFormat>("yolo");
  const [status, setStatus] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{
    done: number;
    total: number;
    label: string;
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{
    done: number;
    total: number;
    label: string;
    phase: string;
  } | null>(null);
  const layoutRef = useRef<Awaited<ReturnType<typeof loadProjectLayout>> | null>(
    null,
  );

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isReady = images.length > 0;

  const setBoxes = (imageId: string, next: BoundingBox[]) => {
    setBoxesMap((m) => ({ ...m, [imageId]: next }));
  };

  const toggleClassification = (imageId: string, classId: string) => {
    setClassMap((m) => {
      const cur = new Set(m[imageId] ?? []);
      if (cur.has(classId)) cur.delete(classId);
      else cur.add(classId);
      return { ...m, [imageId]: Array.from(cur) };
    });
  };

  const addClass = (name: string): ClassDef => {
    const cls: ClassDef = {
      id: uid(),
      name,
      color: pickClassColor(classes.length, classes),
    };
    setClasses((c) => [...c, cls]);
    return cls;
  };

  const updateClass = (id: string, patch: Partial<ClassDef>) => {
    setClasses((c) => c.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const removeClass = (id: string) => {
    setClasses((c) => c.filter((x) => x.id !== id));
    // Deleting the "unclass" default just removes it from the list; boxes still
    // referencing it show as unassigned until reclassified.
    if (isUnclass(id)) {
      if (selectedClassId === id) {
        const remaining = classes.filter(
          (x) => x.id !== id && !isUnclass(x.id),
        );
        setSelectedClassId(remaining[0]?.id ?? UNCLASS_ID);
      }
      return;
    }
    // Remove from boxes (re-assign to unclass instead of deleting)
    setBoxesMap((m) => {
      const out: Record<string, BoundingBox[]> = {};
      for (const k of Object.keys(m)) {
        out[k] = m[k].map((b) =>
          b.classId === id ? { ...b, classId: UNCLASS_ID } : b,
        );
      }
      return out;
    });
    setClassMap((m) => {
      const out: Record<string, string[]> = {};
      for (const k of Object.keys(m)) {
        out[k] = (m[k] ?? []).map((cid) => (cid === id ? UNCLASS_ID : cid));
      }
      return out;
    });
    if (selectedClassId === id) setSelectedClassId(UNCLASS_ID);
  };

  // Re-assign box class (used in right sidebar)
  const setBoxClass = (imageId: string, boxId: string, classId: string) => {
    setBoxesMap((m) => {
      const cur = m[imageId] ?? [];
      return {
        ...m,
        [imageId]: cur.map((b) =>
          b.id === boxId ? { ...b, classId } : b,
        ),
      };
    });
  };

  const openFromPicker = async (m: AnnotationMode) => {
    setMode(m);
    setIsImporting(true);
    setImportProgress({ done: 0, total: 1, label: "", phase: "folder" });
    try {
      setStatus("Choosing a folder…");
      const root = await pickDirectory();
      setRootName(root.name);
      const layout = await loadProjectLayout(root);
      layoutRef.current = layout;

      // Let the overlay paint before heavy work begins.
      await new Promise((r) => setTimeout(r, 60));

      setStatus("Reading images…");
      setImportProgress({ done: 0, total: 1, label: "", phase: "images" });
      const imgs = await readProjectImages(layout, (done, total, label) => {
        setImportProgress({ done, total, label, phase: "images" });
      });
      setImages(imgs);

      setStatus("Detecting labels…");
      setImportProgress({
        done: 0,
        total: imgs.length || 1,
        label: "",
        phase: "labels",
      });
      const imported = await importDataset(
        layout.labelsDirHandle,
        imgs,
        (done, total, label) => {
          setImportProgress({ done, total, label, phase: "labels" });
        },
      );

      if (imported.classes.length > 0) {
        setClasses(imported.classes);
        setSelectedClassId(imported.classes[0].id);
      } else {
        setClasses([getUnclassClass()]);
        setSelectedClassId(UNCLASS_ID);
      }
      setBoxesMap(imported.boxes);
      setClassMap(imported.classifications);

      const detectedFmt = imported.format;
      const isClassificationFmt =
        detectedFmt === "csv" || detectedFmt === "jsonl";
      setMode(isClassificationFmt ? "classification" : "detection");
      setExportFormat(
        (detectedFmt as LabelFormat) ??
          (isClassificationFmt ? "csv" : "yolo"),
      );

      const fmtLabel = detectedFmt ? ` (${detectedFmt})` : "";
      setStatus(
        `Loaded ${imgs.length} images${fmtLabel}` +
          (imported.classes.length
            ? `, ${imported.classes.length} classes`
            : ""),
      );
      if (imgs.length > 0) setCurrentImageId(imgs[0].id);
    } finally {
      setIsImporting(false);
      setImportProgress(null);
    }
  };

  const loadDemo = (m: AnnotationMode) => {
    setMode(m);
    setRootName("Demo project");
    setExportFormat(m === "classification" ? "csv" : "yolo");
    const demoClasses: ClassDef[] = [
      getUnclassClass(),
      { id: "c1", name: "car", color: "#1c69d4" },
      { id: "c2", name: "person", color: "#e22718" },
      { id: "c3", name: "traffic sign", color: "#0fa336" },
    ];
    setClasses(demoClasses);
    const demos = [
      {
        id: "demo-1",
        name: "scene_001.jpg",
        w: 1280,
        h: 720,
        boxes: [
          { id: "b1", classId: "c1", x: 120, y: 280, w: 360, h: 220 },
          { id: "b2", classId: "c2", x: 700, y: 300, w: 100, h: 280 },
          { id: "b1u", classId: UNCLASS_ID, x: 940, y: 360, w: 180, h: 200 },
        ],
      },
      {
        id: "demo-2",
        name: "scene_002.jpg",
        w: 1280,
        h: 720,
        boxes: [
          { id: "b3", classId: "c3", x: 400, y: 100, w: 200, h: 200 },
          { id: "b4", classId: "c1", x: 800, y: 350, w: 320, h: 200 },
        ],
      },
      {
        id: "demo-3",
        name: "scene_003.jpg",
        w: 1280,
        h: 720,
        boxes: [
          { id: "b5", classId: "c2", x: 250, y: 200, w: 120, h: 360 },
        ],
      },
    ];
    const imgs: ImageFile[] = demos.map((d) => ({
      id: d.id,
      name: d.name,
      handle: {} as FileSystemFileHandle,
      file: new File([], d.name),
      url: generateSvgPlaceholder(d.name, d.w, d.h),
      width: d.w,
      height: d.h,
      labelHandle: null,
      labelFormat: null,
    }));
    setImages(imgs);
    const b: Record<string, BoundingBox[]> = {};
    for (const d of demos) b[d.id] = d.boxes;
    setBoxesMap(b);
    setClassMap({});
    setCurrentImageId(imgs[0].id);
    setSelectedClassId("c1");
    setStatus("Demo loaded");
  };

  const buildBlobs = (
    fmt: LabelFormat,
  ): { name: string; mime: string; data: BlobPart }[] => {
    const out: { name: string; mime: string; data: BlobPart }[] = [];
    if (fmt === "yolo") {
      out.push({
        name: "classes.txt",
        mime: "text/plain",
        data: classes.map((c) => c.name).join("\n"),
      });
      for (const img of images) {
        out.push({
          name: `${img.id}.txt`,
          mime: "text/plain",
          data: boxesToYolo(
            boxes[img.id] ?? [],
            classes,
            img.width,
            img.height,
          ),
        });
      }
    } else if (fmt === "voc") {
      for (const img of images) {
        out.push({
          name: `${img.id}.xml`,
          mime: "application/xml",
          data: boxesToVoc(img, boxes[img.id] ?? [], classes),
        });
      }
    } else if (fmt === "coco") {
      out.push({
        name: "_annotations.coco.json",
        mime: "application/json",
        data: boxesToCoco(images, boxes, classes),
      });
    } else if (fmt === "csv") {
      out.push({
        name: "labels.csv",
        mime: "text/csv",
        data: classificationsToCsv(images, classifications, classes),
      });
    } else if (fmt === "jsonl") {
      out.push({
        name: "labels.jsonl",
        mime: "application/x-ndjson",
        data: classificationsToJsonl(images, classifications, classes),
      });
    } else {
      out.push({
        name: "labels.json",
        mime: "application/json",
        data: classesToJson(images, boxes, classifications, classes),
      });
    }
    return out;
  };

  const downloadBlob = (data: BlobPart, name: string, mime: string) => {
    const blob = new Blob([data], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const writeToFolder = async (fmt: LabelFormat): Promise<number> => {
    const labelsDir = layoutRef.current!.labelsDirHandle;
    let count = 0;
    if (fmt === "yolo") {
      try {
        const clsFile = await labelsDir.getFileHandle("classes.txt", {
          create: true,
        });
        await writeTextFile(clsFile, classes.map((c) => c.name).join("\n"));
      } catch (e) {
        console.error(e);
      }
      let done = 0;
      for (const img of images) {
        setExportProgress({
          done,
          total: images.length,
          label: `Writing ${img.name}`,
        });
        const txt = boxesToYolo(
          boxes[img.id] ?? [],
          classes,
          img.width,
          img.height,
        );
        const h = await ensureLabelHandle(labelsDir, img.id, "yolo");
        await writeTextFile(h, txt);
        done += 1;
        count += 1;
      }
    } else if (fmt === "voc") {
      let done = 0;
      for (const img of images) {
        setExportProgress({
          done,
          total: images.length,
          label: `Writing ${img.name}`,
        });
        const xml = boxesToVoc(img, boxes[img.id] ?? [], classes);
        const h = await ensureLabelHandle(labelsDir, img.id, "voc");
        await writeTextFile(h, xml);
        done += 1;
        count += 1;
      }
    } else if (fmt === "coco") {
      setExportProgress({ done: 0, total: 1, label: "Writing COCO JSON" });
      const json = boxesToCoco(images, boxes, classes);
      const h = await labelsDir.getFileHandle("_annotations.coco.json", {
        create: true,
      });
      await writeTextFile(h, json);
      count = 1;
    } else if (fmt === "csv") {
      setExportProgress({ done: 0, total: 1, label: "Writing labels.csv" });
      const csv = classificationsToCsv(images, classifications, classes);
      const h = await labelsDir.getFileHandle("labels.csv", { create: true });
      await writeTextFile(h, csv);
      count = 1;
    } else if (fmt === "jsonl") {
      setExportProgress({ done: 0, total: 1, label: "Writing labels.jsonl" });
      const jsonl = classificationsToJsonl(images, classifications, classes);
      const h = await labelsDir.getFileHandle("labels.jsonl", { create: true });
      await writeTextFile(h, jsonl);
      count = 1;
    } else {
      setExportProgress({ done: 0, total: 1, label: "Writing labels.json" });
      const json = classesToJson(images, boxes, classifications, classes);
      const h = await labelsDir.getFileHandle("labels.json", { create: true });
      await writeTextFile(h, json);
      count = 1;
    }
    return count;
  };

  const exportDataset = async (
    fmt: LabelFormat,
  ): Promise<{ savedToFolder: boolean; fileCount: number }> => {
    setIsExporting(true);
    setExportProgress({
      done: 0,
      total: images.length || 1,
      label: "Preparing files",
    });
    // Let the overlay paint before heavy work begins.
    await new Promise((r) => setTimeout(r, 280));
    try {
      if (layoutRef.current) {
        const fileCount = await writeToFolder(fmt);
        setExportProgress({
          done: fileCount,
          total: fileCount || 1,
          label: "Finishing up",
        });
        setStatus(`Exported to /${layoutRef.current.labelsDirHandle.name}/`);
        await new Promise((r) => setTimeout(r, 450));
        return { savedToFolder: true, fileCount };
      }
      const blobs = buildBlobs(fmt);
      let done = 0;
      for (const b of blobs) {
        setExportProgress({
          done,
          total: blobs.length,
          label: `Saving ${b.name}`,
        });
        downloadBlob(b.data, b.name, b.mime);
        done += 1;
        await new Promise((r) => setTimeout(r, 140));
      }
      setExportProgress({
        done: blobs.length,
        total: blobs.length,
        label: "Done",
      });
      setStatus(
        `Downloaded ${blobs.length} file${blobs.length === 1 ? "" : "s"}`,
      );
      await new Promise((r) => setTimeout(r, 450));
      return { savedToFolder: false, fileCount: blobs.length };
    } finally {
      setExportProgress(null);
      setIsExporting(false);
    }
  };

  const exportAll = async () => {
    if (!layoutRef.current && images.length === 0) {
      setStatus("Nothing to export yet.");
      return;
    }
    await exportDataset(exportFormat);
  };

  const reset = () => {
    images.forEach((img) => URL.revokeObjectURL(img.url));
    setImages([]);
    setBoxesMap({});
    setClassMap({});
    setClasses([getUnclassClass()]);
    setSelectedClassId(UNCLASS_ID);
    setCurrentImageId(null);
    setRootName("");
    layoutRef.current = null;
    setStatus("");
  };

  const value = useMemo<WorkspaceState>(
    () => ({
      mode,
      rootName,
      images,
      classes,
      boxes,
      classifications,
      currentImageId,
      setCurrentImageId,
      goNext: () => {
        const i = images.findIndex((x) => x.id === currentImageId);
        if (i === -1) return;
        const next = images[i + 1];
        if (next) setCurrentImageId(next.id);
      },
      goPrev: () => {
        const i = images.findIndex((x) => x.id === currentImageId);
        if (i <= 0) return;
        const prev = images[i - 1];
        if (prev) setCurrentImageId(prev.id);
      },
      selectedClassId,
      setSelectedClassId,
      addClass,
      removeClass,
      updateClass,
      setBoxes,
      setBoxClass,
      toggleClassification,
      exportFormat,
      setExportFormat,
      exportAll,
      exportDataset,
      isExporting,
      exportProgress,
      isImporting,
      importProgress,
      openFromPicker,
      loadDemo,
      reset,
      status,
      setStatus,
      isReady,
      hasFileSystem: layoutRef.current !== null,
      appendImages: (imgs: ImageFile[]) => {
        setImages((cur) => [...cur, ...imgs]);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, rootName, images, classes, boxes, classifications, currentImageId, selectedClassId, exportFormat, status, isReady, isExporting, exportProgress, isImporting, importProgress],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function generateSvgPlaceholder(name: string, w: number, h: number): string {
  const hue = (name.charCodeAt(0) * 37) % 360;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='hsl(${hue}, 30%, 18%)'/>
        <stop offset='1' stop-color='hsl(${(hue + 40) % 360}, 40%, 8%)'/>
      </linearGradient>
    </defs>
    <rect width='${w}' height='${h}' fill='url(#g)'/>
    <g fill='rgba(255,255,255,0.05)'>
      <rect x='0' y='${h * 0.7}' width='${w}' height='${h * 0.3}'/>
      <circle cx='${w * 0.7}' cy='${h * 0.25}' r='${Math.min(w, h) * 0.1}'/>
    </g>
    <text x='50%' y='50%' text-anchor='middle' font-family='Inter, sans-serif' font-size='${Math.min(w, h) * 0.08}' fill='rgba(255,255,255,0.4)' font-weight='700'>${name.toUpperCase()}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

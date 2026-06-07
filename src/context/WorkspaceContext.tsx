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
import { readBoxesForImage } from "../utils/annotations";
import {
  boxesToCoco,
  boxesToVoc,
  boxesToYolo,
  classesToJson,
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

  // Load any existing labels for images once classes are available
  useEffect(() => {
    if (!isReady) return;
    let cancelled = false;
    (async () => {
      // Try to find a classes.txt inside labels dir
      try {
        const labelsDir = layoutRef.current?.labelsDirHandle;
        if (labelsDir) {
          try {
            const classesFile = await labelsDir.getFileHandle("classes.txt");
            const f = await classesFile.getFile();
            const text = await f.text();
            const names = text
              .split(/\r?\n/)
              .map((s) => s.trim())
              .filter(Boolean);
            if (names.length && classes.length === 0) {
              const imported: ClassDef[] = names.map((n, i) => ({
                id: uid(),
                name: n,
                color: pickClassColor(i, []),
              }));
              if (!cancelled) setClasses(imported);
            }
          } catch {
            /* not present */
          }
        }
      } catch {
        /* noop */
      }

      const next: Record<string, BoundingBox[]> = {};
      const nextCls: Record<string, string[]> = {};
      for (const img of images) {
        const r = await readBoxesForImage(img, classes);
        next[img.id] = r.boxes;
        nextCls[img.id] = r.classifications;
      }
      if (cancelled) return;
      setBoxesMap(next);
      setClassMap(nextCls);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, classes.length === 0]);

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
    if (isUnclass(id)) return; // can't remove unclass
    setClasses((c) => c.filter((x) => x.id !== id));
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
    setStatus("PICKING DIRECTORY…");
    const root = await pickDirectory();
    setRootName(root.name);
    const layout = await loadProjectLayout(root);
    layoutRef.current = layout;
    setStatus("READING IMAGES…");
    const imgs = await readProjectImages(layout);
    setImages(imgs);
    setStatus(`LOADED ${imgs.length} IMAGES`);
    if (imgs.length > 0) setCurrentImageId(imgs[0].id);
  };

  const loadDemo = (m: AnnotationMode) => {
    setMode(m);
    setRootName("DEMO PROJECT");
    setExportFormat("yolo");
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
    setStatus("DEMO LOADED");
  };

  const exportAll = async () => {
    if (!layoutRef.current) {
      setStatus("CANNOT EXPORT: NO LOCAL FOLDER. USE DEMO TO PREVIEW.");
      return;
    }
    setStatus("EXPORTING…");
    const labelsDir = layoutRef.current.labelsDirHandle;
    if (exportFormat === "yolo") {
      // Also write classes.txt
      try {
        const clsFile = await labelsDir.getFileHandle("classes.txt", {
          create: true,
        });
        await writeTextFile(
          clsFile,
          classes.map((c) => c.name).join("\n"),
        );
      } catch (e) {
        console.error(e);
      }
    }
    for (const img of images) {
      const imgBoxes = boxes[img.id] ?? [];
      if (exportFormat === "yolo") {
        const txt = boxesToYolo(imgBoxes, classes, img.width, img.height);
        const h = await ensureLabelHandle(labelsDir, img.id, "yolo");
        await writeTextFile(h, txt);
      } else if (exportFormat === "voc") {
        const xml = boxesToVoc(img, imgBoxes, classes);
        const h = await ensureLabelHandle(labelsDir, img.id, "voc");
        await writeTextFile(h, xml);
      } else if (exportFormat === "coco") {
        // One COCO JSON per project
        const json = boxesToCoco(images, boxes, classes);
        const h = await labelsDir.getFileHandle("_annotations.coco.json", {
          create: true,
        });
        await writeTextFile(h, json);
        break;
      } else if (exportFormat === "json") {
        const json = classesToJson(images, boxes, classifications, classes);
        const h = await labelsDir.getFileHandle("labels.json", {
          create: true,
        });
        await writeTextFile(h, json);
        break;
      }
    }
    setStatus(`EXPORTED TO /${layoutRef.current.labelsDirHandle.name}/`);
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
    [mode, rootName, images, classes, boxes, classifications, currentImageId, selectedClassId, exportFormat, status, isReady],
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

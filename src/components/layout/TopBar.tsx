import { useRef, useState } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { Button } from "../common/Primitives";
import { MStripe } from "../common/MStripe";
import {
  IconChevronLeft,
  IconChevronRight,
  IconUpload,
  IconDownload,
  IconBox,
  IconImage,
  IconClose,
  IconPlus,
} from "../common/Icons";
import { clsx } from "../../utils/id";
import type { LabelFormat } from "../../types";
import {
  boxesToCoco,
  boxesToYolo,
  boxesToVoc,
  classesToJson,
} from "../../utils/annotations";
import b2bLight from "/b2b-light.png";
import b2bDark from "/b2b-dark.png";
import { useTheme } from "../../context/ThemeContext";
import { ThemeToggle } from "../common/ThemeToggle";

export function TopBar() {
  const ws = useWorkspace();
  const { resolved } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const current = ws.images.find((i) => i.id === ws.currentImageId);
  const idx = ws.images.findIndex((i) => i.id === ws.currentImageId);
  const totalBoxes = Object.values(ws.boxes).reduce((n, a) => n + a.length, 0);
  const taggedImages = Object.values(ws.classifications).filter(
    (a) => a.length > 0,
  ).length;

  const onImportClasses = async (f: File) => {
    const text = await f.text();
    const names = text
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    for (const n of names) {
      if (!ws.classes.some((c) => c.name.toLowerCase() === n.toLowerCase())) {
        ws.addClass(n);
      }
    }
  };

  const onImportImages = async (files: FileList | null) => {
    if (!files) return;
    const newImages = await Promise.all(
      Array.from(files)
        .filter((f) => f.type.startsWith("image/"))
        .map(async (file) => {
          const url = URL.createObjectURL(file);
          const dims = await new Promise<{ w: number; h: number }>((resolve) => {
            const img = new Image();
            img.onload = () =>
              resolve({ w: img.naturalWidth, h: img.naturalHeight });
            img.onerror = () => resolve({ w: 0, h: 0 });
            img.src = url;
          });
          return {
            id: file.name.replace(/\.[^.]+$/, "") + "-" + Math.random().toString(36).slice(2, 6),
            name: file.name,
            handle: {} as FileSystemFileHandle,
            file,
            url,
            width: dims.w,
            height: dims.h,
            labelHandle: null,
            labelFormat: null,
          };
        }),
    );
    ws.appendImages(newImages);
  };

  return (
    <header className="bg-canvas/80 backdrop-blur-glass border-b border-hairline z-20">
      <MStripe />
      <div className="h-12 flex items-center px-4 gap-4">
        <div className="flex items-center gap-2.5 shrink-0">
          <img
            src={resolved === "dark" ? b2bLight : b2bDark}
            alt="Box2Box"
            className="h-7 w-7 object-contain"
            draggable={false}
          />
          <span className="font-display text-on-dark text-[14px] tracking-[0.2em]">
            BOX2BOX
          </span>
        </div>

        <div className="h-6 w-px bg-hairline" />

        <div className="flex items-center gap-3 min-w-0">
          <span className="type-label text-on-dark truncate max-w-[200px]">
            {ws.rootName}
          </span>
          <span
            className={clsx(
              "type-label px-2 py-1 flex items-center gap-1.5 border",
              ws.mode === "detection"
                ? "border-m-blue-dark/40 text-m-blue-dark"
                : "border-m-red/40 text-m-red",
            )}
          >
            {ws.mode === "detection" ? <IconBox size={11} /> : <IconImage size={11} />}
            {ws.mode === "detection" ? "DETECTION" : "CLASSIFICATION"}
          </span>
        </div>

        <div className="h-6 w-px bg-white/10" />

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={ws.goPrev}
            disabled={idx <= 0}
            className="btn-icon !w-9 !h-9 disabled:opacity-30"
            aria-label="Previous image"
            title="Previous ( [ or P )"
          >
            <IconChevronLeft size={16} />
          </button>
          <div className="glass-soft px-3 h-9 flex items-center gap-2 min-w-[120px] justify-center">
            <span className="type-label text-on-dark tabular-nums">
              {idx >= 0 ? idx + 1 : 0}
            </span>
            <span className="text-muted text-caption">/</span>
            <span className="text-caption text-muted tabular-nums">
              {ws.images.length}
            </span>
            {current && (
              <span className="text-caption text-muted truncate ml-2 hidden md:inline max-w-[200px]">
                {current.name}
              </span>
            )}
          </div>
          <button
            onClick={ws.goNext}
            disabled={idx === -1 || idx >= ws.images.length - 1}
            className="btn-icon !w-9 !h-9 disabled:opacity-30"
            aria-label="Next image"
            title="Next ( ] or N )"
          >
            <IconChevronRight size={16} />
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-caption text-muted">
          <span className="w-1.5 h-1.5 bg-success" />
          <span>
            {ws.mode === "detection"
              ? `${totalBoxes} BOXES · ${ws.classes.length} CLASSES`
              : `${taggedImages} TAGGED · ${ws.classes.length} CLASSES`}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <ThemeToggle size="sm" />
          <div className="h-6 w-px bg-hairline" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => importRef.current?.click()}
            title="Import classes from .txt"
          >
            <IconUpload size={14} className="mr-2" />
            IMPORT
          </Button>
          <input
            ref={importRef}
            type="file"
            accept=".txt,text/plain"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImportClasses(f);
              e.target.value = "";
            }}
          />

          <div className="relative">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setExportOpen((v) => !v)}
              title="Export dataset (Ctrl+S)"
            >
              <IconDownload size={14} className="mr-2" />
              EXPORT
            </Button>
            {exportOpen && (
              <ExportDropdown onClose={() => setExportOpen(false)} />
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileRef.current?.click()}
            title="Add more image files"
          >
            <IconPlus size={14} className="mr-2" />
            ADD
          </Button>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => onImportImages(e.target.files)}
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Close workspace and return to landing?")) {
                ws.reset();
                window.location.href = "/";
              }
            }}
            title="Close workspace"
          >
            <IconClose size={14} />
          </Button>
        </div>
      </div>
    </header>
  );
}

function ExportDropdown({ onClose }: { onClose: () => void }) {
  const ws = useWorkspace();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const exportDirect = async (fmt: LabelFormat) => {
    setBusy(true);
    setResult(null);
    try {
      if (ws.hasFileSystem) {
        await ws.exportAll();
        setResult(`EXPORTED TO /LABELS/`);
      } else {
        const blobs = buildBlobs(fmt, ws);
        for (const b of blobs) {
          downloadBlob(b.data, b.name, b.mime);
        }
        setResult(
          `DOWNLOADED ${blobs.length} FILE${blobs.length === 1 ? "" : "S"}`,
        );
      }
    } catch (e) {
      setResult("ERROR: " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="absolute right-0 top-full mt-2 w-80 glass-strong z-30 animate-scale-in"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4 border-b border-hairline">
        <div className="type-label text-on-dark">EXPORT FORMAT</div>
        <div className="text-caption text-muted mt-1">
          {ws.hasFileSystem
            ? "WRITES DIRECTLY TO YOUR /LABELS FOLDER"
            : "NO FOLDER OPENED — FILES WILL DOWNLOAD"}
        </div>
      </div>
      <div className="p-2">
        {(
          [
            { id: "yolo" as const, label: "YOLO", ext: ".txt + classes.txt" },
            { id: "coco" as const, label: "COCO", ext: "_annotations.coco.json" },
            { id: "voc" as const, label: "Pascal VOC", ext: ".xml per image" },
            { id: "json" as const, label: "JSON", ext: "labels.json" },
          ]
        ).map((f) => (
          <button
            key={f.id}
            disabled={busy}
            onClick={() => exportDirect(f.id)}
            className="w-full text-left p-3 hover:bg-[var(--tint-a)] flex items-center justify-between group disabled:opacity-50"
          >
            <div>
              <div className="font-display text-on-dark text-[14px]">
                {f.label}
              </div>
              <div className="text-caption text-muted">{f.ext}</div>
            </div>
            <IconDownload
              size={14}
              className="text-muted group-hover:text-on-dark"
            />
          </button>
        ))}
      </div>
      {result && (
        <div className="px-4 py-3 border-t border-hairline text-caption text-m-blue-dark">
          {result}
        </div>
      )}
      <button
        onClick={onClose}
        className="w-full p-3 text-caption text-muted hover:text-on-dark border-t border-hairline"
      >
        CLOSE
      </button>
    </div>
  );
}

function buildBlobs(
  fmt: LabelFormat,
  ws: ReturnType<typeof useWorkspace>,
): { name: string; mime: string; data: BlobPart }[] {
  const out: { name: string; mime: string; data: BlobPart }[] = [];
  if (fmt === "yolo") {
    out.push({
      name: "classes.txt",
      mime: "text/plain",
      data: ws.classes.map((c) => c.name).join("\n"),
    });
    for (const img of ws.images) {
      const txt = boxesToYolo(
        ws.boxes[img.id] ?? [],
        ws.classes,
        img.width,
        img.height,
      );
      out.push({ name: `${img.id}.txt`, mime: "text/plain", data: txt });
    }
  } else if (fmt === "voc") {
    for (const img of ws.images) {
      const xml = boxesToVoc(img, ws.boxes[img.id] ?? [], ws.classes);
      out.push({ name: `${img.id}.xml`, mime: "application/xml", data: xml });
    }
  } else if (fmt === "coco") {
    const json = boxesToCoco(ws.images, ws.boxes, ws.classes);
    out.push({
      name: "_annotations.coco.json",
      mime: "application/json",
      data: json,
    });
  } else {
    const json = classesToJson(
      ws.images,
      ws.boxes,
      ws.classifications,
      ws.classes,
    );
    out.push({ name: "labels.json", mime: "application/json", data: json });
  }
  return out;
}

function downloadBlob(data: BlobPart, name: string, mime: string) {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

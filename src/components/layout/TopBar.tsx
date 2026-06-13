import { useEffect, useRef, useState } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { Button } from "../common/Primitives";
import {
  IconChevronLeft,
  IconChevronRight,
  IconUpload,
  IconDownload,
  IconBox,
  IconImage,
  IconClose,
  IconPlus,
  IconCheck,
} from "../common/Icons";
import { clsx } from "../../utils/id";
import type { LabelFormat } from "../../types";
import b2bLight from "/b2b-light.png";
import b2bDark from "/b2b-dark.png";
import { useTheme } from "../../context/ThemeContext";
import { ThemeToggle } from "../common/ThemeToggle";
import { LocaleToggle } from "../common/LocaleToggle";
import { useLocale } from "../../context/LocaleContext";

export function TopBar() {
  const ws = useWorkspace();
  const { resolved } = useTheme();
  const { t } = useLocale();
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
            id:
              file.name.replace(/\.[^.]+$/, "") +
              "-" +
              Math.random().toString(36).slice(2, 6),
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

  const isDetection = ws.mode === "detection";

  return (
    <header className="bg-canvas/80 backdrop-blur-glass border-b border-hairline z-20">
      <div className="h-14 flex items-center px-4 gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <img
            src={resolved === "dark" ? b2bDark : b2bLight}
            alt="Box2Box"
            className="h-7 w-7 object-contain"
            draggable={false}
          />
          <span className="hidden sm:inline font-display font-semibold text-on-dark text-[14px] tracking-tight">
            Box2Box
          </span>
        </div>

        <div className="h-5 w-px bg-[var(--hairline)]" />

        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-body-sm font-medium text-on-dark truncate max-w-[180px]">
            {ws.rootName}
          </span>
          <span
            className={clsx(
              "chip",
              isDetection ? "text-accent" : "text-rose",
            )}
          >
            {isDetection ? <IconBox size={12} /> : <IconImage size={12} />}
            {isDetection ? t("topbar.detection") : t("topbar.classification")}
          </span>
        </div>

        <div className="h-5 w-px bg-[var(--hairline)]" />

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={ws.goPrev}
            disabled={idx <= 0}
            className="btn-icon-sm disabled:opacity-30"
            aria-label={t("topbar.prev")}
            title={t("topbar.prevTitle")}
          >
            <IconChevronLeft size={16} />
          </button>
          <div className="surface-soft rounded-lg px-3 h-9 flex items-center gap-2 min-w-[110px] justify-center">
            <span className="text-body-sm font-semibold text-on-dark tabular-nums">
              {idx >= 0 ? idx + 1 : 0}
            </span>
            <span className="text-muted text-caption">/</span>
            <span className="text-caption text-muted tabular-nums">
              {ws.images.length}
            </span>
            {current && (
              <span className="text-caption text-muted truncate ml-1.5 hidden xl:inline max-w-[160px]">
                {current.name}
              </span>
            )}
          </div>
          <button
            onClick={ws.goNext}
            disabled={idx === -1 || idx >= ws.images.length - 1}
            className="btn-icon-sm disabled:opacity-30"
            aria-label={t("topbar.next")}
            title={t("topbar.nextTitle")}
          >
            <IconChevronRight size={16} />
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-caption text-muted ml-1">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          <span>
            {isDetection
              ? t("topbar.statBoxes", {
                  boxes: totalBoxes,
                  classes: ws.classes.length,
                })
              : t("topbar.statTagged", {
                  tagged: taggedImages,
                  classes: ws.classes.length,
                })}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <LocaleToggle size="sm" />
          <ThemeToggle size="sm" />
          <div className="h-5 w-px bg-[var(--hairline)]" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => importRef.current?.click()}
            title={t("topbar.importTitle")}
          >
            <IconUpload size={14} />
            <span className="hidden md:inline">{t("topbar.import")}</span>
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

          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileRef.current?.click()}
            title={t("topbar.addTitle")}
          >
            <IconPlus size={14} />
            <span className="hidden md:inline">{t("topbar.addImages")}</span>
          </Button>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => onImportImages(e.target.files)}
          />

          <div className="relative">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setExportOpen((v) => !v)}
              title={t("topbar.exportTitle")}
            >
              <IconDownload size={14} />
              {t("topbar.export")}
            </Button>
            {exportOpen && (
              <ExportDropdown onClose={() => setExportOpen(false)} />
            )}
          </div>

          <button
            onClick={() => {
              if (confirm(t("topbar.closeConfirm"))) {
                ws.reset();
                window.location.href = "/";
              }
            }}
            className="btn-icon-sm"
            title={t("topbar.closeWorkspace")}
            aria-label={t("topbar.closeWorkspace")}
          >
            <IconClose size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

function ExportDropdown({ onClose }: { onClose: () => void }) {
  const ws = useWorkspace();
  const { t } = useLocale();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const exportDirect = async (fmt: LabelFormat) => {
    setBusy(true);
    setResult(null);
    try {
      const r = await ws.exportDataset(fmt);
      setResult(
        r.savedToFolder
          ? t("dropdown.saved", {
              count: r.fileCount,
              files: r.fileCount === 1 ? t("common.file") : t("common.files"),
            })
          : t("dropdown.downloaded", {
              count: r.fileCount,
              files: r.fileCount === 1 ? t("common.file") : t("common.files"),
            }),
      );
    } catch (e) {
      setResult(t("dropdown.error", { message: (e as Error).message }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="absolute right-0 top-full mt-2 w-80 popover z-30 animate-scale-in overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4 border-b border-hairline">
        <div className="text-[13px] font-semibold font-display text-on-dark">
          {t("dropdown.choose")}
        </div>
        <div className="text-caption text-muted mt-1">
          {ws.hasFileSystem
            ? t("dropdown.writesDirect")
            : t("dropdown.willDownload")}
          {ws.mode === "classification" ? t("dropdown.classFormats") : ""}
        </div>
      </div>
      <div className="p-2">
        {(
          (ws.mode === "classification"
            ? [
                { id: "csv" as const, label: "CSV", ext: "labels.csv" },
                {
                  id: "jsonl" as const,
                  label: "JSON Lines",
                  ext: "labels.jsonl",
                },
                { id: "json" as const, label: "JSON", ext: "labels.json" },
              ]
            : [
                {
                  id: "yolo" as const,
                  label: "YOLO",
                  ext: ".txt + classes.txt",
                },
                {
                  id: "coco" as const,
                  label: "COCO",
                  ext: "_annotations.coco.json",
                },
                {
                  id: "voc" as const,
                  label: "Pascal VOC",
                  ext: ".xml per image",
                },
                { id: "json" as const, label: "JSON", ext: "labels.json" },
              ])
        ).map((f) => (
          <button
            key={f.id}
            disabled={busy}
            onClick={() => exportDirect(f.id)}
            className="w-full text-left p-3 rounded-lg hover:bg-[var(--tint-a)] flex items-center justify-between group disabled:opacity-50 transition-colors"
          >
            <div>
              <div className="font-display font-medium text-on-dark text-[14px]">
                {f.label}
              </div>
              <div className="text-caption text-muted">{f.ext}</div>
            </div>
            <IconDownload
              size={15}
              className="text-muted group-hover:text-accent transition-colors"
            />
          </button>
        ))}
      </div>
      {result && (
        <div className="px-4 py-3 border-t border-hairline text-caption text-success flex items-center gap-1.5">
          <IconCheck size={13} />
          {result}
        </div>
      )}
      <button
        onClick={onClose}
        className="w-full p-3 text-caption text-muted hover:text-on-dark border-t border-hairline transition-colors"
      >
        {t("common.close")}
      </button>
    </div>
  );
}

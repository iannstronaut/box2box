import { useEffect, useState } from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import { TopBar } from "../components/layout/TopBar";
import { Button, Eyebrow } from "../components/common/Primitives";
import { GetBoxesModal } from "../components/landing/GetBoxesModal";
import { ImageList } from "../components/workspace/ImageList";
import { AnnotationList } from "../components/workspace/AnnotationList";
import { AnnotationCanvas } from "../components/workspace/AnnotationCanvas";
import { isFsApiSupported } from "../utils/filesystem";
import { useLocale } from "../context/LocaleContext";
import {
  IconKeyboard,
  IconBox,
  IconImage,
  IconFolder,
  IconClose,
  IconShield,
  IconArrow,
} from "../components/common/Icons";

export function Workspace() {
  const ws = useWorkspace();
  const { t } = useLocale();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const current = ws.images.find((i) => i.id === ws.currentImageId) ?? null;

  // Open the shortcuts panel with "?" from anywhere (except while typing).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (e.key === "?") {
        e.preventDefault();
        setHelpOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openPicker = () => {
    if (!isFsApiSupported()) {
      alert(t("alert.noFsWorkspace"));
      return;
    }
    setPickerOpen(true);
  };

  const onSelect = async (mode: "detection" | "classification") => {
    setPickerOpen(false);
    try {
      await ws.openFromPicker(mode);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error(err);
        alert((err as Error).message ?? t("alert.cantOpenFolder"));
      }
    }
  };

  // ---------------- Empty state ----------------
  if (!ws.isReady) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas">
        <TopBar />
        <div className="flex-1 grid place-items-center px-5 py-12">
          <div className="max-w-3xl w-full">
            <div className="text-center">
              <Eyebrow className="justify-center mb-4">
                {t("ws.eyebrow")}
              </Eyebrow>
              <h1 className="type-display text-display-lg mb-4">
                {t("ws.emptyTitle")}
              </h1>
              <p className="text-body-md text-body mb-8 max-w-xl mx-auto">
                {t("ws.emptyBody")}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button variant="primary" onClick={openPicker} className="group">
                  <IconFolder size={17} />
                  {t("ws.openFolder")}
                  <IconArrow
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Button>
                <Button variant="ghost" onClick={() => ws.loadDemo("detection")}>
                  <IconBox size={15} />
                  {t("ws.tryDetection")}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => ws.loadDemo("classification")}
                >
                  <IconImage size={15} />
                  {t("ws.tryClassification")}
                </Button>
              </div>
            </div>

            <div className="mt-10 grid md:grid-cols-2 gap-3.5">
              <div className="glass-tile p-6">
                <div className="text-[13px] font-semibold font-display text-on-dark mb-3">
                  {t("ws.expectedLayout")}
                </div>
                <ul className="space-y-1 font-mono text-[12px] leading-relaxed">
                  <li className="text-on-dark">root/</li>
                  <li className="text-muted">├── images/</li>
                  <li className="text-muted">│   ├── img_001.jpg</li>
                  <li className="text-muted">│   └── img_002.jpg</li>
                  <li className="text-muted">└── labels/</li>
                  <li className="text-muted">    ├── img_001.txt</li>
                  <li className="text-muted">    └── classes.txt</li>
                </ul>
              </div>
              <div className="glass-tile p-6 flex flex-col gap-4">
                <div className="text-[13px] font-semibold font-display text-on-dark">
                  {t("ws.goodToKnow")}
                </div>
                <ul className="space-y-3 text-body-sm text-body">
                  <li className="flex items-start gap-2.5">
                    <IconShield size={16} className="text-success mt-0.5 shrink-0" />
                    {t("ws.note1")}
                  </li>
                  <li className="flex items-start gap-2.5">
                    <IconFolder size={16} className="text-accent mt-0.5 shrink-0" />
                    {t("ws.note2")}
                  </li>
                  <li className="flex items-start gap-2.5">
                    <IconKeyboard size={16} className="text-accent mt-0.5 shrink-0" />
                    {t("ws.note3pre")}{" "}
                    <kbd className="px-1.5 py-0.5 rounded-md bg-[var(--tint-b)] text-[11px] font-medium text-on-dark mx-0.5">
                      ?
                    </kbd>{" "}
                    {t("ws.note3post")}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <GetBoxesModal
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={onSelect}
        />
      </div>
    );
  }

  // ---------------- Active workspace ----------------
  return (
    <div className="h-screen flex flex-col bg-canvas overflow-hidden">
      <TopBar />
      <div className="flex-1 grid grid-cols-[248px_1fr_312px] min-h-0">
        <ImageList />

        <main className="flex flex-col min-w-0 min-h-0">
          {current ? (
            <AnnotationCanvas image={current} />
          ) : (
            <div className="flex-1 grid place-items-center text-muted text-body-sm">
              {t("ws.selectImage")}
            </div>
          )}
        </main>

        <AnnotationList />
      </div>

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <GetBoxesModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={onSelect}
      />
      <HelpButton onClick={() => setHelpOpen(true)} />
      <ExportOverlay />
    </div>
  );
}

function ExportOverlay() {
  const ws = useWorkspace();
  const { t } = useLocale();
  if (!ws.isExporting) return null;
  const p = ws.exportProgress;
  const pct =
    p && p.total > 0 ? Math.min(100, Math.round((p.done / p.total) * 100)) : 0;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[var(--overlay-b)] backdrop-blur-sm animate-fade-in">
      <div className="popover w-full max-w-sm p-7 animate-scale-in text-center">
        <div className="mx-auto mb-5 w-12 h-12 rounded-full border-[3px] border-[var(--tint-strong)] border-t-[var(--accent)] animate-spin" />
        <div className="type-display text-title-md mb-1">
          {t("export.exporting")}
        </div>
        <div className="text-body-sm text-muted mb-5">
          {p?.label ?? t("export.working")}
        </div>
        <div className="h-2 rounded-full bg-[var(--tint-b)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-200"
            style={ { width: `${pct}%` } }
          />
        </div>
        <div className="text-caption text-muted mt-2 tabular-nums">
          {p ? `${p.done} / ${p.total}` : null}
        </div>
      </div>
    </div>
  );
}

function HelpButton({ onClick }: { onClick: () => void }) {
  const { t } = useLocale();
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 left-4 btn-icon shadow-card z-10"
      title={t("help.button")}
      aria-label={t("help.button")}
    >
      <IconKeyboard size={17} />
    </button>
  );
}

function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLocale();
  if (!open) return null;
  const items: { k: string; v: string; group: string }[] = [
    { group: "help.group.canvas", k: "Scroll", v: "help.zoom" },
    { group: "help.group.canvas", k: "⌘ / Ctrl +  −", v: "help.zoom" },
    { group: "help.group.canvas", k: "Shift + drag", v: "help.pan" },
    { group: "help.group.canvas", k: "Space + drag", v: "help.pan" },
    { group: "help.group.canvas", k: "Drag", v: "help.draw" },
    { group: "help.group.canvas", k: "Delete", v: "help.remove" },
    { group: "help.group.canvas", k: "F  /  0", v: "help.fit" },
    { group: "help.group.canvas", k: "1", v: "help.reset" },
    { group: "help.group.navigate", k: "[  /  P", v: "help.prev" },
    { group: "help.group.navigate", k: "]  /  N", v: "help.next" },
    { group: "help.group.annotate", k: "1 – 9", v: "help.pickClass" },
    { group: "help.group.export", k: "⌘ / Ctrl + S", v: "help.exportAll" },
    { group: "help.group.general", k: "Esc", v: "help.closeDialog" },
  ];
  const groups = Object.entries(
    items.reduce<Record<string, typeof items>>((acc, i) => {
      (acc[i.group] ??= []).push(i);
      return acc;
    }, {}),
  );
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--overlay-b)] backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="glass-strong w-full max-w-lg animate-scale-in max-h-[82vh] overflow-y-auto">
        <div className="p-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-on-dark">
                <IconKeyboard size={18} className="text-accent" />
                <h2 className="type-display text-display-sm">
                  {t("help.shortcuts")}
                </h2>
              </div>
              <p className="text-body-sm text-muted mt-1">
                {t("help.subtitle")}
              </p>
            </div>
            <button onClick={onClose} className="btn-icon-sm" aria-label={t("common.close")}>
              <IconClose size={16} />
            </button>
          </div>
          {groups.map(([group, rows]) => (
            <div key={group} className="mb-5 last:mb-0">
              <div className="type-eyebrow mb-2">{t(group)}</div>
              <ul className="divide-y divide-[var(--hairline)]">
                {rows.map((i) => (
                  <li
                    key={i.k}
                    className="flex items-center justify-between py-2.5"
                  >
                    <span className="text-body-sm text-body">{t(i.v)}</span>
                    <kbd className="text-[12px] font-medium text-on-dark bg-[var(--tint-b)] rounded-md px-2.5 py-1 min-w-[88px] text-center">
                      {i.k}
                    </kbd>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

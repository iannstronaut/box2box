import { useState } from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import { TopBar } from "../components/layout/TopBar";
import { Button } from "../components/common/Primitives";
import { MStripe } from "../components/common/MStripe";
import { GetBoxesModal } from "../components/landing/GetBoxesModal";
import { ImageList } from "../components/workspace/ImageList";
import { AnnotationList } from "../components/workspace/AnnotationList";
import { AnnotationCanvas } from "../components/workspace/AnnotationCanvas";
import { isFsApiSupported } from "../utils/filesystem";
import {
  IconKeyboard,
  IconSpark,
} from "../components/common/Icons";

export function Workspace() {
  const ws = useWorkspace();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const current = ws.images.find((i) => i.id === ws.currentImageId) ?? null;

  const openPicker = () => {
    if (!isFsApiSupported()) {
      alert(
        "File System Access API is not supported in this browser. Use Chrome or Edge.",
      );
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
        alert((err as Error).message ?? "Failed to open directory");
      }
    }
  };

  // Empty state
  if (!ws.isReady) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas">
        <TopBar />
        <div className="m-stripe" />
        <div className="flex-1 grid place-items-center px-6">
          <div className="max-w-2xl w-full text-center">
            <div className="type-label text-m-blue-dark mb-4">WORKSPACE</div>
            <h1 className="type-display text-display-lg mb-6">
              PICK A FOLDER TO START.
            </h1>
            <p className="text-body-md text-body mb-10">
              Box2Box reads images and labels in place. Nothing is uploaded.
              Expected layout:{" "}
              <span className="text-on-dark">/images, /labels</span>.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="primary" onClick={openPicker}>
                OPEN DIRECTORY
              </Button>
              <Button variant="ghost" onClick={() => ws.loadDemo("detection")}>
                <IconSpark size={14} className="mr-2" />
                LOAD DEMO
              </Button>
              <Button
                variant="ghost"
                onClick={() => ws.loadDemo("classification")}
              >
                DEMO · CLASSIFICATION
              </Button>
            </div>
            <div className="mt-12 glass-soft p-6 text-left text-body-sm text-body">
              <div className="type-label text-on-dark mb-3">
                SUPPORTED LAYOUTS
              </div>
              <ul className="space-y-1.5 font-mono text-[12px]">
                <li>root/</li>
                <li className="text-muted">├── images/</li>
                <li className="text-muted">│   ├── img_001.jpg</li>
                <li className="text-muted">│   └── img_002.jpg</li>
                <li className="text-muted">└── labels/</li>
                <li className="text-muted">    ├── img_001.txt</li>
                <li className="text-muted">    └── classes.txt</li>
              </ul>
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

  // Active workspace: 3-column layout
  return (
    <div className="h-screen flex flex-col bg-canvas overflow-hidden">
      <TopBar />
      <div className="flex-1 grid grid-cols-[260px_1fr_320px] min-h-0">
        {/* LEFT — image list */}
        <ImageList />

        {/* CENTER — canvas */}
        <main className="flex flex-col min-w-0 min-h-0">
          {current ? (
            <AnnotationCanvas image={current} />
          ) : (
            <div className="flex-1 grid place-items-center text-muted text-caption">
              SELECT AN IMAGE FROM THE LEFT
            </div>
          )}
        </main>

        {/* RIGHT — annotations + classes */}
        <AnnotationList />
      </div>

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <GetBoxesModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={onSelect}
      />
      <HelpButton onClick={() => setHelpOpen(true)} />
    </div>
  );
}

function HelpButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-3 left-3 btn-icon z-10"
      title="Shortcuts"
    >
      <IconKeyboard size={16} />
    </button>
  );
}

function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  const items: { k: string; v: string; group: string }[] = [
    { group: "CANVAS", k: "WHEEL", v: "Zoom in / out" },
    { group: "CANVAS", k: "CTRL + / −", v: "Zoom in / out" },
    { group: "CANVAS", k: "SHIFT + DRAG", v: "Pan workspace" },
    { group: "CANVAS", k: "MIDDLE DRAG", v: "Pan workspace" },
    { group: "CANVAS", k: "SPACE + DRAG", v: "Pan workspace" },
    { group: "CANVAS", k: "DRAG", v: "Draw bounding box" },
    { group: "CANVAS", k: "DELETE", v: "Delete selected box" },
    { group: "CANVAS", k: "F", v: "Fit to screen" },
    { group: "CANVAS", k: "0", v: "Fit to screen" },
    { group: "CANVAS", k: "1", v: "Reset to 100%" },
    { group: "NAV", k: "[ / P", v: "Previous image" },
    { group: "NAV", k: "] / N", v: "Next image" },
    { group: "ANNOTATE", k: "1 - 9", v: "Pick class by index" },
    { group: "ANNOTATE", k: "CLICK CLASS", v: "Toggle active class" },
    { group: "EXPORT", k: "CTRL + S", v: "Export all" },
    { group: "GENERAL", k: "ESC", v: "Close dialog" },
  ];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--overlay-b)] backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="glass-strong w-full max-w-lg animate-scale-in max-h-[80vh] overflow-y-auto">
        <MStripe />
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="type-display text-display-sm">SHORTCUTS</h2>
            <button onClick={onClose} className="btn-icon" aria-label="Close">
              <IconKeyboard size={16} />
            </button>
          </div>
          {Object.entries(
            items.reduce<Record<string, typeof items>>((acc, i) => {
              (acc[i.group] ??= []).push(i);
              return acc;
            }, {}),
          ).map(([group, rows]) => (
            <div key={group} className="mb-6 last:mb-0">
              <div className="type-label text-m-blue-dark mb-2">{group}</div>
              <ul className="divide-y divide-hairline">
                {rows.map((i) => (
                  <li
                    key={i.k}
                    className="flex items-center justify-between py-2.5"
                  >
                    <kbd className="type-label text-on-dark bg-[var(--tint-a)] border border-[var(--tint-strong)] px-2 py-1 min-w-[80px] text-center">
                      {i.k}
                    </kbd>
                    <span className="text-body-sm text-body">{i.v}</span>
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

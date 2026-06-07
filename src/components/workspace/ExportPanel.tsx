import { useState } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { Button } from "../common/Primitives";
import { IconDownload } from "../common/Icons";
import type { LabelFormat } from "../../types";

const FORMATS: { id: LabelFormat; label: string; ext: string; desc: string }[] = [
  { id: "yolo", label: "YOLO", ext: ".txt", desc: "Per-image .txt + classes.txt" },
  { id: "coco", label: "COCO", ext: ".json", desc: "Single _annotations.coco.json" },
  { id: "voc", label: "Pascal VOC", ext: ".xml", desc: "Per-image .xml" },
  { id: "json", label: "JSON", ext: ".json", desc: "Single labels.json" },
];

export function ExportPanel() {
  const ws = useWorkspace();
  const [busy, setBusy] = useState(false);

  const totalBoxes = Object.values(ws.boxes).reduce((n, a) => n + a.length, 0);
  const tagged = Object.values(ws.classifications).filter((a) => a.length > 0)
    .length;

  const onExport = async () => {
    setBusy(true);
    try {
      await ws.exportAll();
    } catch (e) {
      console.error(e);
      alert((e as Error).message ?? "Export failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass-soft flex flex-col">
      <div className="px-5 py-4 border-b border-white/5">
        <div className="type-label text-on-dark">EXPORT</div>
        <div className="text-caption text-muted mt-1">
          WRITES TO YOUR /LABELS FOLDER
        </div>
      </div>

      <div className="p-5 grid grid-cols-2 gap-2">
        {FORMATS.map((f) => {
          const active = ws.exportFormat === f.id;
          return (
            <button
              key={f.id}
              onClick={() => ws.setExportFormat(f.id)}
              className={`text-left p-3 border transition-colors ${
                active
                  ? "border-white bg-white/[0.05]"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-on-dark text-[13px]">
                  {f.label}
                </span>
                <span className="text-caption text-muted">{f.ext}</span>
              </div>
              <p className="text-caption text-muted mt-1.5">{f.desc}</p>
            </button>
          );
        })}
      </div>

      <div className="px-5 py-3 border-t border-white/5 grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="font-display text-on-dark text-[20px]">
            {ws.images.length}
          </div>
          <div className="text-caption text-muted">IMAGES</div>
        </div>
        <div>
          <div className="font-display text-on-dark text-[20px]">
            {ws.mode === "detection" ? totalBoxes : tagged}
          </div>
          <div className="text-caption text-muted">
            {ws.mode === "detection" ? "BOXES" : "TAGGED"}
          </div>
        </div>
        <div>
          <div className="font-display text-on-dark text-[20px]">
            {ws.classes.length}
          </div>
          <div className="text-caption text-muted">CLASSES</div>
        </div>
      </div>

      <div className="p-5 pt-3">
        <Button
          variant="primary"
          onClick={onExport}
          disabled={busy || !ws.isReady}
          className="w-full"
        >
          <IconDownload size={16} className="mr-2" />
          {busy ? "EXPORTING…" : "EXPORT ALL"}
        </Button>
        {ws.status && (
          <p className="mt-3 text-caption text-m-blue-dark">{ws.status}</p>
        )}
      </div>
    </div>
  );
}

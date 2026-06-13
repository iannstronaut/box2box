import { useEffect, useRef } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { IconCheck } from "../common/Icons";
import { clsx } from "../../utils/id";
import { useLocale } from "../../context/LocaleContext";

export function ImageList() {
  const ws = useWorkspace();
  const { t } = useLocale();
  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll active into view
  useEffect(() => {
    if (activeRef.current && listRef.current) {
      activeRef.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [ws.currentImageId]);

  const annotatedCount = ws.images.filter((img) => {
    const boxes = ws.boxes[img.id] ?? [];
    const cls = ws.classifications[img.id] ?? [];
    return ws.mode === "detection" ? boxes.length > 0 : cls.length > 0;
  }).length;

  return (
    <div className="h-full flex flex-col bg-surface-soft/40 border-r border-hairline">
      <div className="px-4 py-3.5 border-b border-hairline">
        <div className="flex items-center justify-between">
          <div className="text-[13px] font-semibold font-display text-on-dark">
            {t("imagelist.images")}
          </div>
          <span className="chip">{ws.images.length}</span>
        </div>
        {ws.images.length > 0 && (
          <div className="mt-2.5">
            <div className="h-1.5 rounded-full bg-[var(--tint-b)] overflow-hidden">
              <div
                className="h-full rounded-full bg-success transition-all"
                style={{
                  width: `${ws.images.length ? (annotatedCount / ws.images.length) * 100 : 0}%`,
                }}
              />
            </div>
            <div className="text-caption text-muted mt-1.5">
              {t("imagelist.progress", {
                done: annotatedCount,
                total: ws.images.length,
              })}
            </div>
          </div>
        )}
      </div>
      <div ref={listRef} className="flex-1 overflow-y-auto py-1.5 px-1.5">
        {ws.images.length === 0 ? (
          <div className="px-3 py-6 text-body-sm text-muted">
            {t("imagelist.noImages")}
          </div>
        ) : (
          ws.images.map((img, i) => {
            const active = ws.currentImageId === img.id;
            const boxes = ws.boxes[img.id] ?? [];
            const cls = ws.classifications[img.id] ?? [];
            const annotated =
              ws.mode === "detection" ? boxes.length > 0 : cls.length > 0;
            return (
              <button
                key={img.id}
                ref={active ? activeRef : null}
                onClick={() => ws.setCurrentImageId(img.id)}
                className={clsx(
                  "w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left transition-all",
                  active
                    ? "bg-[var(--accent-soft)] ring-1 ring-[var(--accent)]/30"
                    : "hover:bg-[var(--tint-a)]",
                )}
              >
                <div className="relative w-11 h-11 rounded-lg checker overflow-hidden shrink-0">
                  <img
                    src={img.url}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable={false}
                  />
                  {annotated && (
                    <div className="absolute inset-0 bg-success/25 flex items-center justify-center">
                      <span className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
                        <IconCheck size={12} className="text-white" />
                      </span>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={clsx(
                      "text-[12.5px] font-medium font-display truncate",
                      active ? "text-on-dark" : "text-body-strong",
                    )}
                  >
                    {img.name}
                  </div>
                  <div className="text-[11px] text-muted mt-0.5 flex items-center gap-1.5">
                    <span className="tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>·</span>
                    <span>
                      {ws.mode === "detection"
                        ? `${boxes.length} ${boxes.length === 1 ? t("common.box") : t("common.boxes")}`
                        : `${cls.length} ${cls.length === 1 ? t("common.tag") : t("common.tags")}`}
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

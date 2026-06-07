import { useEffect, useRef } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { IconCheck } from "../common/Icons";
import { clsx } from "../../utils/id";

export function ImageList() {
  const ws = useWorkspace();
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

  return (
    <div className="h-full flex flex-col bg-canvas/40 border-r border-hairline">
      <div className="px-4 py-3 border-b border-hairline flex items-center justify-between">
        <div>
          <div className="type-label text-on-dark">IMAGES</div>
          <div className="text-caption text-muted mt-0.5">
            {ws.images.length} LOADED
          </div>
        </div>
      </div>
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto py-1"
      >
        {ws.images.length === 0 ? (
          <div className="px-4 py-6 text-caption text-muted">
            No images yet.
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
                  "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors border-l-2",
                  active
                    ? "bg-[var(--tint-b)] border-on-dark"
                    : "border-transparent hover:bg-[var(--tint-a)]",
                )}
              >
                <div className="relative w-10 h-10 checker overflow-hidden shrink-0">
                  <img
                    src={img.url}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable={false}
                  />
                  {annotated && (
                    <div className="absolute inset-0 bg-success/20 flex items-center justify-center">
                      <IconCheck size={14} className="text-success" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-display text-on-dark truncate">
                    {img.name}
                  </div>
                  <div className="text-[10px] text-muted mt-0.5 type-label flex items-center gap-2">
                    <span className="tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>·</span>
                    <span>
                      {ws.mode === "detection"
                        ? `${boxes.length} BX`
                        : `${cls.length} CLS`}
                    </span>
                  </div>
                </div>
                {annotated && (
                  <span className="w-1.5 h-1.5 bg-success shrink-0" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

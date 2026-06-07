import { useWorkspace } from "../../context/WorkspaceContext";
import { IconCheck } from "../common/Icons";
import { clsx } from "../../utils/id";

export function ImageGrid() {
  const ws = useWorkspace();
  if (!ws.isReady) {
    return <Empty />;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-4 overflow-y-auto h-full">
      {ws.images.map((img) => {
        const boxes = ws.boxes[img.id] ?? [];
        const cls = ws.classifications[img.id] ?? [];
        const tagged = cls.length > 0;
        const active = ws.currentImageId === img.id;
        const hasBoxes = boxes.length > 0;
        const done = ws.mode === "detection" ? hasBoxes : tagged;
        return (
          <button
            key={img.id}
            onClick={() => ws.setCurrentImageId(img.id)}
            className={clsx(
              "group relative text-left border transition-colors",
              active
                ? "border-white"
                : "border-[var(--tint-strong)] hover:border-[var(--muted)]",
            )}
          >
            <div className="relative aspect-square checker overflow-hidden">
              <img
                src={img.url}
                alt={img.name}
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
              {done && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-success flex items-center justify-center text-black">
                  <IconCheck size={14} />
                </div>
              )}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] type-label text-on-dark">
                {ws.mode === "detection" ? (
                  <span>{boxes.length} BX</span>
                ) : (
                  <span>{cls.length} CLS</span>
                )}
              </div>
            </div>
            <div className="px-2 py-2 bg-[var(--overlay-a)] backdrop-blur-sm border-t border-hairline">
              <div className="text-[11px] text-on-dark truncate font-display tracking-tight">
                {img.name}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function Empty() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-10">
      <div className="font-display text-on-dark text-display-sm mb-2">
        NO IMAGES LOADED
      </div>
      <p className="text-body-sm text-body max-w-sm">
        Pick a folder from the workspace, or load a demo project to try the
        canvas.
      </p>
    </div>
  );
}

import { useRef, useState } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { Button } from "../common/Primitives";
import {
  IconPlus,
  IconTrash,
  IconUpload,
  IconCheck,
  IconCrosshair,
  IconImage,
} from "../common/Icons";
import { clsx } from "../../utils/id";
import type { BoundingBox } from "../../types";
import { isUnclass } from "../../types";

export function AnnotationList() {
  const ws = useWorkspace();
  const image =
    ws.images.find((i) => i.id === ws.currentImageId) ?? null;
  const fileRef = useRef<HTMLInputElement>(null);
  const [newName, setNewName] = useState("");
  const [tab, setTab] = useState<"boxes" | "classes">(
    ws.mode === "detection" ? "boxes" : "classes",
  );

  const addClass = () => {
    const name = newName.trim();
    if (!name) return;
    if (
      !ws.classes.some(
        (c) => c.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      ws.addClass(name);
    }
    setNewName("");
  };

  const importTxt = async (file: File) => {
    const text = await file.text();
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

  return (
    <div className="h-full flex flex-col bg-canvas/40 border-l border-hairline">
      {/* Tabs */}
      <div className="px-4 pt-3 flex items-center gap-6 border-b border-hairline">
        <button
          className={clsx(
            "tab",
            tab === "boxes" && "tab-active",
            ws.mode !== "detection" && "hidden",
          )}
          onClick={() => setTab("boxes")}
        >
          <IconCrosshair size={12} className="inline mr-2" />
          ANNOTATIONS
        </button>
        <button
          className={clsx(
            "tab",
            tab === "classes" && "tab-active",
            ws.mode === "classification" && "hidden",
          )}
          onClick={() => setTab("classes")}
        >
          CLASSES
        </button>
        {ws.mode === "classification" && (
          <button className="tab tab-active">
            <IconImage size={12} className="inline mr-2" />
            CLASSES
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "classes" ? (
          <ClassesPanel
            newName={newName}
            setNewName={setNewName}
            addClass={addClass}
            onImport={() => fileRef.current?.click()}
          />
        ) : (
          <BoxesPanel imageId={image?.id ?? null} />
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".txt,text/plain"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) importTxt(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

interface ClassesPanelProps {
  newName: string;
  setNewName: (s: string) => void;
  addClass: () => void;
  onImport: () => void;
}
function ClassesPanel({
  newName,
  setNewName,
  addClass,
  onImport,
}: ClassesPanelProps) {
  const ws = useWorkspace();
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addClass()}
          placeholder="new_class_name"
          className="input input-sm flex-1"
        />
        <Button variant="primary" size="sm" onClick={addClass}>
          <IconPlus size={12} className="mr-1" />
          ADD
        </Button>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onImport}
        className="w-full"
      >
        <IconUpload size={12} className="mr-2" />
        IMPORT FROM .TXT
      </Button>

      <ul className="divide-y divide-hairline">
        {ws.classes.length === 0 ? (
          <li className="text-caption text-muted py-3">
            No classes yet. Add one or import a .txt file.
          </li>
        ) : (
          ws.classes.map((c, i) => {
            const active = ws.selectedClassId === c.id;
            const unclass = isUnclass(c.id);
            return (
              <li
                key={c.id}
                className={clsx(
                  "flex items-center gap-3 py-2.5 cursor-pointer transition-colors",
                  active
                    ? "bg-[var(--tint-b)] -mx-4 px-4"
                    : "hover:bg-[var(--tint-a)]",
                )}
                onClick={() => ws.setSelectedClassId(active ? null : c.id)}
                title={
                  unclass
                    ? "Default class — boxes can be drawn and reassigned later"
                    : "Click to set as active class"
                }
              >
                <span
                  className="w-3 h-3 shrink-0"
                  style={{ background: c.color }}
                />
                <span className="font-display text-on-dark text-[13px] flex-1 truncate">
                  {c.name}
                </span>
                {unclass && (
                  <span className="text-[9px] type-label text-muted">
                    DEFAULT
                  </span>
                )}
                <span className="text-caption text-muted w-5 text-right tabular-nums">
                  {i + 1}
                </span>
                {active && <IconCheck size={12} className="text-on-dark" />}
                {!unclass && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      ws.removeClass(c.id);
                    }}
                    className="text-muted hover:text-m-red"
                    aria-label="Delete"
                  >
                    <IconTrash size={12} />
                  </button>
                )}
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

function BoxesPanel({ imageId }: { imageId: string | null }) {
  const ws = useWorkspace();
  if (!imageId) {
    return (
      <div className="px-4 py-6 text-caption text-muted">
        Select an image to see its annotations.
      </div>
    );
  }
  const boxes = ws.boxes[imageId] ?? [];
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-caption text-muted">
          {boxes.length} BOX{boxes.length === 1 ? "" : "ES"}
        </div>
        {boxes.length > 0 && (
          <button
            onClick={() => {
              if (confirm("Delete all boxes in this image?")) {
                ws.setBoxes(imageId, []);
              }
            }}
            className="text-caption text-muted hover:text-m-red"
          >
            CLEAR ALL
          </button>
        )}
      </div>
      {boxes.length === 0 ? (
        <div className="py-4 text-caption text-muted">
          No annotations yet. Pick a class, then drag on the canvas.
        </div>
      ) : (
        <ul className="space-y-1.5">
          {boxes.map((b, i) => (
            <BoxRow key={b.id} imageId={imageId} box={b} index={i} />
          ))}
        </ul>
      )}
    </div>
  );
}

function BoxRow({
  imageId,
  box,
  index,
}: {
  imageId: string;
  box: BoundingBox;
  index: number;
}) {
  const ws = useWorkspace();
  const cls = ws.classes.find((c) => c.id === box.classId);
  const [editing, setEditing] = useState(false);

  return (
    <li className="glass-soft p-2 flex items-center gap-2 group">
      <span
        className="w-2.5 h-2.5 shrink-0"
        style={{ background: cls?.color ?? "#888" }}
      />
      <span className="text-[10px] type-label text-muted w-4 tabular-nums">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        {editing ? (
          <select
            value={box.classId}
            onChange={(e) => {
              ws.setBoxClass(imageId, box.id, e.target.value);
              setEditing(false);
            }}
            onBlur={() => setEditing(false)}
            autoFocus
            className="w-full px-1 py-0.5 text-[11px] text-on-dark"
            style={{
              background: "var(--canvas)",
              border: "1px solid var(--hairline)",
            }}
          >
            {ws.classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-[11px] font-display text-on-dark hover:text-m-blue-dark truncate text-left w-full"
            title="Click to change class"
          >
            {cls?.name ?? "unknown"}
          </button>
        )}
        <div className="text-[9px] text-muted mt-0.5 tabular-nums">
          {Math.round(box.w)} × {Math.round(box.h)} @ {Math.round(box.x)},{" "}
          {Math.round(box.y)}
        </div>
      </div>
      <button
        onClick={() => {
          ws.setBoxes(
            imageId,
            (ws.boxes[imageId] ?? []).filter((b) => b.id !== box.id),
          );
        }}
        className="text-muted hover:text-m-red opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Delete"
      >
        <IconTrash size={11} />
      </button>
    </li>
  );
}

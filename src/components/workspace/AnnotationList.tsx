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
import { useLocale } from "../../context/LocaleContext";

export function AnnotationList() {
  const ws = useWorkspace();
  const { t } = useLocale();
  const image = ws.images.find((i) => i.id === ws.currentImageId) ?? null;
  const fileRef = useRef<HTMLInputElement>(null);
  const [newName, setNewName] = useState("");
  const [tab, setTab] = useState<"boxes" | "classes">(
    ws.mode === "detection" ? "boxes" : "classes",
  );

  const addClass = () => {
    const name = newName.trim();
    if (!name) return;
    if (!ws.classes.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
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
    <div className="h-full flex flex-col bg-surface-soft/40 border-l border-hairline">
      {/* Tabs */}
      <div className="px-4 pt-3 flex items-center gap-5 border-b border-hairline">
        <button
          className={clsx(
            "tab",
            tab === "boxes" && "tab-active",
            ws.mode !== "detection" && "hidden",
          )}
          onClick={() => setTab("boxes")}
        >
          <IconCrosshair size={13} className="inline mr-1.5" />
          {t("list.annotations")}
        </button>
        <button
          className={clsx(
            "tab",
            tab === "classes" && "tab-active",
            ws.mode === "classification" && "hidden",
          )}
          onClick={() => setTab("classes")}
        >
          {t("list.classes")}
        </button>
        {ws.mode === "classification" && (
          <button className="tab tab-active">
            <IconImage size={13} className="inline mr-1.5" />
            {t("list.classes")}
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
  const { t } = useLocale();
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addClass()}
          placeholder={t("list.addPlaceholder")}
          className="input input-sm flex-1"
        />
        <Button variant="primary" size="sm" onClick={addClass}>
          <IconPlus size={13} />
          {t("common.add")}
        </Button>
      </div>
      <Button variant="ghost" size="sm" onClick={onImport} className="w-full">
        <IconUpload size={13} />
        {t("list.importTxt")}
      </Button>

      <ul className="space-y-1">
        {ws.classes.length === 0 ? (
          <li className="text-body-sm text-muted py-3 leading-relaxed">
            {t("list.noClasses")}
          </li>
        ) : (
          ws.classes.map((c, i) => {
            const active = ws.selectedClassId === c.id;
            const unclass = isUnclass(c.id);
            return (
              <li
                key={c.id}
                className={clsx(
                  "flex items-center gap-2.5 py-2 px-2.5 rounded-lg cursor-pointer transition-colors group",
                  active
                    ? "bg-[var(--accent-soft)] ring-1 ring-[var(--accent)]/30"
                    : "hover:bg-[var(--tint-a)]",
                )}
                onClick={() => ws.setSelectedClassId(active ? null : c.id)}
                title={
                  unclass ? t("list.unclassTitle") : t("list.setActiveTitle")
                }
              >
                <label
                  className="relative w-3.5 h-3.5 rounded-md shrink-0 ring-1 ring-black/10 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                  title={t("list.changeColor")}
                  style={ { background: c.color } }
                >
                  <input
                    type="color"
                    value={c.color}
                    onChange={(e) =>
                      ws.updateClass(c.id, { color: e.target.value })
                    }
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    aria-label={t("list.changeColorAria", { name: c.name })}
                  />
                </label>
                <span className="font-display font-medium text-on-dark text-[13px] flex-1 truncate">
                  {c.name}
                </span>
                {unclass && (
                  <span className="text-[10px] font-medium text-muted">
                    {t("list.default")}
                  </span>
                )}
                <kbd className="text-[10px] text-muted bg-[var(--tint-b)] rounded px-1.5 py-0.5 tabular-nums">
                  {i + 1}
                </kbd>
                {active && <IconCheck size={13} className="text-accent" />}
                {(
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      ws.removeClass(c.id);
                    }}
                    className="text-muted hover:text-rose opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={t("list.deleteClass")}
                  >
                    <IconTrash size={13} />
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
  const { t } = useLocale();
  if (!imageId) {
    return (
      <div className="px-4 py-6 text-body-sm text-muted">
        {t("list.selectImageAnns")}
      </div>
    );
  }
  const boxes = ws.boxes[imageId] ?? [];
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-caption text-muted">
          {boxes.length} {boxes.length === 1 ? t("common.box") : t("common.boxes")}
        </div>
        {boxes.length > 0 && (
          <button
            onClick={() => {
              if (confirm(t("list.clearConfirm"))) {
                ws.setBoxes(imageId, []);
              }
            }}
            className="text-caption text-muted hover:text-rose transition-colors"
          >
            {t("list.clearAll")}
          </button>
        )}
      </div>
      {boxes.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-body-sm text-muted leading-relaxed">
            {t("list.noAnnotations1")}
            <br />
            {t("list.noAnnotations2")}
          </p>
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
  const { t } = useLocale();
  const cls = ws.classes.find((c) => c.id === box.classId);
  const [editing, setEditing] = useState(false);

  return (
    <li className="surface-card rounded-lg p-2.5 flex items-center gap-2.5 group">
      <span
        className="w-3 h-3 rounded-md shrink-0 ring-1 ring-black/10"
        style={ { background: cls?.color ?? "#888" } }
      />
      <span className="text-[10px] text-muted w-4 tabular-nums">{index + 1}</span>
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
            className="w-full px-1.5 py-1 text-[12px] text-on-dark rounded-md"
            style={ {
              background: "var(--surface-card)",
              border: "1px solid var(--hairline)",
            } }
            
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
            className="text-[12px] font-medium font-display text-on-dark hover:text-accent truncate text-left w-full transition-colors"
            title={t("list.changeClassTitle")}
          >
            {cls?.name ?? t("list.unknown")}
          </button>
        )}
        <div className="text-[10px] text-muted mt-0.5 tabular-nums">
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
        className="text-muted hover:text-rose opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={t("list.deleteBox")}
      >
        <IconTrash size={12} />
      </button>
    </li>
  );
}

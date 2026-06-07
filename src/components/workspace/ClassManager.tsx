import { useRef, useState } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { Button } from "../common/Primitives";
import { IconPlus, IconTrash, IconUpload, IconCheck } from "../common/Icons";

export function ClassManager() {
  const ws = useWorkspace();
  const [newName, setNewName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const addClass = () => {
    const name = newName.trim();
    if (!name) return;
    if (ws.classes.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setNewName("");
      return;
    }
    ws.addClass(name);
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
    <div className="glass-soft flex flex-col h-full">
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <div className="type-label text-on-dark">CLASSES</div>
          <div className="text-caption text-muted mt-1">
            {ws.classes.length} DEFINED
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileRef.current?.click()}
        >
          <IconUpload size={14} className="mr-2" />
          IMPORT .TXT
        </Button>
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

      <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addClass()}
          placeholder="new_class_name"
          className="input input-sm flex-1"
        />
        <Button variant="primary" size="sm" onClick={addClass}>
          <IconPlus size={14} className="mr-1" />
          ADD
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {ws.classes.length === 0 ? (
          <div className="px-5 py-6 text-caption text-muted">
            NO CLASSES YET. ADD ONE OR IMPORT A .TXT FILE.
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {ws.classes.map((c, i) => {
              const active = ws.selectedClassId === c.id;
              return (
                <li
                  key={c.id}
                  className={`px-5 py-3 flex items-center gap-3 cursor-pointer transition-colors ${
                    active
                      ? "bg-white/[0.04]"
                      : "hover:bg-white/[0.02]"
                  }`}
                  onClick={() =>
                    ws.setSelectedClassId(active ? null : c.id)
                  }
                >
                  <span
                    className="w-3 h-3"
                    style={{ background: c.color }}
                  />
                  <span className="font-display text-on-dark text-[13px] tracking-tight flex-1">
                    {c.name}
                  </span>
                  <span className="text-caption text-muted w-6 text-right">
                    {i}
                  </span>
                  {active && <IconCheck size={14} className="text-on-dark" />}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      ws.removeClass(c.id);
                    }}
                    className="text-muted hover:text-m-red"
                    aria-label="Delete"
                  >
                    <IconTrash size={14} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

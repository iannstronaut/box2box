import { useEffect, useRef } from "react";
import { IconBox, IconImage, IconClose, IconArrow } from "../common/Icons";
import { MStripe } from "../common/MStripe";

interface GetBoxesModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (mode: "detection" | "classification") => void;
}

export function GetBoxesModal({ open, onClose, onSelect }: GetBoxesModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--overlay-b)] backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        className="glass-strong w-full max-w-3xl animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="getboxes-title"
      >
        <MStripe />
        <div className="p-8 lg:p-10">
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="type-label text-m-blue-dark mb-2">
                STEP 01 / 02
              </div>
              <h2
                id="getboxes-title"
                className="type-display text-display-md"
              >
                CHOOSE A MODE
              </h2>
              <p className="text-body-md text-body mt-3 max-w-md">
                Box2Box adapts the canvas and export format to the task.
                You'll pick your dataset folder next.
              </p>
            </div>
            <button
              onClick={onClose}
              className="btn-icon"
              aria-label="Close"
            >
              <IconClose size={18} />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <ModeCard
              icon={IconBox}
              tag="DETECTION"
              title="OBJECT DETECTION"
              desc="Draw bounding boxes around objects in each image. Export to YOLO, COCO, or VOC."
              accent="m-blue-dark"
              onClick={() => onSelect("detection")}
            />
            <ModeCard
              icon={IconImage}
              tag="CLASSIFICATION"
              title="CLASSIFICATION"
              desc="Tag images with one or more class labels. Export to a single labels.json."
              accent="m-red"
              onClick={() => onSelect("classification")}
            />
          </div>

          <div className="mt-8 flex items-center justify-between text-caption text-muted">
            <span>YOUR FOLDER IS NEVER UPLOADED.</span>
            <span>PRESS ESC TO CLOSE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ModeCardProps {
  icon: typeof IconBox;
  tag: string;
  title: string;
  desc: string;
  accent: string;
  onClick: () => void;
}

function ModeCard({
  icon: Icon,
  tag,
  title,
  desc,
  accent,
  onClick,
}: ModeCardProps) {
  return (
    <button
      onClick={onClick}
      className="group text-left glass-tile p-6 flex flex-col gap-5 hover:border-white/20 transition-colors relative"
    >
      <div
        className={`absolute top-0 left-0 w-full h-[3px] bg-${accent} opacity-80`}
      />
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 bg-[var(--tint-a)] flex items-center justify-center text-on-dark">
          <Icon size={22} />
        </div>
        <span className="type-label text-muted">{tag}</span>
      </div>
      <div>
        <h3 className="font-display text-on-dark text-[22px] uppercase tracking-tight mb-2">
          {title}
        </h3>
        <p className="text-body-sm text-body">{desc}</p>
      </div>
      <div className="mt-auto flex items-center justify-between">
        <span className="type-label text-on-dark">SELECT</span>
        <IconArrow
          size={18}
          className="text-on-dark transition-transform group-hover:translate-x-1"
        />
      </div>
    </button>
  );
}

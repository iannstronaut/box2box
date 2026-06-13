import { useEffect, useRef } from "react";
import { IconBox, IconImage, IconClose, IconArrow } from "../common/Icons";
import { useLocale } from "../../context/LocaleContext";

interface GetBoxesModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (mode: "detection" | "classification") => void;
}

export function GetBoxesModal({ open, onClose, onSelect }: GetBoxesModalProps) {
  const { t } = useLocale();
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
        className="glass-strong w-full max-w-2xl animate-scale-in overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="getboxes-title"
      >
        <div className="p-7 lg:p-9">
          <div className="flex items-start justify-between mb-7">
            <div>
              <div className="type-eyebrow mb-2.5">{t("modal.step")}</div>
              <h2 id="getboxes-title" className="type-display text-display-sm">
                {t("modal.title")}
              </h2>
              <p className="text-body-md text-body mt-2.5 max-w-md">
                {t("modal.subtitle")}
              </p>
            </div>
            <button
              onClick={onClose}
              className="btn-icon-sm shrink-0"
              aria-label={t("common.close")}
            >
              <IconClose size={16} />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3.5">
            <ModeCard
              icon={IconBox}
              tag={t("modal.detection.tag")}
              title={t("modal.detection.title")}
              desc={t("modal.detection.desc")}
              tone="accent"
              onClick={() => onSelect("detection")}
            />
            <ModeCard
              icon={IconImage}
              tag={t("modal.classification.tag")}
              title={t("modal.classification.title")}
              desc={t("modal.classification.desc")}
              tone="rose"
              onClick={() => onSelect("classification")}
            />
          </div>

          <div className="mt-7 flex items-center justify-between text-caption text-muted">
            <span>{t("modal.neverUploaded")}</span>
            <span className="inline-flex items-center gap-1.5">
              {t("modal.press")}
              <kbd className="px-1.5 py-0.5 rounded-md bg-[var(--tint-b)] text-[10px] font-medium text-on-dark">
                Esc
              </kbd>
              {t("modal.toClose")}
            </span>
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
  tone: "accent" | "rose";
  onClick: () => void;
}

function ModeCard({ icon: Icon, tag, title, desc, tone, onClick }: ModeCardProps) {
  const { t } = useLocale();
  const tint = tone === "accent" ? "var(--accent)" : "var(--rose)";
  return (
    <button
      onClick={onClick}
      className="group text-left glass-tile p-5 flex flex-col gap-4 transition-all hover:-translate-y-0.5 hover:shadow-card"
      style={ { borderColor: "var(--hairline)" } }
    >
      <div className="flex items-center justify-between">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
          style={ { background: tint } }
        >
          <Icon size={20} />
        </div>
        <span className="chip">{tag}</span>
      </div>
      <div>
        <h3 className="font-display font-semibold text-on-dark text-title-lg mb-1.5">
          {title}
        </h3>
        <p className="text-body-sm text-body leading-relaxed">{desc}</p>
      </div>
      <div className="mt-auto flex items-center gap-1.5 text-[13px] font-medium font-display" style={ { color: tint } }>
        {t("modal.chooseThis")}
        <IconArrow
          size={16}
          className="transition-transform group-hover:translate-x-1"
        />
      </div>
    </button>
  );
}

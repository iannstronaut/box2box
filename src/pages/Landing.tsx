import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { TopNav } from "../components/layout/TopNav";
import { Footer } from "../components/layout/Footer";
import { GetBoxesModal } from "../components/landing/GetBoxesModal";
import { Button, Eyebrow } from "../components/common/Primitives";
import {
  IconArrow,
  IconBox,
  IconCrosshair,
  IconImage,
  IconShield,
  IconBolt,
  IconFolder,
  IconKeyboard,
  IconCheck,
} from "../components/common/Icons";
import { useWorkspace } from "../context/WorkspaceContext";
import { useLocale } from "../context/LocaleContext";
import { isFsApiSupported } from "../utils/filesystem";

export function Landing() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const ws = useWorkspace();

  const startWorkspace = () => {
    if (!isFsApiSupported()) {
      alert(t("alert.noFsLanding"));
      nav("/workspace");
      return;
    }
    setOpen(true);
  };

  const onOpen = async (mode: "detection" | "classification") => {
    setOpen(false);
    try {
      await ws.openFromPicker(mode);
      nav("/workspace");
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error(err);
        alert((err as Error).message ?? t("alert.cantOpenFolder"));
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <TopNav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 ambient" />
        <div className="absolute inset-0 grid-bg" />

        <div className="relative mx-auto max-w-[1320px] px-5 lg:px-8 pt-20 lg:pt-28 pb-20">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-7">
              <span className="chip mb-6">
                <IconShield size={13} className="text-success" />
                {t("hero.badge")}
              </span>

              <h1 className="type-display text-display-xl lg:text-[64px] leading-[1.02]">
                {t("hero.titleLine1")}
                <br />
                {t("hero.titlePre")}
                <span className="bg-gradient-to-r from-accent to-violet bg-clip-text text-transparent">
                  {t("hero.titleHighlight")}
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-body-md text-body">
                {t("hero.subtitle")}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button variant="primary" onClick={startWorkspace} className="group">
                  {t("hero.startAnnotating")}
                  <IconArrow
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Button>
                <a
                  href="#features"
                  className="btn-ghost"
                >
                  {t("hero.seeHow")}
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-caption text-muted">
                {["hero.point1", "hero.point2", "hero.point3"].map((k) => (
                  <span key={k} className="inline-flex items-center gap-1.5">
                    <IconCheck size={14} className="text-success" />
                    {t(k)}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <HeroGlass />
            </div>
          </div>
        </div>
      </section>

      {/* STRIP */}
      <section className="border-y border-hairline bg-surface-soft/50">
        <div className="mx-auto max-w-[1320px] px-5 lg:px-8 py-9 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { k: "100%", v: "strip.onDevice" },
            { k: "6", v: "strip.exportFormats" },
            { k: "0", v: "strip.cloudUploads" },
            { k: "✨", v: "strip.keyboardFirst" },
          ].map((s) => (
            <div key={s.v} className="flex flex-col gap-1.5">
              <span className="font-display font-semibold text-on-dark text-display-sm">
                {s.k}
              </span>
              <span className="text-body-sm text-muted">{t(s.v)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-section">
        <div className="mx-auto max-w-[1320px] px-5 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <Eyebrow className="mb-4">{t("features.eyebrow")}</Eyebrow>
              <h2 className="type-display text-display-lg">
                {t("features.title")}
              </h2>
            </div>
            <p className="max-w-md text-body-md text-body">
              {t("features.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <FeatureCard
                key={f.titleKey}
                icon={f.icon}
                title={t(f.titleKey)}
                desc={t(f.descKey)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FORMATS */}
      <section
        id="formats"
        className="py-section bg-surface-soft border-y border-hairline"
      >
        <div className="mx-auto max-w-[1320px] px-5 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <Eyebrow className="mb-4">{t("formats.eyebrow")}</Eyebrow>
              <h2 className="type-display text-display-lg mb-5">
                {t("formats.title")}
              </h2>
              <p className="text-body-md text-body max-w-md">
                {t("formats.bodyA")}
                <span className="text-on-dark font-medium">/labels</span>
                {t("formats.bodyB")}
              </p>
              <p className="text-body-sm text-muted max-w-md mt-3">
                {t("formats.classNote")}
              </p>
            </div>
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-3.5">
              {FORMATS.map((f) => (
                <div
                  key={f.name}
                  className="glass-tile p-5 flex flex-col gap-2.5 transition-all hover:-translate-y-0.5 hover:shadow-card"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-display font-semibold text-on-dark text-title-lg">
                      {f.name}
                    </span>
                    <span className="chip">{f.ext}</span>
                  </div>
                  <p className="text-body-sm text-body leading-relaxed">
                    {t(f.descKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-section">
        <div className="mx-auto max-w-[1320px] px-5 lg:px-8">
          <div className="glass-strong p-10 lg:p-16 relative overflow-hidden">
            <div className="absolute -right-24 -bottom-24 w-[420px] h-[420px] rounded-full opacity-60 pointer-events-none blur-3xl"
              style={ { background: "radial-gradient(circle at 30% 30%, var(--accent), transparent 70%)" } }
            />
            <div className="relative max-w-2xl">
              <Eyebrow className="mb-4">{t("cta.eyebrow")}</Eyebrow>
              <h2 className="type-display text-display-lg mb-4">
                {t("cta.title")}
              </h2>
              <p className="text-body-md text-body mb-8 max-w-lg">
                {t("cta.body")}
              </p>
              <Button variant="primary" onClick={startWorkspace} className="group">
                Start annotating
                <IconArrow
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <GetBoxesModal
        open={open}
        onClose={() => setOpen(false)}
        onSelect={onOpen}
      />
    </div>
  );
}

function HeroGlass() {
  const { t } = useLocale();
  return (
    <div className="glass-strong p-5 relative animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-warning/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-success/80" />
          </span>
          <span className="text-caption text-muted ml-1">img_0042.jpg</span>
        </div>
        <span className="text-caption text-muted">1920 × 1080</span>
      </div>

      <div className="relative aspect-[4/3] checker overflow-hidden rounded-xl">
        <svg viewBox="0 0 400 300" className="w-full h-full">
          <defs>
            <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="var(--violet)" stopOpacity="0.18" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="400" height="300" fill="url(#bg)" />
          <circle cx="280" cy="120" r="55" fill="#fff" opacity="0.12" />
          <path
            d="M0 220 Q100 180 200 220 T400 230 L400 300 L0 300 Z"
            fill="#000"
            opacity="0.28"
          />
          <rect x="60" y="80" width="180" height="120" fill="none" stroke="var(--accent)" strokeWidth="2.5" rx="4" />
          <rect x="240" y="40" width="120" height="80" fill="none" stroke="var(--rose)" strokeWidth="2.5" rx="4" />
          <rect x="100" y="200" width="100" height="60" fill="none" stroke="var(--success)" strokeWidth="2.5" rx="4" />
        </svg>

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {[
            { c: "var(--accent)", t: "Car · 0.94" },
            { c: "var(--rose)", t: "Sign · 0.81" },
            { c: "var(--success)", t: "Tree · 0.76" },
          ].map((b) => (
            <div
              key={b.t}
              className="bg-black/55 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1.5 text-[10px] font-medium text-white"
            >
              <span className="w-1.5 h-1.5 rounded-full" style={ { background: b.c } } />
              {b.t}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-caption text-muted">
        <span>{t("hero.boxesClasses")}</span>
        <span className="inline-flex items-center gap-1.5 text-success">
          <IconCheck size={13} /> {t("hero.savedToLabels")}
        </span>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: IconFolder,
    titleKey: "features.openFolder.title",
    descKey: "features.openFolder.desc",
  },
  {
    icon: IconCrosshair,
    titleKey: "features.draw.title",
    descKey: "features.draw.desc",
  },
  {
    icon: IconKeyboard,
    titleKey: "features.keyboard.title",
    descKey: "features.keyboard.desc",
  },
  {
    icon: IconImage,
    titleKey: "features.anyFormat.title",
    descKey: "features.anyFormat.desc",
  },
  {
    icon: IconBolt,
    titleKey: "features.instant.title",
    descKey: "features.instant.desc",
  },
  {
    icon: IconShield,
    titleKey: "features.private.title",
    descKey: "features.private.desc",
  },
];

const FORMATS = [
  { name: "YOLO", ext: ".txt", descKey: "formats.yolo.desc" },
  { name: "COCO", ext: ".json", descKey: "formats.coco.desc" },
  { name: "Pascal VOC", ext: ".xml", descKey: "formats.voc.desc" },
  { name: "JSON", ext: ".json", descKey: "formats.json.desc" },
  { name: "CSV", ext: ".csv", descKey: "formats.csv.desc" },
  { name: "JSON Lines", ext: ".jsonl", descKey: "formats.jsonl.desc" },
];

interface FeatureCardProps {
  icon: typeof IconBox;
  title: string;
  desc: string;
}


function FeatureCard({ icon: Icon, title, desc }: FeatureCardProps) {
  return (
    <div className="glass p-6 flex flex-col gap-5 group transition-all hover:-translate-y-1 hover:shadow-card">
      <div className="flex items-center justify-between">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-accent bg-[var(--accent-soft)]">
          <Icon size={20} />
        </div>
        <IconArrow
          size={17}
          className="text-muted group-hover:text-on-dark group-hover:translate-x-1 transition-all"
        />
      </div>
      <div>
        <h3 className="font-display font-semibold text-on-dark text-title-lg mb-2">
          {title}
        </h3>
        <p className="text-body-sm text-body leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

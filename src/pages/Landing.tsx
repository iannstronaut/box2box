import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { TopNav } from "../components/layout/TopNav";
import { Footer } from "../components/layout/Footer";
import { GetBoxesModal } from "../components/landing/GetBoxesModal";
import { MStripe } from "../components/common/MStripe";
import { Button } from "../components/common/Primitives";
import {
  IconArrow,
  IconBox,
  IconCrosshair,
  IconImage,
  IconLock,
  IconSpark,
  IconFolder,
  IconKeyboard,
} from "../components/common/Icons";
import { useWorkspace } from "../context/WorkspaceContext";
import { isFsApiSupported } from "../utils/filesystem";

export function Landing() {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const ws = useWorkspace();

  const startWorkspace = () => {
    if (!isFsApiSupported()) {
      alert(
        "File System Access API is not supported in this browser. Please use Chrome, Edge, or another Chromium-based browser.",
      );
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
        alert((err as Error).message ?? "Failed to open directory");
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
        <div className="absolute inset-x-0 top-0">
          <MStripe />
        </div>

        <div className="relative mx-auto max-w-[1440px] px-6 lg:px-10 pt-20 lg:pt-32 pb-24 lg:pb-32">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-end">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-8">
                <span className="type-label text-m-blue-dark">LOCAL-FIRST</span>
                <span className="h-px w-8 bg-hairline" />
                <span className="type-label text-muted">v0.1.0</span>
              </div>

              <h1 className="type-display text-display-xl lg:text-[112px] leading-[0.95]">
                BOXES.
                <br />
                <span className="text-body-strong">BORDERS.</span>
                <br />
                <span className="text-body">TRAINING-READY.</span>
              </h1>

              <p className="mt-10 max-w-2xl text-body-md text-body font-body" style={{ fontWeight: 300 }}>
                A precision annotation studio for object detection and image
                classification. Files stay on your machine — never on a
                server. Export to YOLO, COCO, Pascal VOC, or JSON.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button
                  variant="primary"
                  onClick={startWorkspace}
                  className="group"
                >
                  GET BOXES
                  <IconArrow
                    size={18}
                    className="ml-3 transition-transform group-hover:translate-x-1"
                  />
                </Button>
                <a href="#features" className="type-label text-on-dark/90 hover:text-on-dark">
                  SEE FEATURES
                </a>
              </div>
            </div>

            <div className="lg:col-span-4">
              <HeroGlass />
            </div>
          </div>
        </div>
      </section>

      {/* STRIP */}
      <section className="border-y border-hairline">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { k: "100%", v: "Local file access" },
            { k: "4", v: "Export formats" },
            { k: "0", v: "Cloud uploads" },
            { k: "< 50ms", v: "UI latency" },
          ].map((s) => (
            <div key={s.v} className="flex flex-col gap-2">
              <span className="font-display text-on-dark text-display-md">
                {s.k}
              </span>
              <span className="type-label text-muted">{s.v}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-section">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <div className="flex items-end justify-between mb-16">
            <div>
              <div className="type-label text-m-blue-dark mb-4">CAPABILITIES</div>
              <h2 className="type-display text-display-lg">
                ENGINEERED FOR SPEED.
              </h2>
            </div>
            <p className="hidden md:block max-w-md text-body-md text-body">
              Every pixel of the UI is built to disappear when you start
              annotating.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* FORMATS */}
      <section id="formats" className="py-section bg-surface-soft border-y border-hairline">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <div className="type-label text-m-red mb-4">EXPORT</div>
              <h2 className="type-display text-display-lg mb-6">
                EXPORT TO ANY PIPELINE.
              </h2>
              <p className="text-body-md text-body max-w-md">
                Pick a format per project. Box2Box writes the labels into your
                local <span className="text-on-dark">/labels</span> directory
                using the same image basename — drop the result straight into
                Ultralytics, MMDetection, Detectron2, or your own trainer.
              </p>
            </div>
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
              {FORMATS.map((f) => (
                <div
                  key={f.name}
                  className="glass-tile p-6 flex flex-col gap-3 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-display text-on-dark text-[20px]">
                      {f.name}
                    </span>
                    <span className="type-label text-muted">{f.ext}</span>
                  </div>
                  <p className="text-body-sm text-body">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-section">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <div className="glass-strong p-12 lg:p-20 relative overflow-hidden">
            <div className="absolute -right-20 -bottom-20 w-[480px] h-[480px] opacity-30 pointer-events-none">
              <div className="w-full h-full grid grid-cols-8 grid-rows-8">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div
                    key={i}
                    className="border border-[var(--tint-strong)]"
                    style={{
                      background:
                        i % 7 === 0
                          ? "rgba(28, 105, 212, 0.5)"
                          : i % 11 === 0
                            ? "rgba(226, 39, 24, 0.4)"
                            : "transparent",
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="relative max-w-2xl">
              <div className="type-label text-m-red mb-4">START ANNOTATING</div>
              <h2 className="type-display text-display-lg mb-8">
                YOUR DATASET. YOUR DISK. YOUR MODEL.
              </h2>
              <Button variant="primary" onClick={startWorkspace}>
                GET BOXES
                <IconArrow size={18} className="ml-3" />
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
  return (
    <div className="glass-strong p-6 relative">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-m-red" />
          <span className="type-label text-on-dark">SESSION.IMG_0042.JPG</span>
        </div>
        <span className="type-label text-muted">1920 × 1080</span>
      </div>

      <div className="relative aspect-[4/3] checker overflow-hidden">
        <svg viewBox="0 0 400 300" className="w-full h-full">
          <defs>
            <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1c69d4" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0066b1" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="400" height="300" fill="url(#bg)" />
          <circle cx="280" cy="120" r="55" fill="#fff" opacity="0.15" />
          <path
            d="M0 220 Q100 180 200 220 T400 230 L400 300 L0 300 Z"
            fill="#000"
            opacity="0.5"
          />
          <rect
            x="60"
            y="80"
            width="180"
            height="120"
            fill="none"
            stroke="#1c69d4"
            strokeWidth="2"
          />
          <rect
            x="240"
            y="40"
            width="120"
            height="80"
            fill="none"
            stroke="#e22718"
            strokeWidth="2"
          />
          <rect
            x="100"
            y="200"
            width="100"
            height="60"
            fill="none"
            stroke="#0fa336"
            strokeWidth="2"
          />
        </svg>

        <div className="absolute top-3 left-3 flex flex-col gap-2 text-[10px] type-label">
          <div className="bg-black/60 backdrop-blur-sm px-2 py-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-m-blue-dark" />
            CAR · 0.94
          </div>
          <div className="bg-black/60 backdrop-blur-sm px-2 py-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-m-red" />
            SIGN · 0.81
          </div>
          <div className="bg-black/60 backdrop-blur-sm px-2 py-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-success" />
            TREE · 0.76
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between text-caption text-muted">
        <span>3 BOXES · 3 CLASSES</span>
        <span>YOLO · 0.32s</span>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: IconFolder,
    title: "PICK A FOLDER",
    desc: "Use your OS file picker. Box2Box reads images and existing labels in place — nothing is uploaded.",
  },
  {
    icon: IconCrosshair,
    title: "DRAW TO ANNOTATE",
    desc: "Click and drag bounding boxes with sub-pixel precision. Toggle classes, undo mistakes, copy between images.",
  },
  {
    icon: IconKeyboard,
    title: "KEYBOARD FIRST",
    desc: "Class hotkeys, prev / next image, undo, delete box, save — your hands never leave the keyboard.",
  },
  {
    icon: IconImage,
    title: "ANY FORMAT",
    desc: "YOLO .txt, COCO .json, Pascal VOC .xml, plain JSON. Import existing datasets or start clean.",
  },
  {
    icon: IconSpark,
    title: "AUTO-DETECT",
    desc: "Existing labels are parsed and rendered. Class names match your classes.txt — no manual mapping.",
  },
  {
    icon: IconLock,
    title: "100% LOCAL",
    desc: "No backend, no telemetry, no cloud. The browser's File System Access API keeps everything on disk.",
  },
];

const FORMATS = [
  {
    name: "YOLO",
    ext: ".txt",
    desc: "class cx cy w h (normalized). Pair with classes.txt and you're good for Ultralytics.",
  },
  {
    name: "COCO",
    ext: ".json",
    desc: "Single JSON with images, categories, annotations, and bboxes. MMDetection / Detectron2 native.",
  },
  {
    name: "Pascal VOC",
    ext: ".xml",
    desc: "Per-image XML with absolute pixel bboxes. The legacy standard that still works everywhere.",
  },
  {
    name: "JSON",
    ext: ".json",
    desc: "A clean, human-readable schema per image. Easy to read, easy to transform.",
  },
];

interface FeatureCardProps {
  icon: typeof IconBox;
  title: string;
  desc: string;
}

function FeatureCard({ icon: Icon, title, desc }: FeatureCardProps) {
  return (
    <div className="glass p-8 flex flex-col gap-6 group hover:border-white/15 transition-colors min-h-[260px]">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 glass-soft flex items-center justify-center text-on-dark">
          <Icon size={22} />
        </div>
        <IconArrow
          size={18}
          className="text-muted group-hover:text-on-dark group-hover:translate-x-1 transition-all"
        />
      </div>
      <div className="mt-auto">
        <h3 className="font-display text-on-dark text-[20px] uppercase tracking-tight mb-3">
          {title}
        </h3>
        <p className="text-body-sm text-body">{desc}</p>
      </div>
    </div>
  );
}

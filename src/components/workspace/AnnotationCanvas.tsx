import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { BoundingBox, ImageFile } from "../../types";
import { UNCLASS_ID, isUnclass } from "../../types";
import { useWorkspace } from "../../context/WorkspaceContext";
import { uid } from "../../utils/id";
import { IconPlus } from "../common/Icons";

type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

interface ViewTransform {
  zoom: number;
  panX: number;
  panY: number;
}

interface ResizeState {
  boxId: string;
  handle: ResizeHandle;
  startWorld: { x: number; y: number };
  orig: BoundingBox;
}

interface AnnotationCanvasProps {
  image: ImageFile;
}

const MIN_ZOOM = 0.05;
const MAX_ZOOM = 20;
const ZOOM_STEP = 1.15;
const MIN_BOX = 4;

export function AnnotationCanvas({ image }: AnnotationCanvasProps) {
  const ws = useWorkspace();
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<ViewTransform>({ zoom: 1, panX: 0, panY: 0 });
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  // Drawing state
  const [drawing, setDrawing] = useState<{
    startWorld: { x: number; y: number };
    currentWorld: { x: number; y: number };
  } | null>(null);

  // Pan state
  const [panning, setPanning] = useState<{
    startClient: { x: number; y: number };
    startPan: { x: number; y: number };
  } | null>(null);

  // Resize state
  const [resizing, setResizing] = useState<ResizeState | null>(null);

  // Selected box
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [hoverHandle, setHoverHandle] = useState<ResizeHandle | null>(null);

  // Space-key for pan
  const [spaceDown, setSpaceDown] = useState(false);

  const boxes = ws.boxes[image.id] ?? [];

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setContainerSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Reset selection & view on image change
  useEffect(() => {
    setSelectedBoxId(null);
    // Fit on image change
    fitToScreen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image.id]);

  // ------------- Coordinate helpers -------------
  const clientToWorld = useCallback(
    (cx: number, cy: number) => {
      const r = containerRef.current!.getBoundingClientRect();
      const sx = cx - r.left;
      const sy = cy - r.top;
      return {
        x: (sx - view.panX) / view.zoom,
        y: (sy - view.panY) / view.zoom,
      };
    },
    [view],
  );

  const worldToScreen = useCallback(
    (wx: number, wy: number) => ({
      x: wx * view.zoom + view.panX,
      y: wy * view.zoom + view.panY,
    }),
    [view],
  );

  // ------------- Zoom (wheel) -------------
  const zoomAt = useCallback(
    (sx: number, sy: number, factor: number) => {
      setView((v) => {
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, v.zoom * factor));
        if (newZoom === v.zoom) return v;
        const wx = (sx - v.panX) / v.zoom;
        const wy = (sy - v.panY) / v.zoom;
        return {
          zoom: newZoom,
          panX: sx - wx * newZoom,
          panY: sy - wy * newZoom,
        };
      });
    },
    [],
  );

  // ------------- Fit to screen -------------
  const fitToScreen = useCallback(() => {
    if (!image.width || !image.height || !containerSize.w || !containerSize.h)
      return;
    const margin = 40;
    const sx = containerSize.w - margin * 2;
    const sy = containerSize.h - margin * 2;
    const z = Math.min(sx / image.width, sy / image.height);
    setView({
      zoom: z,
      panX: (containerSize.w - image.width * z) / 2,
      panY: (containerSize.h - image.height * z) / 2,
    });
  }, [image.width, image.height, containerSize.w, containerSize.h]);

  // Auto-fit on container size change
  useLayoutEffect(() => {
    if (containerSize.w && containerSize.h && view.zoom === 1 && view.panX === 0 && view.panY === 0) {
      fitToScreen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerSize.w, containerSize.h]);

  // ------------- Wheel handler (zoom) -------------
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const sx = e.clientX - r.left;
      const sy = e.clientY - r.top;
      const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
      zoomAt(sx, sy, factor);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  // ------------- Keyboard: space-to-pan + shortcuts -------------
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (e.code === "Space" && !spaceDown) {
        e.preventDefault();
        setSpaceDown(true);
        return;
      }
      // Zoom in / out
      if ((e.ctrlKey || e.metaKey) && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        const r = containerRef.current!.getBoundingClientRect();
        zoomAt(r.width / 2, r.height / 2, ZOOM_STEP);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        const r = containerRef.current!.getBoundingClientRect();
        zoomAt(r.width / 2, r.height / 2, 1 / ZOOM_STEP);
        return;
      }
      if (e.key === "0") {
        e.preventDefault();
        fitToScreen();
        return;
      }
      if (e.key === "1") {
        e.preventDefault();
        // Reset to 1:1 centered
        setView({
          zoom: 1,
          panX: (containerSize.w - image.width) / 2,
          panY: (containerSize.h - image.height) / 2,
        });
        return;
      }
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        fitToScreen();
        return;
      }
      // Delete selected box
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedBoxId
      ) {
        e.preventDefault();
        ws.setBoxes(
          image.id,
          boxes.filter((b) => b.id !== selectedBoxId),
        );
        setSelectedBoxId(null);
        return;
      }
      // Class hotkeys
      if (/^[1-9]$/.test(e.key)) {
        const idx = Number(e.key) - 1;
        if (idx < ws.classes.length) {
          ws.setSelectedClassId(ws.classes[idx].id);
        }
      }
      // `0` key selects unclass
      if (e.key === "0") {
        // Only if not already in fit/zoom context
      }
      // Prev / next image
      if (e.key === "[" || e.key === "p" || e.key === "P") {
        e.preventDefault();
        ws.goPrev();
      }
      if (e.key === "]" || e.key === "n" || e.key === "N") {
        e.preventDefault();
        ws.goNext();
      }
      // Export
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        ws.exportAll();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setSpaceDown(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [
    selectedBoxId,
    boxes,
    image.id,
    image.width,
    image.height,
    containerSize.w,
    containerSize.h,
    spaceDown,
    zoomAt,
    fitToScreen,
    ws,
  ]);

  // ------------- Pointer interactions -------------
  const getCursorMode = (
    e: React.PointerEvent,
  ): "draw" | "pan" | "resize" => {
    if (e.button === 1) return "pan";
    if (e.button === 0 && (e.shiftKey || spaceDown)) return "pan";
    if (e.button === 0 && hoverHandle) return "resize";
    return "draw";
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.button !== 1) return;
    const r = containerRef.current!.getBoundingClientRect();
    const sx = e.clientX - r.left;
    const sy = e.clientY - r.top;
    const world = clientToWorld(e.clientX, e.clientY);

    // Resize handle hit-test first (only on selected box, left button)
    if (e.button === 0 && selectedBoxId) {
      const box = boxes.find((b) => b.id === selectedBoxId);
      if (box) {
        const handle = hitTestHandle(box, sx, sy);
        if (handle) {
          setResizing({
            boxId: box.id,
            handle,
            startWorld: world,
            orig: { ...box },
          });
          (e.target as Element).setPointerCapture(e.pointerId);
          return;
        }
      }
    }

    const mode = getCursorMode(e);
    if (mode === "pan") {
      setPanning({
        startClient: { x: e.clientX, y: e.clientY },
        startPan: { x: view.panX, y: view.panY },
      });
      (e.target as Element).setPointerCapture(e.pointerId);
      return;
    }

    // draw — always allowed (uses unclass by default)
    if (ws.mode !== "detection") return;
    if (!ws.selectedClassId) {
      ws.setSelectedClassId(UNCLASS_ID);
    }
    setDrawing({ startWorld: world, currentWorld: world });
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (panning) {
      setView((v) => ({
        ...v,
        panX: panning.startPan.x + (e.clientX - panning.startClient.x),
        panY: panning.startPan.y + (e.clientY - panning.startClient.y),
      }));
      return;
    }
    if (drawing) {
      setDrawing({
        ...drawing,
        currentWorld: clientToWorld(e.clientX, e.clientY),
      });
      return;
    }
    if (resizing) {
      const w = clientToWorld(e.clientX, e.clientY);
      const next = applyResize(resizing, w);
      ws.setBoxes(
        image.id,
        boxes.map((b) => (b.id === next.id ? next : b)),
      );
      return;
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (panning) {
      setPanning(null);
      (e.target as Element).releasePointerCapture?.(e.pointerId);
      return;
    }
    if (drawing) {
      const a = drawing.startWorld;
      const b = drawing.currentWorld;
      const x = Math.min(a.x, b.x);
      const y = Math.min(a.y, b.y);
      const w = Math.abs(b.x - a.x);
      const h = Math.abs(b.y - a.y);
      setDrawing(null);
      (e.target as Element).releasePointerCapture?.(e.pointerId);
      if (w < MIN_BOX || h < MIN_BOX) return;
      const newBox: BoundingBox = {
        id: uid(),
        classId: ws.selectedClassId ?? UNCLASS_ID,
        x: clamp(x, 0, image.width),
        y: clamp(y, 0, image.height),
        w: Math.min(w, image.width),
        h: Math.min(h, image.height),
      };
      ws.setBoxes(image.id, [...boxes, newBox]);
      setSelectedBoxId(newBox.id);
      return;
    }
    if (resizing) {
      setResizing(null);
      (e.target as Element).releasePointerCapture?.(e.pointerId);
      return;
    }
  };

  // Click on a box (only when not drawing/panning)
  const onSvgClick = (e: React.MouseEvent, boxId: string) => {
    if (panning || drawing || resizing) return;
    e.stopPropagation();
    setSelectedBoxId(boxId);
  };

  const onBgClick = () => {
    if (panning || drawing || resizing) return;
    setSelectedBoxId(null);
  };

  // Hit-test resize handles
  const hitTestHandle = (b: BoundingBox, sx: number, sy: number): ResizeHandle | null => {
    const tl = worldToScreen(b.x, b.y);
    const tr = worldToScreen(b.x + b.w, b.y);
    const bl = worldToScreen(b.x, b.y + b.h);
    const br = worldToScreen(b.x + b.w, b.y + b.h);
    const midT = worldToScreen(b.x + b.w / 2, b.y);
    const midB = worldToScreen(b.x + b.w / 2, b.y + b.h);
    const midL = worldToScreen(b.x, b.y + b.h / 2);
    const midR = worldToScreen(b.x + b.w, b.y + b.h / 2);
    const size = 10;
    const points: { h: ResizeHandle; x: number; y: number }[] = [
      { h: "nw", x: tl.x, y: tl.y },
      { h: "n", x: midT.x, y: midT.y },
      { h: "ne", x: tr.x, y: tr.y },
      { h: "e", x: midR.x, y: midR.y },
      { h: "se", x: br.x, y: br.y },
      { h: "s", x: midB.x, y: midB.y },
      { h: "sw", x: bl.x, y: bl.y },
      { h: "w", x: midL.x, y: midL.y },
    ];
    for (const p of points) {
      if (Math.abs(sx - p.x) <= size && Math.abs(sy - p.y) <= size) return p.h;
    }
    return null;
  };

  // Track hover for cursor & handle highlight
  const onSvgMouseMove = (e: React.MouseEvent) => {
    if (!selectedBoxId) {
      setHoverHandle(null);
      return;
    }
    const box = boxes.find((b) => b.id === selectedBoxId);
    if (!box) return;
    const r = containerRef.current!.getBoundingClientRect();
    const handle = hitTestHandle(box, e.clientX - r.left, e.clientY - r.top);
    setHoverHandle(handle);
  };

  const onSvgMouseLeave = () => setHoverHandle(null);

  // ------------- Cursor style -------------
  const cursor = useMemo(() => {
    if (panning) return "grabbing";
    if (spaceDown) return "grab";
    if (hoverHandle) return cursorForHandle(hoverHandle);
    if (ws.mode === "detection" && ws.selectedClassId) return "crosshair";
    return "default";
  }, [panning, spaceDown, hoverHandle, ws.mode, ws.selectedClassId]);

  // ------------- Render -------------
  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        ref={containerRef}
        className="relative flex-1 checker min-h-0 overflow-hidden select-none"
        style={{ cursor }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={onBgClick}
      >
        {/* Transformed content layer */}
        <div
          className="absolute top-0 left-0"
          style={{
            transform: `translate(${view.panX}px, ${view.panY}px) scale(${view.zoom})`,
            transformOrigin: "0 0",
            willChange: "transform",
          }}
        >
          <img
            src={image.url}
            alt={image.name}
            className="block pointer-events-none"
            style={{ width: image.width, height: image.height }}
            draggable={false}
          />
        </div>

        {/* SVG overlay in screen space (we draw at world coords multiplied by zoom via CSS transform on the SVG itself) */}
        <svg
          className="absolute top-0 left-0 pointer-events-none"
          width={containerSize.w}
          height={containerSize.h}
        >
          <g
            transform={`translate(${view.panX} ${view.panY}) scale(${view.zoom})`}
            style={{ pointerEvents: "auto" }}
            onMouseMove={onSvgMouseMove}
            onMouseLeave={onSvgMouseLeave}
          >
            {boxes.map((b) => {
              const cls = ws.classes.find((c) => c.id === b.classId);
              const color = cls?.color ?? "#fff";
              const sel = selectedBoxId === b.id;
              return (
                <g key={b.id} style={{ cursor: "pointer" }}>
                  <rect
                    x={b.x}
                    y={b.y}
                    width={b.w}
                    height={b.h}
                    fill={sel ? `${hexToRgba(color, 0.15)}` : "transparent"}
                    stroke={color}
                    strokeWidth={sel ? 2 / view.zoom : 1.5 / view.zoom}
                    onClick={(e) => onSvgClick(e, b.id)}
                  />
                  {/* Label tag */}
                  <g
                    onClick={(e) => onSvgClick(e, b.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <rect
                      x={b.x}
                      y={Math.max(0, b.y - 22 / view.zoom)}
                      width={Math.max(40, (cls?.name.length ?? 4) * 8) / view.zoom + 12 / view.zoom}
                      height={20 / view.zoom}
                      fill={color}
                    />
                    <text
                      x={b.x + 6 / view.zoom}
                      y={Math.max(0, b.y - 6 / view.zoom)}
                      fill="#000"
                      fontSize={12 / view.zoom}
                      fontWeight={700}
                      fontFamily="Inter, sans-serif"
                      style={{ textTransform: "uppercase" }}
                    >
                      {cls?.name ?? "?"}
                    </text>
                  </g>
                  {sel && (
                    <ResizeHandlesG
                      box={b}
                      zoom={view.zoom}
                      color={color}
                    />
                  )}
                </g>
              );
            })}
            {drawing && (
              <rect
                x={Math.min(drawing.startWorld.x, drawing.currentWorld.x)}
                y={Math.min(drawing.startWorld.y, drawing.currentWorld.y)}
                width={Math.abs(drawing.currentWorld.x - drawing.startWorld.x)}
                height={Math.abs(drawing.currentWorld.y - drawing.startWorld.y)}
                fill="rgba(28,105,212,0.15)"
                stroke="#1c69d4"
                strokeWidth={1.5 / view.zoom}
                strokeDasharray={`${4 / view.zoom} ${4 / view.zoom}`}
              />
            )}
          </g>
        </svg>

        {/* Active class badge (detection) */}
        {ws.mode === "detection" && (() => {
          const activeCls = ws.classes.find((c) => c.id === ws.selectedClassId);
          const isUn = !activeCls || isUnclass(activeCls.id);
          return (
            <div
              className="absolute top-2 left-2 glass-soft px-2.5 py-1 flex items-center gap-1.5 pointer-events-none"
              title={isUn ? "Drawing as 'unclass' — change class in the right sidebar" : "Active class"}
            >
              <span
                className="w-2 h-2"
                style={{ background: activeCls?.color ?? "#888" }}
              />
              <span className="type-label text-on-dark">
                {activeCls?.name ?? "unclass"}
              </span>
            </div>
          );
        })()}

        {ws.mode === "classification" && (
          <div className="absolute top-2 left-2 glass-soft px-2.5 py-1.5 text-caption text-on-dark pointer-events-none">
            <IconPlus size={11} className="inline mr-1.5 text-m-red" />
            TAG THIS IMAGE
          </div>
        )}

        {/* Floating controls */}
        <FloatingZoom
          zoom={view.zoom}
          onZoomIn={() => {
            const r = containerRef.current!.getBoundingClientRect();
            zoomAt(r.width / 2, r.height / 2, ZOOM_STEP);
          }}
          onZoomOut={() => {
            const r = containerRef.current!.getBoundingClientRect();
            zoomAt(r.width / 2, r.height / 2, 1 / ZOOM_STEP);
          }}
          onFit={fitToScreen}
          onReset={() => {
            setView({
              zoom: 1,
              panX: (containerSize.w - image.width) / 2,
              panY: (containerSize.h - image.height) / 2,
            });
          }}
        />

        <Minimap
          image={image}
          view={view}
          containerSize={containerSize}
          boxes={boxes}
          onJump={(worldX, worldY) => {
            setView((v) => ({
              ...v,
              panX: containerSize.w / 2 - worldX * v.zoom,
              panY: containerSize.h / 2 - worldY * v.zoom,
            }));
          }}
        />

        {/* Bottom classification panel */}
        <div className="absolute bottom-0 inset-x-0 pointer-events-none">
          <div className="pointer-events-auto">
            {ws.mode === "classification" ? (
              <ClassificationPanel
                image={image}
                onClickClass={(classId) =>
                  ws.toggleClassification(image.id, classId)
                }
              />
            ) : (
              <div
                className="backdrop-blur-glass border-t px-3 py-1.5 flex items-center gap-3 text-[11px]"
                style={{
                  background: "var(--overlay-b)",
                  borderColor: "var(--hairline)",
                  color: "var(--muted)",
                }}
              >
                <span className="type-label text-on-dark">
                  {boxes.length} BX
                </span>
                <span>·</span>
                <span className="tabular-nums">
                  {Math.round(view.zoom * 100)}%
                </span>
                <span className="hidden md:inline">·</span>
                <span className="hidden md:inline">
                  DRAG TO DRAW · SHIFT+DRAG TO PAN · WHEEL TO ZOOM
                </span>
                <span className="ml-auto">
                  {selectedBoxId ? "BOX SELECTED" : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function cursorForHandle(h: ResizeHandle): string {
  switch (h) {
    case "n":
    case "s":
      return "ns-resize";
    case "e":
    case "w":
      return "ew-resize";
    case "ne":
    case "sw":
      return "nesw-resize";
    case "nw":
    case "se":
      return "nwse-resize";
  }
}

function hexToRgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function applyResize(state: ResizeState, cur: { x: number; y: number }): BoundingBox {
  const { orig, handle } = state;
  let { x, y, w, h } = orig;
  const dx = cur.x - state.startWorld.x;
  const dy = cur.y - state.startWorld.y;
  switch (handle) {
    case "e":
      w = orig.w + dx;
      break;
    case "w":
      x = orig.x + dx;
      w = orig.w - dx;
      break;
    case "s":
      h = orig.h + dy;
      break;
    case "n":
      y = orig.y + dy;
      h = orig.h - dy;
      break;
    case "se":
      w = orig.w + dx;
      h = orig.h + dy;
      break;
    case "sw":
      x = orig.x + dx;
      w = orig.w - dx;
      h = orig.h + dy;
      break;
    case "ne":
      w = orig.w + dx;
      y = orig.y + dy;
      h = orig.h - dy;
      break;
    case "nw":
      x = orig.x + dx;
      y = orig.y + dy;
      w = orig.w - dx;
      h = orig.h - dy;
      break;
  }
  // Normalize negative dims
  if (w < 0) {
    x = x + w;
    w = -w;
  }
  if (h < 0) {
    y = y + h;
    h = -h;
  }
  if (w < MIN_BOX) w = MIN_BOX;
  if (h < MIN_BOX) h = MIN_BOX;
  return { id: orig.id, classId: orig.classId, x, y, w, h };
}

interface ResizeHandlesGProps {
  box: BoundingBox;
  zoom: number;
  color: string;
}
function ResizeHandlesG({ box, zoom, color }: ResizeHandlesGProps) {
  const s = 8 / zoom;
  const positions: { h: ResizeHandle; x: number; y: number; cx: number; cy: number }[] = [
    { h: "nw", x: box.x, y: box.y, cx: box.x, cy: box.y },
    { h: "n", x: box.x + box.w / 2, y: box.y, cx: box.x + box.w / 2, cy: box.y },
    { h: "ne", x: box.x + box.w, y: box.y, cx: box.x + box.w, cy: box.y },
    { h: "e", x: box.x + box.w, y: box.y + box.h / 2, cx: box.x + box.w, cy: box.y + box.h / 2 },
    { h: "se", x: box.x + box.w, y: box.y + box.h, cx: box.x + box.w, cy: box.y + box.h },
    { h: "s", x: box.x + box.w / 2, y: box.y + box.h, cx: box.x + box.w / 2, cy: box.y + box.h },
    { h: "sw", x: box.x, y: box.y + box.h, cx: box.x, cy: box.y + box.h },
    { h: "w", x: box.x, y: box.y + box.h / 2, cx: box.x, cy: box.y + box.h / 2 },
  ];
  return (
    <g>
      {positions.map((p) => (
        <rect
          key={p.h}
          x={p.cx - s / 2}
          y={p.cy - s / 2}
          width={s}
          height={s}
          fill="#fff"
          stroke={color}
          strokeWidth={1 / zoom}
          style={{ cursor: cursorForHandle(p.h) }}
        />
      ))}
    </g>
  );
}

interface FloatingZoomProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onReset: () => void;
}
function FloatingZoom({ zoom, onZoomIn, onZoomOut, onFit, onReset }: FloatingZoomProps) {
  return (
    <div className="absolute bottom-2 right-2 glass-soft flex items-center text-on-dark rounded-full overflow-hidden">
      <button
        onClick={onZoomOut}
        className="w-7 h-7 flex items-center justify-center text-[14px] hover:bg-[var(--tint-b)]"
        aria-label="Zoom out"
        title="Zoom out"
      >
        −
      </button>
      <button
        onClick={onReset}
        className="px-1.5 h-7 text-[10px] tabular-nums hover:bg-[var(--tint-b)] border-x border-[var(--hairline)] min-w-[42px]"
        title="Click to reset to 100%"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        onClick={onZoomIn}
        className="w-7 h-7 flex items-center justify-center text-[14px] hover:bg-[var(--tint-b)]"
        aria-label="Zoom in"
        title="Zoom in"
      >
        +
      </button>
      <button
        onClick={onFit}
        className="h-7 px-2 text-[10px] type-label hover:bg-[var(--tint-b)] border-l border-[var(--hairline)]"
        title="Fit to screen (F)"
      >
        FIT
      </button>
    </div>
  );
}

interface MinimapProps {
  image: ImageFile;
  view: ViewTransform;
  containerSize: { w: number; h: number };
  boxes: BoundingBox[];
  onJump: (worldX: number, worldY: number) => void;
}
function Minimap({ image, view, containerSize, boxes, onJump }: MinimapProps) {
  const W = 96;
  const H = (W * image.height) / image.width;
  const scale = W / image.width;
  const viewLeft = -view.panX / view.zoom;
  const viewTop = -view.panY / view.zoom;
  const viewW = containerSize.w / view.zoom;
  const viewH = containerSize.h / view.zoom;
  return (
    <div
      className="absolute top-2 right-2 glass-soft p-1 cursor-crosshair"
      title="Minimap · click to jump"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const lx = e.clientX - r.left - 4;
        const ly = e.clientY - r.top - 4;
        onJump(lx / scale, ly / scale);
      }}
    >
      <div
        className="relative checker"
        style={{ width: W, height: H }}
      >
        {boxes.map((b) => (
          <div
            key={b.id}
            className="absolute border border-on-dark"
            style={{
              left: b.x * scale,
              top: b.y * scale,
              width: b.w * scale,
              height: b.h * scale,
              background: "var(--tint-strong)",
            }}
          />
        ))}
        <div
          className="absolute border border-on-dark pointer-events-none"
          style={{
            left: viewLeft * scale,
            top: viewTop * scale,
            width: viewW * scale,
            height: viewH * scale,
            boxShadow: "0 0 0 9999px var(--overlay-b)",
          }}
        />
      </div>
    </div>
  );
}

interface ClassificationPanelProps {
  image: ImageFile;
  onClickClass: (classId: string) => void;
}
function ClassificationPanel({ image, onClickClass }: ClassificationPanelProps) {
  const ws = useWorkspace();
  const active = new Set(ws.classifications[image.id] ?? []);
  return (
    <div
      className="backdrop-blur-glass border-t px-3 py-2 flex items-center gap-2 overflow-x-auto"
      style={{
        background: "var(--overlay-b)",
        borderColor: "var(--hairline)",
      }}
    >
      <span className="type-label text-muted mr-2 shrink-0">TAG:</span>
      {ws.classes.length === 0 ? (
        <span className="text-caption text-muted">CREATE A CLASS FIRST →</span>
      ) : (
        ws.classes.map((c) => {
          const on = active.has(c.id);
          return (
            <button
              key={c.id}
              onClick={() => onClickClass(c.id)}
              className={`flex items-center gap-2 h-8 px-3 border transition-colors shrink-0 ${
                on ? "" : "text-body hover:border-[var(--muted)]"
              }`}
              style={
                on
                  ? { background: c.color, borderColor: c.color, color: "#000" }
                  : { borderColor: "var(--tint-strong)" }
              }
            >
              <span
                className="w-2 h-2"
                style={{ background: c.color }}
              />
              <span className="type-label text-[11px]">{c.name}</span>
            </button>
          );
        })
      )}
    </div>
  );
}

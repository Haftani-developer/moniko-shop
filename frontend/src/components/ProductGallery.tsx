import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';

// Stage 1: when the mouse enters / a finger is held on the photo it smoothly zooms in (x2).
// Stage 2: shortly after, a round magnifier (loupe, x4) follows the pointer for fine details.
const ZOOM = 2;
const LENS_ZOOM = 4;
const LENS_SIZE = 150;
const LENS_DELAY_MS = 260;
const TOUCH_HOLD_MS = 120;
const TOUCH_MOVE_TOLERANCE = 8;

interface Props {
  images: string[];
  alt: string;
}

export default function ProductGallery({ images, alt }: Props) {
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(false);
  const [lens, setLens] = useState(false);
  const [touchMode, setTouchMode] = useState(false);
  const [pt, setPt] = useState({ x: 0, y: 0 });
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [nat, setNat] = useState({ w: 0, h: 0 });

  const stageRef = useRef<HTMLDivElement>(null);
  const lensTimer = useRef<number | undefined>(undefined);
  const holdTimer = useRef<number | undefined>(undefined);
  const lastTouchAt = useRef(0);
  const touchStart = useRef({ x: 0, y: 0 });
  const activeRef = useRef(false);

  useEffect(() => {
    if (index >= images.length) setIndex(0);
  }, [images.length, index]);

  const measure = useCallback(() => {
    const el = stageRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    setBox({ w: r.width, h: r.height });
    return r;
  }, []);

  const start = useCallback((clientX: number, clientY: number, touch: boolean) => {
    const r = measure();
    if (!r) return;
    setPt({ x: clientX - r.left, y: clientY - r.top });
    setTouchMode(touch);
    activeRef.current = true;
    setActive(true);
    window.clearTimeout(lensTimer.current);
    lensTimer.current = window.setTimeout(() => setLens(true), LENS_DELAY_MS);
  }, [measure]);

  const move = useCallback((clientX: number, clientY: number) => {
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPt({
      x: Math.min(Math.max(clientX - r.left, 0), r.width),
      y: Math.min(Math.max(clientY - r.top, 0), r.height),
    });
  }, []);

  const end = useCallback(() => {
    window.clearTimeout(lensTimer.current);
    window.clearTimeout(holdTimer.current);
    activeRef.current = false;
    setActive(false);
    setLens(false);
  }, []);

  // Touch events are attached natively so touchmove can be non-passive (stops page scroll while zooming).
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onStart = (e: TouchEvent) => {
      lastTouchAt.current = Date.now();
      const t = e.touches[0];
      touchStart.current = { x: t.clientX, y: t.clientY };
      window.clearTimeout(holdTimer.current);
      // a short hold activates the zoom; a quick swipe is still a normal page scroll
      holdTimer.current = window.setTimeout(() => start(t.clientX, t.clientY, true), TOUCH_HOLD_MS);
    };
    const onMove = (e: TouchEvent) => {
      lastTouchAt.current = Date.now();
      const t = e.touches[0];
      if (activeRef.current) {
        if (e.cancelable) e.preventDefault();
        move(t.clientX, t.clientY);
        return;
      }
      const dx = Math.abs(t.clientX - touchStart.current.x);
      const dy = Math.abs(t.clientY - touchStart.current.y);
      if (dx > TOUCH_MOVE_TOLERANCE || dy > TOUCH_MOVE_TOLERANCE) {
        window.clearTimeout(holdTimer.current);
      }
    };
    const onEnd = () => {
      lastTouchAt.current = Date.now();
      end();
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd);
    el.addEventListener('touchcancel', onEnd);
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onEnd);
      window.clearTimeout(lensTimer.current);
      window.clearTimeout(holdTimer.current);
    };
  }, [start, move, end]);

  // after a tap browsers fire emulated mouse events - ignore them
  const isEmulatedMouse = () => Date.now() - lastTouchAt.current < 700;

  if (images.length === 0) return null;
  const src = images[Math.min(index, images.length - 1)];

  // where the picture is really drawn inside the square stage (object-fit: contain)
  let rw = box.w;
  let rh = box.h;
  let ox = 0;
  let oy = 0;
  if (nat.w && nat.h && box.w && box.h) {
    const s = Math.min(box.w / nat.w, box.h / nat.h);
    rw = nat.w * s;
    rh = nat.h * s;
    ox = (box.w - rw) / 2;
    oy = (box.h - rh) / 2;
  }

  const z = active ? ZOOM : 1;
  const zoomStyle: CSSProperties = {
    backgroundImage: `url("${src}")`,
    backgroundSize: `${rw * z}px ${rh * z}px`,
    backgroundPosition: active
      ? `${pt.x - (pt.x - ox) * z}px ${pt.y - (pt.y - oy) * z}px`
      : `${ox}px ${oy}px`,
    opacity: active ? 1 : 0,
    transition: lens
      ? 'background-position .06s linear, opacity .15s'
      : 'background-size .3s ease-out, background-position .3s ease-out, opacity .15s',
  };

  const lensTop = touchMode ? Math.max(4, pt.y - LENS_SIZE - 28) : pt.y - LENS_SIZE / 2;
  const lensStyle: CSSProperties = {
    width: LENS_SIZE,
    height: LENS_SIZE,
    left: pt.x - LENS_SIZE / 2,
    top: lensTop,
    backgroundImage: `url("${src}")`,
    backgroundSize: `${rw * LENS_ZOOM}px ${rh * LENS_ZOOM}px`,
    backgroundPosition: `${LENS_SIZE / 2 - (pt.x - ox) * LENS_ZOOM}px ${LENS_SIZE / 2 - (pt.y - oy) * LENS_ZOOM}px`,
  };

  return (
    <div className="gallery">
      <div
        ref={stageRef}
        className={'gallery-stage' + (active ? ' is-zooming' : '')}
        onMouseEnter={(e) => { if (!isEmulatedMouse()) start(e.clientX, e.clientY, false); }}
        onMouseMove={(e) => { if (!isEmulatedMouse() && activeRef.current) move(e.clientX, e.clientY); }}
        onMouseLeave={() => { if (!isEmulatedMouse()) end(); }}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          onLoad={(e) => setNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
        />
        <div className="gallery-zoom" style={zoomStyle} aria-hidden="true" />
        {lens && <div className="gallery-lens" style={lensStyle} aria-hidden="true" />}
      </div>
      <p className="gallery-hint">برای بزرگ‌نمایی، موس را روی تصویر ببرید (در موبایل انگشت را روی تصویر نگه دارید)</p>

      {images.length > 1 && (
        <div className="gallery-thumbs">
          {images.map((url, i) => (
            <button
              type="button"
              key={url}
              className={'gallery-thumb' + (i === index ? ' selected' : '')}
              onClick={() => { end(); setNat({ w: 0, h: 0 }); setIndex(i); }}
              aria-label={`تصویر ${i + 1}`}
            >
              <img src={url} alt="" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

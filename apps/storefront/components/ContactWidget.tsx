'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { ZaloIcon, FacebookIcon, TiktokIcon, InstagramIcon } from '@/components/icons/SocialIcons';

// Fill in with the brand's real profile/deep links.
const SOCIAL_LINKS = [
  { name: 'Zalo', href: '#', Icon: ZaloIcon },
  { name: 'Facebook', href: '#', Icon: FacebookIcon },
  { name: 'TikTok', href: '#', Icon: TiktokIcon },
  { name: 'Instagram', href: '#', Icon: InstagramIcon },
] as const;

type Edge = 'top' | 'right' | 'bottom' | 'left';

const SIZE = 56;
const HALF = SIZE / 2;
const MARGIN = 16;
const DRAG_THRESHOLD = 6;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

// Edge + fraction-along-edge is resize-safe: the widget stays docked to its
// edge and slides proportionally instead of drifting off-screen on resize.
function positionFor(edge: Edge, along: number, w: number, h: number) {
  switch (edge) {
    case 'left':
      return { x: MARGIN + HALF, y: clamp(along * h, HALF + MARGIN, h - HALF - MARGIN) };
    case 'right':
      return { x: w - MARGIN - HALF, y: clamp(along * h, HALF + MARGIN, h - HALF - MARGIN) };
    case 'top':
      return { x: clamp(along * w, HALF + MARGIN, w - HALF - MARGIN), y: MARGIN + HALF };
    case 'bottom':
      return { x: clamp(along * w, HALF + MARGIN, w - HALF - MARGIN), y: h - MARGIN - HALF };
  }
}

function nearestEdge(x: number, y: number, w: number, h: number): Edge {
  const distances: [Edge, number][] = [
    ['top', y],
    ['bottom', h - y],
    ['left', x],
    ['right', w - x],
  ];
  return distances.reduce((closest, current) => (current[1] < closest[1] ? current : closest))[0];
}

export function ContactWidget() {
  const [mounted, setMounted] = useState(false);
  const [edge, setEdge] = useState<Edge>('right');
  const [along, setAlong] = useState(0.85);
  const [viewport, setViewport] = useState(() =>
    typeof window !== 'undefined' ? { w: window.innerWidth, h: window.innerHeight } : { w: 0, h: 0 }
  );
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const dragStart = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    const onMount = () => setMounted(true);
    onMount();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [expanded]);

  if (!mounted) return null;

  const pos = dragPos ?? positionFor(edge, along, viewport.w, viewport.h);

  function handlePointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY, moved: false };
    setDragging(true);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.hypot(dx, dy) > DRAG_THRESHOLD) dragStart.current.moved = true;
    if (dragStart.current.moved) {
      setDragPos({
        x: clamp(e.clientX, HALF, viewport.w - HALF),
        y: clamp(e.clientY, HALF, viewport.h - HALF),
      });
    }
  }

  function handlePointerUp() {
    const start = dragStart.current;
    dragStart.current = null;
    setDragging(false);

    if (start?.moved && dragPos) {
      const snapped = nearestEdge(dragPos.x, dragPos.y, viewport.w, viewport.h);
      setEdge(snapped);
      setAlong(snapped === 'left' || snapped === 'right' ? dragPos.y / viewport.h : dragPos.x / viewport.w);
      setDragPos(null);
    } else {
      setDragPos(null);
      setExpanded((v) => !v);
    }
  }

  const panelBelow = edge === 'top';

  return (
    <div
      className="fixed z-[60]"
      style={{
        left: pos.x - HALF,
        top: pos.y - HALF,
        transition: dragging ? 'none' : 'left 0.25s ease, top 0.25s ease',
      }}
    >
      <div className="relative">
        {expanded && (
          <div
            className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 ${
              panelBelow ? 'top-full mt-3' : 'bottom-full mb-3'
            }`}
          >
            {(panelBelow ? SOCIAL_LINKS : [...SOCIAL_LINKS].reverse()).map(({ name, href, Icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className="block w-16 h-16 rounded-full shadow-md hover:scale-105 transition-transform"
              >
                <Icon className="w-full h-full" />
              </a>
            ))}
          </div>
        )}

        <button
          type="button"
          aria-label={expanded ? 'Đóng liên hệ' : 'Liên hệ'}
          aria-expanded={expanded}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={`flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary-hover transition-all touch-none cursor-grab active:cursor-grabbing ${
            expanded ? 'scale-[0.65]' : 'scale-100'
          }`}
          style={{ width: SIZE, height: SIZE }}
        >
          {expanded ? <X className="w-6 h-6" strokeWidth={1.75} /> : <MessageCircle className="w-6 h-6" strokeWidth={1.75} />}
        </button>
      </div>
    </div>
  );
}

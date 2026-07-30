'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@repo/shared-types';

type Props = {
  images: Product['images'];
  name: string;
};

const FALLBACK_IMAGE: Product['images'][number] = {
  url: 'https://picsum.photos/800/1000',
  publicId: 'fallback',
  alt: '',
  width: 800,
  height: 1000,
  sortOrder: 0,
};

export function ProductImageGallery({ images, name }: Props) {
  const items = images.length > 0 ? images : [FALLBACK_IMAGE];
  const [index, setIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollToIndex(i: number) {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const clamped = Math.max(0, Math.min(items.length - 1, i));
    scroller.scrollTo({ left: clamped * scroller.clientWidth, behavior: 'smooth' });
    setIndex(clamped);
  }

  function handleScroll() {
    const scroller = scrollerRef.current;
    if (!scroller || scroller.clientWidth === 0) return;
    setIndex(Math.round(scroller.scrollLeft / scroller.clientWidth));
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="aspect-[4/5] bg-gray-100 rounded-3xl overflow-x-auto flex snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((img, i) => (
          <img
            key={img.publicId || i}
            src={img.url}
            alt={img.alt || name}
            className="w-full h-full object-cover shrink-0 snap-center"
          />
        ))}
      </div>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => scrollToIndex(index - 1)}
            disabled={index === 0}
            aria-label="Ảnh trước"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-700 hover:bg-white disabled:opacity-0 disabled:pointer-events-none transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => scrollToIndex(index + 1)}
            disabled={index === items.length - 1}
            aria-label="Ảnh tiếp theo"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-700 hover:bg-white disabled:opacity-0 disabled:pointer-events-none transition-opacity"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={2} />
          </button>

          <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs font-semibold">
            {index + 1} / {items.length}
          </span>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollToIndex(i)}
                aria-label={`Xem ảnh ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/60'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

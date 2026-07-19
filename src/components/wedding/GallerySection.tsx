"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectCoverflow, FreeMode } from "swiper/modules";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import "swiper/css/free-mode";

interface GalleryItem {
  id: string;
  imageUrl: string;
  caption?: string | null;
  category: string;
}

interface GallerySectionProps {
  items: GalleryItem[];
}

function shuffleItems<T>(list: T[]): T[] {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function GallerySection({ items }: GallerySectionProps) {
  const t = useTranslations("gallery");
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);
  const [shuffled, setShuffled] = useState<GalleryItem[]>(items);

  useEffect(() => {
    setShuffled(shuffleItems(items));
  }, [items]);

  if (items.length === 0) return null;

  return (
    <section id="gallery" className="section-padding bg-ivory">
      <SectionHeading title={t("title")} />

      <div className="relative mx-auto max-w-6xl px-12">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectCoverflow, FreeMode]}
          effect="coverflow"
          grabCursor
          freeMode={{ enabled: true, sticky: false }}
          centeredSlides
          slidesPerView={1.2}
          spaceBetween={16}
          coverflowEffect={{ rotate: 0, stretch: 0, depth: 80, modifier: 1.5, slideShadows: false }}
          autoplay={{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }}
          pagination={{ clickable: true }}
          navigation={{
            prevEl: ".swiper-button-prev-custom",
            nextEl: ".swiper-button-next-custom",
          }}
          breakpoints={{
            640: { slidesPerView: 2.2 },
            1024: { slidesPerView: 3.2 },
          }}
          className="pb-12"
        >
          {shuffled.map((item) => (
            <SwiperSlide key={item.id}>
              <button
                type="button"
                onClick={() => setLightbox(item)}
                className="group relative aspect-[4/5] w-full overflow-hidden rounded-xl shadow-lg"
              >
                <Image
                  src={item.imageUrl}
                  alt={item.caption || "Wedding photo"}
                  fill
                  loading="lazy"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 80vw, 33vw"
                />
                {item.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 p-4 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="font-serif text-sm italic">{item.caption}</p>
                  </div>
                )}
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
        <button
          type="button"
          className="swiper-button-prev-custom absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gold/30 bg-white p-2 text-wine shadow-md hover:bg-gold/10"
          aria-label={t("previous")}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="swiper-button-next-custom absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gold/30 bg-white p-2 text-wine shadow-md hover:bg-gold/10"
          aria-label={t("next")}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 text-white"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            <X className="h-8 w-8" />
          </button>
          <div className="relative max-h-[90vh] max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightbox.imageUrl}
              alt={lightbox.caption || "Photo"}
              width={1200}
              height={800}
              className="max-h-[85vh] w-auto rounded-lg object-contain"
            />
            {lightbox.caption && (
              <p className="mt-4 text-center font-serif italic text-white">{lightbox.caption}</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

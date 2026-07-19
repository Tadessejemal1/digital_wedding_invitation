"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, EffectCoverflow, FreeMode } from "swiper/modules";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
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

function preloadImage(src: string) {
  const img = new window.Image();
  img.src = src;
}

export function GallerySection({ items }: GallerySectionProps) {
  const t = useTranslations("gallery");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [shuffled, setShuffled] = useState<GalleryItem[]>(items);

  useEffect(() => {
    setShuffled(shuffleItems(items));
  }, [items]);

  const lightboxItem = lightboxIndex === null ? null : shuffled[lightboxIndex];

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    const prev = shuffled[(index - 1 + shuffled.length) % shuffled.length];
    const next = shuffled[(index + 1) % shuffled.length];
    preloadImage(prev.imageUrl);
    preloadImage(next.imageUrl);
  };

  const closeLightbox = () => setLightboxIndex(null);

  const showPrevious = useCallback(() => {
    setLightboxIndex((current) => {
      if (current === null || shuffled.length === 0) return current;
      const nextIndex = (current - 1 + shuffled.length) % shuffled.length;
      const ahead = shuffled[(nextIndex - 1 + shuffled.length) % shuffled.length];
      preloadImage(ahead.imageUrl);
      return nextIndex;
    });
  }, [shuffled]);

  const showNext = useCallback(() => {
    setLightboxIndex((current) => {
      if (current === null || shuffled.length === 0) return current;
      const nextIndex = (current + 1) % shuffled.length;
      const ahead = shuffled[(nextIndex + 1) % shuffled.length];
      preloadImage(ahead.imageUrl);
      return nextIndex;
    });
  }, [shuffled]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex, showPrevious, showNext]);

  if (items.length === 0) return null;

  return (
    <section id="gallery" className="section-padding bg-ivory">
      <SectionHeading title={t("title")} />

      <div className="relative mx-auto max-w-6xl px-8 sm:px-10 md:px-12">
        <Swiper
          modules={[Navigation, Autoplay, EffectCoverflow, FreeMode]}
          effect="coverflow"
          grabCursor
          freeMode={{ enabled: true, sticky: false }}
          centeredSlides
          slidesPerView={1}
          spaceBetween={12}
          coverflowEffect={{ rotate: 0, stretch: 0, depth: 40, modifier: 1, slideShadows: false }}
          autoplay={{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }}
          navigation={{
            prevEl: ".swiper-button-prev-custom",
            nextEl: ".swiper-button-next-custom",
          }}
          breakpoints={{
            400: { slidesPerView: 1.15, spaceBetween: 14 },
            640: { slidesPerView: 2.2, spaceBetween: 16, coverflowEffect: { depth: 80, modifier: 1.5 } },
            1024: { slidesPerView: 3.2, spaceBetween: 16, coverflowEffect: { depth: 80, modifier: 1.5 } },
          }}
          className="pb-4"
        >
          {shuffled.map((item, index) => (
            <SwiperSlide key={item.id}>
              <button
                type="button"
                onClick={() => openLightbox(index)}
                className="group relative aspect-[4/5] w-full overflow-hidden rounded-xl shadow-lg"
              >
                <Image
                  src={item.imageUrl}
                  alt={item.caption || "Wedding photo"}
                  fill
                  loading="lazy"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 400px) 90vw, (max-width: 768px) 80vw, 33vw"
                />
                {item.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 p-3 text-white opacity-0 transition-opacity group-hover:opacity-100 sm:p-4">
                    <p className="font-serif text-xs italic sm:text-sm">{item.caption}</p>
                  </div>
                )}
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
        <button
          type="button"
          className="swiper-button-prev-custom absolute left-0 top-1/2 z-10 -translate-y-1/2"
          aria-label={t("previous")}
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <button
          type="button"
          className="swiper-button-next-custom absolute right-0 top-1/2 z-10 -translate-y-1/2"
          aria-label={t("next")}
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>

      {lightboxItem && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-3 sm:p-4"
          onClick={closeLightbox}
        >
          <button
            type="button"
            className="absolute right-3 top-3 z-20 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 sm:right-4 sm:top-4"
            onClick={closeLightbox}
            aria-label="Close"
          >
            <X className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>

          <div
            className="relative flex w-full max-w-4xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex w-full items-center justify-center">
              <button
                type="button"
                className="absolute left-1 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 sm:left-2 sm:p-2.5"
                onClick={showPrevious}
                aria-label={t("previous")}
              >
                <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
              </button>

              <Image
                key={lightboxItem.id}
                src={lightboxItem.imageUrl}
                alt={lightboxItem.caption || "Photo"}
                width={1200}
                height={1500}
                priority
                sizes="(max-width: 400px) 96vw, (max-width: 768px) 92vw, 800px"
                className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain sm:max-h-[85vh]"
              />

              <button
                type="button"
                className="absolute right-1 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 sm:right-2 sm:p-2.5"
                onClick={showNext}
                aria-label={t("next")}
              >
                <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
              </button>
            </div>

            {lightboxItem.caption && (
              <p className="mt-3 px-2 text-center font-serif text-sm italic text-white sm:mt-4 sm:text-base">
                {lightboxItem.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

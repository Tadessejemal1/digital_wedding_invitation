"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectCoverflow } from "swiper/modules";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

const PAGE_SIZE = 10;

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
  const [page, setPage] = useState(0);
  const [shuffled, setShuffled] = useState<GalleryItem[]>(items);

  useEffect(() => {
    setShuffled(shuffleItems(items));
    setPage(0);
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(shuffled.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageItems = shuffled.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE
  );

  const goToPage = (nextPage: number) => {
    setPage(Math.max(0, Math.min(nextPage, totalPages - 1)));
  };

  if (items.length === 0) return null;

  return (
    <section id="gallery" className="section-padding bg-ivory">
      <SectionHeading title={t("title")} subtitle={t("allPhotos", { count: items.length })} />

      <div className="relative mx-auto max-w-5xl px-12">
        <Swiper
          key={`gallery-carousel-${currentPage}`}
          modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
          effect="coverflow"
          grabCursor
          centeredSlides
          slidesPerView={1}
          coverflowEffect={{ rotate: 0, stretch: 0, depth: 100, modifier: 2, slideShadows: false }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation={{
            prevEl: ".swiper-button-prev-custom",
            nextEl: ".swiper-button-next-custom",
          }}
          breakpoints={{ 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
          className="pb-12"
        >
          {pageItems.map((item) => (
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
                  sizes="(max-width: 768px) 100vw, 33vw"
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

      <div className="mx-auto mt-12 grid max-w-6xl grid-cols-2 justify-items-center gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {pageItems.map((item) => (
          <button
            type="button"
            key={`grid-${item.id}`}
            onClick={() => setLightbox(item)}
            className="group relative aspect-square w-full max-w-[220px] overflow-hidden rounded-lg shadow-md"
          >
            <Image
              src={item.imageUrl}
              alt={item.caption || "Wedding photo"}
              fill
              loading="lazy"
              className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 20vw"
            />
          </button>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mx-auto mt-10 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="rounded-full border border-gold/30 bg-white px-4 py-2 text-sm text-wine transition-colors hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("previous")}
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              type="button"
              key={`page-${i}`}
              onClick={() => goToPage(i)}
              className={`min-w-10 rounded-full px-3 py-2 text-sm transition-colors ${
                i === currentPage
                  ? "bg-wine text-white"
                  : "border border-gold/30 bg-white text-wine hover:bg-gold/10"
              }`}
              aria-label={t("page", { page: i + 1 })}
              aria-current={i === currentPage ? "page" : undefined}
            >
              {i + 1}
            </button>
          ))}

          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="rounded-full border border-gold/30 bg-white px-4 py-2 text-sm text-wine transition-colors hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("next")}
          </button>

          <p className="w-full text-center text-sm text-gray-500">
            {t("pageOf", { page: currentPage + 1, total: totalPages })}
          </p>
        </div>
      )}

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

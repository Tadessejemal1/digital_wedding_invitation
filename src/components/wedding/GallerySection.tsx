"use client";

import { useState } from "react";
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

interface GalleryItem {
  id: string;
  imageUrl: string;
  caption?: string | null;
  category: string;
}

interface GallerySectionProps {
  items: GalleryItem[];
}

export function GallerySection({ items }: GallerySectionProps) {
  const t = useTranslations("gallery");
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { key: "all", label: t("viewAll") },
    { key: "engagement", label: t("engagement") },
    { key: "family", label: t("family") },
    { key: "pre-wedding", label: t("preWedding") },
  ];

  const filtered =
    activeCategory === "all"
      ? items
      : items.filter((i) => i.category === activeCategory);

  if (items.length === 0) return null;

  return (
    <section id="gallery" className="section-padding bg-ivory">
      <SectionHeading title={t("title")} subtitle={t("allPhotos", { count: items.length })} />

      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`rounded-full px-4 py-2 text-sm transition-all ${
              activeCategory === cat.key
                ? "bg-wine text-white"
                : "border border-gold/30 bg-white text-wine hover:bg-gold/10"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="relative mx-auto max-w-5xl px-12">
        <Swiper
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
          {filtered.map((item) => (
            <SwiperSlide key={item.id}>
              <button
                onClick={() => setLightbox(item)}
                className="group relative aspect-[4/5] overflow-hidden rounded-xl shadow-lg"
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
        <button className="swiper-button-prev-custom absolute left-0 top-1/2 z-10 -translate-y-1/2" aria-label="Previous">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button className="swiper-button-next-custom absolute right-0 top-1/2 z-10 -translate-y-1/2" aria-label="Next">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-auto mt-12 grid max-w-6xl grid-cols-2 justify-items-center gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filtered.map((item) => (
          <button
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

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-4 top-4 text-white"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            <X className="h-8 w-8" />
          </button>
          <div className="relative max-h-[90vh] max-w-4xl">
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

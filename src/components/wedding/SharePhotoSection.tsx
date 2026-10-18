"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Camera } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GUEST_PHOTO_LIMIT } from "@/lib/guest-photos";

interface SharePhotoSectionProps {
  coupleId?: string;
  slug?: string;
}

export function SharePhotoSection({ coupleId, slug }: SharePhotoSectionProps) {
  const t = useTranslations("sharePhotos");
  const [guestName, setGuestName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);
  const [remaining, setRemaining] = useState(GUEST_PHOTO_LIMIT);

  const refreshStatus = async () => {
    try {
      const res = await fetch("/api/guest-photos");
      if (!res.ok) return;
      const data = await res.json();
      setCount(data.count ?? 0);
      setRemaining(data.remaining ?? 0);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    void refreshStatus();
  }, []);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!file) {
      setError(t("needPhoto"));
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.set("guestName", guestName.trim());
      form.set("photo", file);
      if (coupleId) form.set("coupleId", coupleId);
      if (slug) form.set("slug", slug);

      const res = await fetch("/api/guest-photos", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error === "Photo limit reached" ? t("limitReached") : data.error || t("error"));
        if (typeof data.remaining === "number") setRemaining(data.remaining);
        if (typeof data.count === "number") setCount(data.count);
        return;
      }

      setSuccess(true);
      setGuestName("");
      setFile(null);
      setCount(data.count ?? count + 1);
      setRemaining(data.remaining ?? Math.max(0, remaining - 1));
      window.setTimeout(() => setSuccess(false), 4000);
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  };

  const full = remaining <= 0;

  return (
    <section id="sharePhotos" className="section-padding bg-ivory">
      <SectionHeading title={t("title")} subtitle={t("subtitle")} />
      <div className="mx-auto max-w-lg">
        <ScrollReveal>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-gold/20 bg-white p-8 shadow-md"
          >
            <div className="flex items-center justify-between gap-3 rounded-xl border border-gold/20 bg-wine/[0.03] px-4 py-3 text-sm text-wine/80">
              <span className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-gold" />
                {t("slots", { count, limit: GUEST_PHOTO_LIMIT })}
              </span>
              <span className="font-medium text-wine">
                {full ? t("full") : t("remaining", { remaining })}
              </span>
            </div>

            {full ? (
              <p className="text-center text-sm text-wine/70">{t("limitReached")}</p>
            ) : (
              <>
                <div>
                  <Label htmlFor="share-name">{t("name")}</Label>
                  <Input
                    id="share-name"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="mt-1"
                    maxLength={80}
                  />
                </div>

                <div>
                  <Label htmlFor="share-photo">{t("photo")}</Label>
                  <Input
                    id="share-photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic"
                    required
                    className="mt-1 cursor-pointer"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                  <p className="mt-1 text-xs text-gray-500">{t("hint")}</p>
                </div>

                {preview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt=""
                    className="mx-auto max-h-48 rounded-xl border border-gold/20 object-contain"
                  />
                )}

                <Button type="submit" disabled={loading || full} className="w-full">
                  {loading ? "..." : t("submit")}
                </Button>
              </>
            )}

            {success && <p className="text-center text-sm text-green-600">{t("success")}</p>}
            {error && <p className="text-center text-sm text-red-600">{error}</p>}
            <p className="text-center text-xs text-gray-500">{t("adminOnly")}</p>
          </form>
        </ScrollReveal>
      </div>
    </section>
  );
}

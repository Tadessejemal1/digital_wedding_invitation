"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [full, setFull] = useState(false);

  useEffect(() => {
    void fetch("/api/guest-photos")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.full) setFull(true);
      })
      .catch(() => {
        // ignore
      });
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
        if (data.error === "Photo limit reached") {
          setError(t("limitReached"));
          setFull(true);
        } else if (data.error === "Already shared") {
          setError(t("alreadyShared"));
        } else {
          setError(data.error || t("error"));
        }
        return;
      }

      setSuccess(true);
      setGuestName("");
      setFile(null);
      if (data.full) setFull(true);
      window.setTimeout(() => setSuccess(false), 4000);
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="sharePhotos" className="section-padding bg-ivory">
      <SectionHeading title={t("title")} subtitle={t("subtitle")} />
      <div className="mx-auto max-w-lg">
        <ScrollReveal>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-gold/20 bg-white p-8 shadow-md"
          >
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
                    accept="image/*"
                    required
                    className="mt-1 cursor-pointer"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
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

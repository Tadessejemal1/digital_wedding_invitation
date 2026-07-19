"use client";

import { useTranslations } from "next-intl";
import { Phone, Mail } from "lucide-react";

interface FooterProps {
  groomName: string;
  brideName: string;
  contactPhone?: string | null;
  contactEmail?: string | null;
}

export function Footer({
  groomName,
  brideName,
  contactPhone,
  contactEmail,
}: FooterProps) {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-wine py-12 text-white">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h3 className="font-display text-3xl text-gold-light">
          {groomName} & {brideName}
        </h3>
        <div className="decorative-line my-6 via-gold-light" />

        {(contactPhone || contactEmail) && (
          <div className="mb-6">
            <p className="mb-3 text-sm uppercase tracking-widest text-gold-light">{t("contact")}</p>
            <div className="flex flex-wrap justify-center gap-6">
              {contactPhone && (
                <a href={`tel:${contactPhone}`} className="flex items-center gap-2 hover:text-gold-light">
                  <Phone className="h-4 w-4" /> {contactPhone}
                </a>
              )}
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="flex items-center gap-2 hover:text-gold-light">
                  <Mail className="h-4 w-4" /> {contactEmail}
                </a>
              )}
            </div>
          </div>
        )}

        <p className="text-sm text-white/60">
          &copy; {year} {t("copyright")}
        </p>
      </div>
    </footer>
  );
}

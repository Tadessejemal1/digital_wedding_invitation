"use client";

import { useTranslations } from "next-intl";
import { Instagram, Facebook, Phone, Mail } from "lucide-react";

interface FooterProps {
  groomName: string;
  brideName: string;
  contactPhone?: string | null;
  contactEmail?: string | null;
  socialInstagram?: string | null;
  socialFacebook?: string | null;
}

export function Footer({
  groomName,
  brideName,
  contactPhone,
  contactEmail,
  socialInstagram,
  socialFacebook,
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

        {(socialInstagram || socialFacebook) && (
          <div className="mb-6">
            <p className="mb-3 text-sm uppercase tracking-widest text-gold-light">{t("followUs")}</p>
            <div className="flex justify-center gap-4">
              {socialInstagram && (
                <a href={socialInstagram} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/30 p-3 hover:bg-white/10">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {socialFacebook && (
                <a href={socialFacebook} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/30 p-3 hover:bg-white/10">
                  <Facebook className="h-5 w-5" />
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

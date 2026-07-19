"use client";

import { useTranslations } from "next-intl";
import { Phone, Mail } from "lucide-react";

interface FooterProps {
  groomName: string;
  brideName: string;
  contactPhone?: string | null;
  contactPhones?: string[];
  contactEmail?: string | null;
}

export function Footer({
  groomName,
  brideName,
  contactPhone,
  contactPhones,
  contactEmail,
}: FooterProps) {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  const phones =
    contactPhones && contactPhones.length > 0
      ? contactPhones
      : contactPhone
        ? [contactPhone]
        : [];

  return (
    <footer className="bg-wine py-12 text-white">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h3 className="font-display text-3xl text-gold-light">
          {groomName} & {brideName}
        </h3>
        <div className="decorative-line my-6 via-gold-light" />

        {(phones.length > 0 || contactEmail) && (
          <div className="mb-6">
            <p className="mb-3 text-sm uppercase tracking-widest text-gold-light">{t("contact")}</p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {phones.map((phone) => (
                <a
                  key={phone}
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 hover:text-gold-light"
                >
                  <Phone className="h-4 w-4" /> {phone}
                </a>
              ))}
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

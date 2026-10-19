"use client";

import { useTranslations } from "next-intl";
import { Phone, Mail } from "lucide-react";

const DEVELOPER_PHONE = "0979113638";
const COORDINATOR_PHONE = "0911408338";

interface FooterProps {
  groomName: string;
  brideName: string;
  contactEmail?: string | null;
  coordinatorPhone?: string | null;
}

export function Footer({
  groomName,
  brideName,
  contactEmail,
  coordinatorPhone = COORDINATOR_PHONE,
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

        {(coordinatorPhone || contactEmail) && (
          <div className="mb-6">
            <p className="mb-3 text-sm uppercase tracking-widest text-gold-light">
              {t("coordinatorPhone")}
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {coordinatorPhone && (
                <a
                  href={`tel:${coordinatorPhone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 hover:text-gold-light"
                >
                  <Phone className="h-4 w-4" /> {coordinatorPhone}
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
          {t("builtBy")} {year} {t("copyright")}{" "}
          <a href={`tel:${DEVELOPER_PHONE}`} className="hover:text-gold-light">
            {DEVELOPER_PHONE}
          </a>
        </p>
        <p className="mt-4">
          <a href="/admin" className="text-xs text-white/40 underline-offset-2 hover:text-gold-light hover:underline">
            Admin
          </a>
        </p>
      </div>
    </footer>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tadesse & Hana — Wedding Invitation",
  description: "Join us in celebrating our wedding ceremony. July 26, 2026.",
  openGraph: {
    title: "Tadesse & Hana — Wedding Invitation",
    description: "Join us in celebrating our wedding ceremony.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}

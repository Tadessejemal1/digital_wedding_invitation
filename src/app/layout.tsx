import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Andinet & Eden",
  description: "Join us in celebrating our wedding ceremony. November 1, 2026.",
  openGraph: {
    title: "Andinet & Eden",
    description: "Join us in celebrating our wedding ceremony.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}

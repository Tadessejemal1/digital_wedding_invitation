import { Playfair_Display, Cormorant_Garamond, Poppins } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import "../globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-poppins",
  display: "swap",
});

export default async function InviteLayout({ children }: { children: React.ReactNode }) {
  const messages = (await import("../../../messages/en.json")).default;

  return (
    <html lang="en" className={`${playfair.variable} ${cormorant.variable} ${poppins.variable}`}>
      <body className="bg-background antialiased">
        <NextIntlClientProvider locale="en" messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

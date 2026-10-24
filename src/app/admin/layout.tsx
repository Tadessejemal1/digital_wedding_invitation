import Link from "next/link";
import { Playfair_Display, Cormorant_Garamond, Poppins } from "next/font/google";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${cormorant.variable} ${poppins.variable}`}
    >
      <body className="antialiased">
        <div className="min-h-screen bg-ivory font-sans text-wine">
          <header className="border-b border-gold/20 bg-white">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-4">
                <Link
                  href="/admin/dashboard"
                  className="font-display text-xl text-wine sm:text-2xl"
                >
                  Admin
                </Link>
                <nav className="flex flex-wrap items-center gap-1 text-sm sm:gap-2">
                  <Link
                    href="/admin/dashboard"
                    className="rounded-md px-2 py-1.5 text-wine/80 hover:bg-ivory hover:text-wine"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/admin/photos"
                    className="rounded-md px-2 py-1.5 text-wine/80 hover:bg-ivory hover:text-wine"
                  >
                    Guest Photos
                  </Link>
                  <Link
                    href="/admin/checkin"
                    className="rounded-md px-2 py-1.5 text-wine/80 hover:bg-ivory hover:text-wine"
                  >
                    Scanner
                  </Link>
                </nav>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="rounded-md border border-gold/30 px-3 py-1.5 text-sm text-wine hover:bg-ivory"
                >
                  Wedding site
                </Link>
                <AdminLogoutButton />
              </div>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}

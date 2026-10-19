import { WeddingHome } from "@/components/wedding/WeddingHome";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <WeddingHome locale={locale} />;
}

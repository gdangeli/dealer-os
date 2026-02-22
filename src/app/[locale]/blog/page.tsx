import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { getAllBlogPosts, getAllCategories } from "@/content/blog";
import { BlogClient } from "./blog-client";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  
  const titles: Record<string, string> = {
    de: "Blog - Wissen für den Autohandel | Dealer OS",
    en: "Blog - Knowledge for Car Dealers | Dealer OS",
    fr: "Blog - Savoir pour le commerce automobile | Dealer OS",
    it: "Blog - Conoscenza per il commercio auto | Dealer OS",
    sr: "Blog - Знање за трговину аутомобила | Dealer OS",
  };
  
  const descriptions: Record<string, string> = {
    de: "Praxisnahe Tipps, Branchenwissen und Strategien für Ihren Erfolg als Schweizer Autohändler. Standzeit-Optimierung, Lead-Management und mehr.",
    en: "Practical tips, industry knowledge and strategies for your success as a Swiss car dealer. Standing time optimization, lead management and more.",
    fr: "Conseils pratiques, connaissances du secteur et stratégies pour votre succès en tant que concessionnaire automobile suisse.",
    it: "Consigli pratici, conoscenze del settore e strategie per il vostro successo come commerciante di auto svizzero.",
    sr: "Практични савети, знање индустрије и стратегије за ваш успех као швајцарски трговац аутомобила.",
  };

  return {
    title: titles[locale] || titles.de,
    description: descriptions[locale] || descriptions.de,
    alternates: {
      canonical: `https://www.dealeros.ch/${locale}/blog`,
      languages: {
        de: "https://www.dealeros.ch/de/blog",
        en: "https://www.dealeros.ch/en/blog",
        fr: "https://www.dealeros.ch/fr/blog",
        it: "https://www.dealeros.ch/it",
        sr: "https://www.dealeros.ch/sr/blog",
      },
    },
    openGraph: {
      title: titles[locale] || titles.de,
      description: descriptions[locale] || descriptions.de,
      type: "website",
      url: `https://www.dealeros.ch/${locale}/blog`,
      images: [
        {
          url: "https://www.dealeros.ch/images/og-default.png",
          width: 1200,
          height: 630,
          alt: "Dealer OS Blog",
        },
      ],
    },
  };
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  const allPosts = getAllBlogPosts();
  const categories = getAllCategories();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-slate-50 to-white py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="outline" className="mb-4">Blog</Badge>
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
                Wissen für den{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                  Autohandel
                </span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Praxisnahe Tipps, Branchenwissen und Strategien für Ihren Erfolg 
                als Schweizer Autohändler oder Garagist.
              </p>
            </div>
          </div>
        </section>

        <BlogClient allPosts={allPosts} categories={categories} />
      </main>

      <Footer />
    </div>
  );
}

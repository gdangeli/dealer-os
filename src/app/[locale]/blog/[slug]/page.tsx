import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getBlogPostBySlug, getAllBlogPosts, getRelatedPosts } from "@/content/blog";
import { Link } from "@/i18n/navigation";
import { locales } from "@/i18n/config";
import type { Metadata } from "next";
import React from "react";
import { ArrowLeft, ArrowRight, Clock, Calendar, User, Share2 } from "lucide-react";

interface BlogPostPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return locales.flatMap((locale) =>
    posts.map((post) => ({
      locale,
      slug: post.slug,
    }))
  );
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const post = getBlogPostBySlug(slug);
  
  if (!post) {
    return {
      title: "Artikel nicht gefunden | Dealer OS",
    };
  }

  const url = `https://www.dealeros.ch/${locale}/blog/${slug}`;

  return {
    title: `${post.title} | Dealer OS Blog`,
    description: post.excerpt,
    keywords: post.keywords.join(", "),
    alternates: {
      canonical: url,
      languages: {
        de: `https://www.dealeros.ch/de/blog/${slug}`,
        en: `https://www.dealeros.ch/en/blog/${slug}`,
        fr: `https://www.dealeros.ch/fr/blog/${slug}`,
        it: `https://www.dealeros.ch/it/blog/${slug}`,
      },
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url,
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [
        {
          url: post.image || "https://www.dealeros.ch/images/og-default.png",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}

// Simple markdown-like content renderer
function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactElement[] = [];
  let currentList: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let inBlockquote = false;
  let blockquoteContent: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let key = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      const ListTag = listType === "ol" ? "ol" : "ul";
      elements.push(
        <ListTag key={key++} className={listType === "ol" ? "list-decimal list-outside ml-6 space-y-2 my-6" : "list-disc list-outside ml-6 space-y-2 my-6"}>
          {currentList.map((item, i) => (
            <li key={i} className="text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInlineText(item) }} />
          ))}
        </ListTag>
      );
      currentList = [];
      listType = null;
    }
  };

  const flushBlockquote = () => {
    if (blockquoteContent.length > 0) {
      elements.push(
        <blockquote key={key++} className="border-l-4 border-blue-500 pl-6 my-8 italic text-slate-600 bg-blue-50/50 py-4 pr-6 rounded-r-lg">
          {blockquoteContent.map((line, i) => (
            <p key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInlineText(line) }} />
          ))}
        </blockquote>
      );
      blockquoteContent = [];
      inBlockquote = false;
    }
  };

  const flushTable = () => {
    if (tableRows.length > 0) {
      const headerRow = tableRows[0];
      const bodyRows = tableRows.slice(2);
      elements.push(
        <div key={key++} className="overflow-x-auto my-8 rounded-lg border border-slate-200">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                {headerRow.map((cell, i) => (
                  <th key={i} className="px-4 py-3 text-left text-sm font-semibold text-slate-900 border-b border-slate-200">
                    {cell.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-3 text-sm border-b border-slate-100 text-slate-700">
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  const formatInlineText = (text: string): string => {
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    text = text.replace(/`(.+?)`/g, '<code class="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-slate-800">$1</code>');
    text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline underline-offset-2">$1</a>');
    return text;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("|")) {
      flushList();
      flushBlockquote();
      inTable = true;
      const cells = line.split("|").filter(c => c.trim() !== "");
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (line.startsWith(">")) {
      flushList();
      inBlockquote = true;
      blockquoteContent.push(line.substring(1).trim());
      continue;
    } else if (inBlockquote) {
      flushBlockquote();
    }

    if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <h2 key={key++} className="text-2xl font-bold text-slate-900 mt-12 mb-4 scroll-mt-24">
          {line.substring(3)}
        </h2>
      );
      continue;
    }
    if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h3 key={key++} className="text-xl font-semibold text-slate-900 mt-8 mb-3">
          {line.substring(4)}
        </h3>
      );
      continue;
    }

    if (line.trim() === "---") {
      flushList();
      elements.push(<hr key={key++} className="my-10 border-slate-200" />);
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (listType !== "ul") {
        flushList();
        listType = "ul";
      }
      currentList.push(line.substring(2));
      continue;
    }

    const orderedMatch = line.match(/^\d+\.\s/);
    if (orderedMatch) {
      if (listType !== "ol") {
        flushList();
        listType = "ol";
      }
      currentList.push(line.substring(orderedMatch[0].length));
      continue;
    }

    if (line.trim() === "") {
      flushList();
      continue;
    }

    flushList();
    elements.push(
      <p key={key++} className="text-slate-700 my-5 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInlineText(line) }} />
    );
  }

  flushList();
  flushBlockquote();
  flushTable();

  return elements;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(slug, 3);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        <section className="hero-gradient py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <Link
                href="/blog"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8 transition-colors duration-200 group"
              >
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Zurück zum Blog
              </Link>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl">{post.emoji}</span>
                <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-200 border-0 text-sm px-3 py-1.5">
                  {post.category}
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-[1.1]">
                {post.title}
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
                {post.excerpt}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 pb-8 border-b border-gray-200/60">
                <span className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium text-gray-700">{post.author}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.publishedAt).toLocaleDateString("de-CH", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {post.readTime} Min. Lesezeit
                </span>
              </div>
            </div>
          </div>
        </section>

        <article className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto prose prose-gray prose-lg prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-sky-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900">
              {renderContent(post.content)}
            </div>
          </div>
        </article>

        <section className="pb-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-wrap gap-2 pt-8 border-t border-gray-200">
                {post.keywords.map((keyword) => (
                  <Badge
                    key={keyword}
                    variant="outline"
                    className="text-xs px-3 py-1.5 text-gray-600 border-gray-200 hover:border-sky-300 hover:bg-sky-50 transition-colors duration-200"
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 bg-gradient-to-br from-sky-50 to-indigo-50 border-y border-sky-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                  <Share2 className="h-5 w-5 text-sky-600" />
                </div>
                <span className="text-gray-700 font-medium">Artikel teilen</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 transition-colors">LinkedIn</Button>
                <Button variant="outline" size="sm" className="hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 transition-colors">Twitter</Button>
                <Button variant="outline" size="sm" className="hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 transition-colors">E-Mail</Button>
              </div>
            </div>
          </div>
        </section>

        {relatedPosts.length > 0 && (
          <section className="py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                  Weitere Artikel in {post.category}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`} className="group">
                      <Card className="h-full bg-white border-gray-100 hover:border-sky-200 card-hover">
                        <CardContent className="p-6">
                          <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform duration-200">
                            {relatedPost.emoji}
                          </span>
                          <h3 className="font-bold text-gray-900 mb-2 group-hover:text-sky-600 transition-colors duration-200 line-clamp-2">
                            {relatedPost.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {relatedPost.excerpt}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section - Matching Landing Page */}
        <section className="py-16 sm:py-24 bg-gradient-to-br from-sky-500 to-indigo-600 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 sm:w-96 h-48 sm:h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
                Bereit, Ihre Garage zu digitalisieren?
              </h2>
              <p className="text-lg text-white/80 mb-8 sm:mb-10">
                Dealer OS wurde speziell für Schweizer Autohändler entwickelt. Testen Sie jetzt kostenlos.
              </p>
              <Link 
                href="/register"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200 shadow-xl hover:shadow-2xl"
              >
                Kostenlos testen
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

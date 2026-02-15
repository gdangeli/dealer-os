import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getBlogPostBySlug, getAllBlogPosts, getRelatedPosts } from "@/content/blog";
import type { Metadata } from "next";
import React from "react";
import { ArrowLeft, ArrowRight, Clock, Calendar, User, Share2 } from "lucide-react";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = getBlogPostBySlug(resolvedParams.slug);
  
  if (!post) {
    return {
      title: "Artikel nicht gefunden | Dealer OS",
    };
  }

  return {
    title: `${post.title} | Dealer OS Blog`,
    description: post.excerpt,
    keywords: post.keywords.join(", "),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
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
      const bodyRows = tableRows.slice(2); // Skip header and separator
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
    // Bold
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');
    // Italic
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Code
    text = text.replace(/`(.+?)`/g, '<code class="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-slate-800">$1</code>');
    // Links
    text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline underline-offset-2">$1</a>');
    return text;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Table
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

    // Blockquote
    if (line.startsWith(">")) {
      flushList();
      inBlockquote = true;
      blockquoteContent.push(line.substring(1).trim());
      continue;
    } else if (inBlockquote) {
      flushBlockquote();
    }

    // Headers
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

    // Horizontal rule
    if (line.trim() === "---") {
      flushList();
      elements.push(<hr key={key++} className="my-10 border-slate-200" />);
      continue;
    }

    // Unordered list
    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (listType !== "ul") {
        flushList();
        listType = "ul";
      }
      currentList.push(line.substring(2));
      continue;
    }

    // Ordered list
    const orderedMatch = line.match(/^\d+\.\s/);
    if (orderedMatch) {
      if (listType !== "ol") {
        flushList();
        listType = "ol";
      }
      currentList.push(line.substring(orderedMatch[0].length));
      continue;
    }

    // Checkbox list
    if (line.startsWith("- [ ]") || line.startsWith("- [x]")) {
      flushList();
      const checked = line.startsWith("- [x]");
      elements.push(
        <div key={key++} className="flex items-center gap-3 my-2">
          <input type="checkbox" checked={checked} disabled className="rounded border-slate-300 text-blue-600" />
          <span className="text-slate-700">{line.substring(6)}</span>
        </div>
      );
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      flushList();
      continue;
    }

    // Regular paragraph
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
  const resolvedParams = await params;
  const post = getBlogPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(resolvedParams.slug, 3);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Article Header */}
        <section className="bg-gradient-to-b from-slate-50 to-white py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              {/* Back Link */}
              <Link
                href="/blog"
                className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-6 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zum Blog
              </Link>

              {/* Category & Emoji */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl">{post.emoji}</span>
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {post.category}
                </Badge>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Excerpt */}
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                {post.excerpt}
              </p>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 pb-8 border-b border-slate-200">
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {post.author}
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

        {/* Article Content */}
        <article className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto prose prose-slate prose-lg">
              {renderContent(post.content)}
            </div>
          </div>
        </article>

        {/* Keywords */}
        <section className="pb-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-wrap gap-2 pt-8 border-t border-slate-200">
                {post.keywords.map((keyword) => (
                  <Badge
                    key={keyword}
                    variant="outline"
                    className="text-xs px-3 py-1 text-slate-600"
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Share Section */}
        <section className="py-8 bg-slate-50 border-y border-slate-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Share2 className="h-5 w-5 text-slate-400" />
                <span className="text-slate-600">Artikel teilen</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  LinkedIn
                </Button>
                <Button variant="outline" size="sm">
                  Twitter
                </Button>
                <Button variant="outline" size="sm">
                  E-Mail
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold text-slate-900 mb-8">
                  Weitere Artikel in {post.category}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`}>
                      <Card className="h-full border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 group">
                        <CardContent className="p-5">
                          <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform">
                            {relatedPost.emoji}
                          </span>
                          <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {relatedPost.title}
                          </h3>
                          <p className="text-sm text-slate-600 line-clamp-2">
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

        {/* CTA Section */}
        <section className="py-16 bg-slate-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Bereit, Ihre Garage zu digitalisieren?
              </h2>
              <p className="text-slate-300 mb-8">
                Dealer OS wurde speziell für Schweizer Autohändler entwickelt. Testen Sie jetzt kostenlos.
              </p>
              <Button size="lg" asChild className="bg-white text-slate-900 hover:bg-slate-100">
                <Link href="/register">
                  Kostenlos testen
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

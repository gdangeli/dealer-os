import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPostBySlug, getAllBlogPosts, getRelatedPosts } from "@/content/blog";
import type { Metadata } from "next";
import React from "react";

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
        <ListTag key={key++} className={listType === "ol" ? "list-decimal list-inside space-y-2 my-4" : "list-disc list-inside space-y-2 my-4"}>
          {currentList.map((item, i) => (
            <li key={i} className="text-gray-700" dangerouslySetInnerHTML={{ __html: formatInlineText(item) }} />
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
        <blockquote key={key++} className="border-l-4 border-blue-500 pl-4 my-6 italic text-gray-700 bg-blue-50 py-3 pr-4 rounded-r">
          {blockquoteContent.map((line, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: formatInlineText(line) }} />
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
        <div key={key++} className="overflow-x-auto my-6">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                {headerRow.map((cell, i) => (
                  <th key={i} className="px-4 py-2 text-left font-semibold text-gray-700 border-b">
                    {cell.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-2 border-b text-gray-700">
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
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Code
    text = text.replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
    // Links
    text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>');
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
        <h2 key={key++} className="text-2xl font-bold text-gray-900 mt-10 mb-4">
          {line.substring(3)}
        </h2>
      );
      continue;
    }
    if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h3 key={key++} className="text-xl font-bold text-gray-900 mt-8 mb-3">
          {line.substring(4)}
        </h3>
      );
      continue;
    }

    // Horizontal rule
    if (line.trim() === "---") {
      flushList();
      elements.push(<hr key={key++} className="my-8 border-gray-300" />);
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
        <div key={key++} className="flex items-center gap-2 my-1">
          <input type="checkbox" checked={checked} disabled className="rounded" />
          <span className="text-gray-700">{line.substring(6)}</span>
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
      <p key={key++} className="text-gray-700 my-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInlineText(line) }} />
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
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center text-blue-200 hover:text-white mb-6 transition-colors"
            >
              ← Zurück zum Blog
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl">{post.emoji}</span>
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                {post.category}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-blue-100">
              <span>{post.author}</span>
              <span>•</span>
              <span>
                {new Date(post.publishedAt).toLocaleDateString("de-CH", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span>•</span>
              <span>{post.readTime} Min. Lesezeit</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <article className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8 md:p-12">
            {renderContent(post.content)}
          </div>
        </div>
      </article>

      {/* Keywords */}
      <section className="pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-wrap gap-2">
              {post.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-12 bg-white border-t">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Weitere Artikel in {post.category}
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    href={`/blog/${relatedPost.slug}`}
                    className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-2xl mb-3 block">{relatedPost.emoji}</span>
                    <h3 className="font-bold text-gray-900 mb-2 hover:text-blue-600">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Bereit, Ihre Garage zu digitalisieren?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Dealer OS wurde speziell für Schweizer Autohändler entwickelt. Testen Sie jetzt kostenlos.
          </p>
          <Link
            href="/#waitlist"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Kostenlos testen
          </Link>
        </div>
      </section>
    </main>
  );
}

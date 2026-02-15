import Link from "next/link";
import { getAllBlogPosts, getAllCategories } from "@/content/blog";

export const metadata = {
  title: "Blog | Dealer OS",
  description: "Tipps, Guides und Insights für Schweizer Autohändler und Garagisten. Erfahren Sie, wie Sie Ihren Betrieb digitalisieren und erfolgreicher verkaufen.",
};

export default function BlogPage() {
  const posts = getAllBlogPosts();
  const categories = getAllCategories();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Der Blog für Schweizer Autohändler
            </h1>
            <p className="text-xl text-blue-100">
              Praxisnahe Tipps, Branchenwissen und Strategien für Ihren Erfolg im Autohandel.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            <span className="text-gray-600 font-medium">Kategorien:</span>
            {categories.map((category) => (
              <span
                key={category}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 cursor-pointer transition-colors"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{post.emoji}</span>
                      <span className="text-sm text-blue-600 font-medium">
                        {post.category}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{post.readTime} Min. Lesezeit</span>
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString("de-CH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Bereit für die Digitalisierung?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Dealer OS hilft Ihnen, Ihre Garage effizienter zu führen und mehr zu verkaufen.
          </p>
          <Link
            href="/#waitlist"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Jetzt kostenlos testen
          </Link>
        </div>
      </section>
    </main>
  );
}

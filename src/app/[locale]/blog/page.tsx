"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllBlogPosts, getAllCategories } from "@/content/blog";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import Image from "next/image";

export default function BlogPage() {
  const locale = useLocale();
  const allPosts = getAllBlogPosts();
  const categories = getAllCategories();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const filteredPosts = selectedCategory
    ? allPosts.filter((post) => post.category === selectedCategory)
    : allPosts;
  
  const [featuredPost, ...restPosts] = filteredPosts;

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

        {/* Categories Filter */}
        <section className="py-6 border-b border-slate-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge 
                variant={selectedCategory === null ? "default" : "outline"}
                className="cursor-pointer hover:bg-slate-200 transition-colors px-4 py-1.5"
                onClick={() => setSelectedCategory(null)}
              >
                Alle ({allPosts.length})
              </Badge>
              {categories.map((category) => {
                const count = allPosts.filter((p) => p.category === category).length;
                return (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer hover:bg-slate-100 transition-colors px-4 py-1.5"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category} ({count})
                  </Badge>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Post */}
        {featuredPost && (
          <section className="py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <Link href={`/blog/${featuredPost.slug}`}>
                <Card className="overflow-hidden border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-2 gap-0">
                      <div className="relative min-h-[200px] md:min-h-[300px] overflow-hidden">
                        <Image
                          src={featuredPost.image}
                          alt={featuredPost.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      
                      <div className="p-6 md:p-8 lg:p-12 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                          <Badge variant="secondary">{featuredPost.category}</Badge>
                          {filteredPosts.indexOf(featuredPost) === 0 && !selectedCategory && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Neu
                            </Badge>
                          )}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                          {featuredPost.title}
                        </h2>
                        <p className="text-slate-600 mb-6 line-clamp-3">
                          {featuredPost.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {featuredPost.readTime} Min.
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(featuredPost.publishedAt).toLocaleDateString("de-CH", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div>
                          <Button>
                            Artikel lesen
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </section>
        )}

        {/* All Posts Grid */}
        <section className="py-12 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900">
                {selectedCategory ? selectedCategory : "Alle Artikel"}
              </h2>
              <span className="text-slate-500 text-sm">
                {filteredPosts.length} Artikel
              </span>
            </div>
            
            {restPosts.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {restPosts.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`}>
                    <Card className="h-full border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 group">
                      <CardContent className="p-0">
                        <div className="relative h-40 overflow-hidden">
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary" className="text-xs">
                              {post.category}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.readTime} Min.
                            </span>
                            <span>
                              {new Date(post.publishedAt).toLocaleDateString("de-CH", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                {filteredPosts.length === 1 
                  ? "Nur der Featured-Artikel in dieser Kategorie."
                  : "Keine weiteren Artikel in dieser Kategorie."}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-slate-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Bereit für die Digitalisierung?
              </h2>
              <p className="text-slate-300 mb-8">
                Dealer OS hilft Ihnen, Ihre Garage effizienter zu führen und mehr zu verkaufen.
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

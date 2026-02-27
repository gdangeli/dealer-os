"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import Image from "next/image";
import type { BlogPost } from "@/content/blog";

interface BlogClientProps {
  allPosts: BlogPost[];
  categories: string[];
}

export function BlogClient({ allPosts, categories }: BlogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const filteredPosts = selectedCategory
    ? allPosts.filter((post) => post.category === selectedCategory)
    : allPosts;
  
  const [featuredPost, ...restPosts] = filteredPosts;

  return (
    <>
      {/* Categories Filter */}
      <section className="py-8 border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === null 
                  ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/25" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Alle ({allPosts.length})
            </button>
            {categories.map((category) => {
              const count = allPosts.filter((p) => p.category === category).length;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category 
                      ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/25" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {category} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Link href={`/blog/${featuredPost.slug}`} className="group block">
              <Card className="overflow-hidden border-sky-100 bg-gradient-to-br from-sky-50/50 to-indigo-50/50 hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="relative min-h-[240px] md:min-h-[360px] overflow-hidden">
                      <Image
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    
                    <div className="p-6 md:p-8 lg:p-12 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-4">
                        <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-200 border-0">{featuredPost.category}</Badge>
                        {filteredPosts.indexOf(featuredPost) === 0 && !selectedCategory && (
                          <Badge className="bg-emerald-100 text-emerald-700 border-0">
                            ✨ Neu
                          </Badge>
                        )}
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-sky-600 transition-colors duration-200">
                        {featuredPost.title}
                      </h2>
                      <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          {featuredPost.readTime} Min.
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          {new Date(featuredPost.publishedAt).toLocaleDateString("de-CH", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold group-hover:shadow-lg group-hover:shadow-sky-500/30 transition-all duration-200">
                          Artikel lesen
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </span>
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
      <section className="py-12 sm:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory ? selectedCategory : "Alle Artikel"}
            </h2>
            <span className="text-gray-500 text-sm font-medium">
              {filteredPosts.length} Artikel
            </span>
          </div>
          
          {restPosts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {restPosts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                  <Card className="h-full bg-white border-gray-100 hover:border-sky-200 card-hover overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative h-44 overflow-hidden">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                      </div>
                      
                      <div className="p-5 sm:p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-200 border-0 text-xs font-medium">
                            {post.category}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2 group-hover:text-sky-600 transition-colors duration-200 line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {post.readTime} Min.
                          </span>
                          <span className="font-medium">
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
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg">
                {filteredPosts.length === 1 
                  ? "Nur der Featured-Artikel in dieser Kategorie."
                  : "Keine weiteren Artikel in dieser Kategorie."}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section - Matching Landing Page */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-sky-500 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 sm:w-96 h-48 sm:h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
              Bereit für die Digitalisierung?
            </h2>
            <p className="text-lg text-white/80 mb-8 sm:mb-10">
              Dealer OS hilft Ihnen, Ihre Garage effizienter zu führen und mehr zu verkaufen.
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
    </>
  );
}

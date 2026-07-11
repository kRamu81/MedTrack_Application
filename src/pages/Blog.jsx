import React, { useMemo, useState } from "react";
import BlogCard from "../components/blog/BlogCard";
import BLOG_POSTS, { BLOG_CATEGORIES } from "../data/blogPosts";

const POSTS_PER_PAGE = 6;

export default function Blog({ onNavigate }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return BLOG_POSTS.filter((post) => {
      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;

      const searchableText = [
        post.title,
        post.excerpt,
        post.category,
        ...post.tags,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setVisibleCount(POSTS_PER_PAGE);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setVisibleCount(POSTS_PER_PAGE);
  };

  const handleReadMore = (post) => {
    onNavigate("blog-post", post.slug);
  };

  return (
    <div className="min-h-screen bg-surface text-primary">
      <section className="relative overflow-hidden border-b border-subtle">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-cyan-500/10 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center px-4 py-2 mb-6 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold">
              MedTrack Insights
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-primary leading-tight">
              Practical ideas for smarter{" "}
              <span className="text-blue-600 dark:text-blue-400">
                healthcare operations.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg sm:text-xl text-secondary leading-relaxed">
              Search and explore articles about medical equipment management,
              preventive maintenance, hospital operations, and healthcare
              technology.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-10 sm:py-12">
        <div className="bg-card border border-subtle rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <label
                htmlFor="blog-search"
                className="block text-sm font-bold text-primary mb-2"
              >
                Search articles
              </label>
              <input
                id="blog-search"
                type="search"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by title, topic, or tag..."
                className="w-full px-4 py-3 rounded-xl bg-surface border border-subtle text-primary placeholder:text-secondary outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="lg:w-64">
              <label
                htmlFor="blog-category"
                className="block text-sm font-bold text-primary mb-2"
              >
                Category
              </label>
              <select
                id="blog-category"
                value={selectedCategory}
                onChange={(event) =>
                  handleCategoryChange(event.target.value)
                }
                className="w-full px-4 py-3 rounded-xl bg-surface border border-subtle text-primary outline-none focus:ring-2 focus:ring-blue-500"
              >
                {BLOG_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category === "All" ? "All categories" : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {BLOG_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-hover text-secondary hover:text-blue-600"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-16 sm:pb-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Explore
            </p>
            <h2 className="mt-2 text-3xl font-black text-primary">
              Latest articles
            </h2>
          </div>

          <p
            className="text-sm text-secondary font-semibold"
            aria-live="polite"
          >
            Showing {visiblePosts.length} of {filteredPosts.length} matching
            articles
          </p>
        </div>

        {visiblePosts.length > 0 ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {visiblePosts.map((post) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  onReadMore={handleReadMore}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 text-center">
                <button
                  type="button"
                  onClick={() =>
                    setVisibleCount((count) => count + POSTS_PER_PAGE)
                  }
                  className="px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold shadow-sm transition-colors"
                >
                  Load more articles
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-card border border-subtle rounded-2xl p-10 text-center">
            <div className="text-4xl mb-4" aria-hidden="true">
              🔎
            </div>
            <h3 className="text-xl font-black text-primary">
              No articles found
            </h3>
            <p className="mt-2 text-secondary">
              Try another search term or select a different category.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
                setVisibleCount(POSTS_PER_PAGE);
              }}
              className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-colors"
            >
              Reset filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

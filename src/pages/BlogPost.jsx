import React from "react";
import { getBlogPostBySlug } from "../data/blogPosts";

export default function BlogPost({ onNavigate, slug }) {
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return (
      <div className="min-h-[70vh] bg-surface text-primary flex items-center justify-center px-6">
        <div className="max-w-lg text-center">
          <div className="text-5xl mb-5" aria-hidden="true">
            📰
          </div>
          <h1 className="text-3xl font-black">Article not found</h1>
          <p className="mt-3 text-secondary">
            The article may have moved or the link may be incomplete.
          </p>
          <button
            type="button"
            onClick={() => onNavigate("blog")}
            className="mt-7 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-colors"
          >
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-surface text-primary">
      <header className="border-b border-subtle">
        <div className="max-w-4xl mx-auto px-6 py-10 sm:py-14">
          <button
            type="button"
            onClick={() => onNavigate("blog")}
            className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Blog
          </button>

          <span className="mt-8 inline-flex px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold">
            {post.category}
          </span>

          <h1 className="mt-5 text-4xl sm:text-5xl font-black leading-tight">
            {post.title}
          </h1>

          <p className="mt-5 text-lg text-secondary leading-relaxed">
            {post.excerpt}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-secondary">
            <span>{post.date}</span>
            <span aria-hidden="true">•</span>
            <span>{post.readTime}</span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full bg-hover text-secondary text-xs font-bold"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 sm:py-14">
        <img
          src={post.image}
          alt={post.alt}
          className="w-full max-h-[520px] object-cover rounded-3xl border border-subtle shadow-sm"
        />

        <div className="max-w-3xl mx-auto mt-10 sm:mt-12 space-y-6">
          {post.content.map((paragraph, index) => (
            <p
              key={`${post.id}-${index}`}
              className="text-base sm:text-lg text-secondary leading-8"
            >
              {paragraph}
            </p>
          ))}

          <div className="pt-8 mt-10 border-t border-subtle">
            <button
              type="button"
              onClick={() => onNavigate("blog")}
              className="px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-colors"
            >
              Explore more articles
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

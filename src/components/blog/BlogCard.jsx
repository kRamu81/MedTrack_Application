import React from "react";

export default function BlogCard({ post, onReadMore }) {
  return (
    <article className="group bg-card border border-subtle rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="h-52 overflow-hidden">
        <img
          src={post.image}
          alt={post.alt}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="p-6 flex flex-col flex-1">
        <span className="w-fit px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold">
          {post.category}
        </span>

        <h3 className="mt-4 text-xl font-black text-primary leading-snug">
          {post.title}
        </h3>

        <p className="mt-3 text-sm text-secondary leading-relaxed flex-1">
          {post.excerpt}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-md bg-hover text-secondary text-xs font-semibold"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-subtle flex items-center justify-between gap-3">
          <div className="text-xs text-secondary">
            <span>{post.date}</span>
            <span className="mx-2" aria-hidden="true">
              •
            </span>
            <span>{post.readTime}</span>
          </div>

          <button
            type="button"
            onClick={() => onReadMore(post)}
            className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            aria-label={`Read ${post.title}`}
          >
            Read more →
          </button>
        </div>
      </div>
    </article>
  );
}

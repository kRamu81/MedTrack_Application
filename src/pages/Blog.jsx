import React from "react";

const BLOG_POSTS = [
  {
    id: 1,
    category: "Equipment Management",
    title: "5 Ways Smart Equipment Tracking Reduces Hospital Downtime",
    excerpt:
      "Discover how centralized equipment tracking helps hospitals locate critical devices, monitor availability, and reduce delays in patient care.",
    date: "June 18, 2026",
    readTime: "5 min read",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80",
    alt: "Healthcare professional working with medical technology",
  },
  {
    id: 2,
    category: "Preventive Maintenance",
    title: "Why Preventive Maintenance Matters for Medical Equipment",
    excerpt:
      "A proactive maintenance strategy can extend equipment life, improve reliability, and help clinical teams avoid unexpected device failures.",
    date: "June 12, 2026",
    readTime: "6 min read",
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    alt: "Technician maintaining equipment",
  },
  {
    id: 3,
    category: "Healthcare Technology",
    title: "How Connected Technology Is Transforming Hospital Operations",
    excerpt:
      "From real-time dashboards to connected workflows, digital tools are helping healthcare teams make faster and more informed operational decisions.",
    date: "June 5, 2026",
    readTime: "7 min read",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
    alt: "Doctor using digital healthcare technology",
  },
  {
    id: 4,
    category: "Hospital Operations",
    title: "Building a More Efficient Medical Equipment Workflow",
    excerpt:
      "Learn how hospitals can improve coordination between administrators, technicians, and suppliers throughout the equipment lifecycle.",
    date: "May 29, 2026",
    readTime: "4 min read",
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
    alt: "Modern hospital environment",
  },
  {
    id: 5,
    category: "Supply Chain",
    title: "Improving Medical Supply Visibility Across Healthcare Facilities",
    excerpt:
      "Better visibility into requests, orders, and deliveries can reduce delays and help hospitals maintain access to essential equipment and replacement parts.",
    date: "May 20, 2026",
    readTime: "5 min read",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    alt: "Warehouse and healthcare supply chain operations",
  },
  {
    id: 6,
    category: "Data & Analytics",
    title: "Turning Equipment Data Into Better Maintenance Decisions",
    excerpt:
      "Operational data can reveal maintenance patterns, recurring failures, and opportunities to improve equipment utilization and planning.",
    date: "May 14, 2026",
    readTime: "6 min read",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    alt: "Analytics dashboard displayed on a computer",
  },
];

export default function Blog({ onNavigate }) {
  const featuredPost = BLOG_POSTS[0];
  const remainingPosts = BLOG_POSTS.slice(1);

  return (
    <div className="min-h-screen bg-surface text-primary">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-subtle">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-cyan-500/10 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center px-4 py-2 mb-6 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold">
              MedTrack Insights
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-primary leading-tight">
              Ideas for smarter
              <span className="text-blue-600 dark:text-blue-400">
                {" "}
                healthcare operations.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg sm:text-xl text-secondary leading-relaxed">
              Explore practical insights about medical equipment management,
              preventive maintenance, hospital operations, and the technology
              shaping modern healthcare.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="max-w-7xl mx-auto px-6 py-14 sm:py-16">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Featured
            </p>

            <h2 className="mt-2 text-3xl font-black text-primary">
              Latest insight
            </h2>
          </div>
        </div>

        <article className="grid lg:grid-cols-2 overflow-hidden rounded-3xl bg-card border border-subtle shadow-sm">
          <div className="min-h-[280px] lg:min-h-[420px] overflow-hidden">
            <img
              src={featuredPost.image}
              alt={featuredPost.alt}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
            <span className="w-fit px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wide">
              {featuredPost.category}
            </span>

            <h3 className="mt-5 text-2xl sm:text-3xl lg:text-4xl font-black text-primary leading-tight">
              {featuredPost.title}
            </h3>

            <p className="mt-5 text-secondary text-base sm:text-lg leading-relaxed">
              {featuredPost.excerpt}
            </p>

            <div className="mt-7 pt-6 border-t border-subtle flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-secondary">
              <span>{featuredPost.date}</span>
              <span aria-hidden="true">•</span>
              <span>{featuredPost.readTime}</span>
            </div>
          </div>
        </article>
      </section>

      {/* Blog Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-16 sm:pb-20">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Explore
          </p>

          <h2 className="mt-2 text-3xl font-black text-primary">
            More from the Blog
          </h2>

          <p className="mt-3 max-w-2xl text-secondary">
            Practical ideas and perspectives for hospitals, technicians,
            healthcare teams, and equipment suppliers.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {remainingPosts.map((post) => (
            <article
              key={post.id}
              className="group bg-card border border-subtle rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
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

                <div className="mt-6 pt-4 border-t border-subtle flex items-center justify-between gap-3 text-xs text-secondary">
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 pb-16 sm:pb-20">
        <div className="rounded-3xl bg-blue-600 px-6 py-12 sm:px-10 lg:px-14 text-white flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-2xl">
            <p className="text-blue-100 font-bold text-sm uppercase tracking-widest">
              Ready to get started?
            </p>

            <h2 className="mt-3 text-3xl sm:text-4xl font-black">
              Keep your medical equipment ready when it matters most.
            </h2>

            <p className="mt-4 text-blue-100 text-lg leading-relaxed">
              Bring hospitals, technicians, and suppliers together in one
              connected equipment management workflow.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate("register")}
              className="px-7 py-3.5 bg-white text-blue-600 rounded-full font-bold hover:bg-blue-50 transition-colors"
            >
              Get Started
            </button>

            <button
              type="button"
              onClick={() => onNavigate("landing")}
              className="px-7 py-3.5 border border-blue-300 text-white rounded-full font-bold hover:bg-blue-500 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
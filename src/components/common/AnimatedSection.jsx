import React, { useEffect, useRef, useState } from 'react';

/**
 * A wrapper component that applies a given Tailwind animation class
 * when the element scrolls into view.
 *
 * @param {string} animation - The animation class (e.g., 'animate-fade-up', 'animate-fade-left')
 * @param {string} className - Additional classes
 * @param {string} delay - Optional animation delay class (e.g., 'delay-100')
 */
export default function AnimatedSection({ children, animation = 'animate-fade-up', className = '', delay = '' }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // We only want it to animate once per page load to keep it smooth
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-opacity duration-700 ${isVisible ? `opacity-100 ${animation} ${delay}` : 'opacity-0'} ${className}`}
    >
      {children}
    </div>
  );
}

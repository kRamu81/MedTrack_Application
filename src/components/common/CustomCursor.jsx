import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const position = useRef({ x: 0, y: 0 });
  const ringPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice || prefersReducedMotion) return;

    document.body.classList.add("custom-cursor-enabled");

    const IDLE_TIMEOUT = 500;
    let animationFrame;
    let idleTimer;

    const handleMouseMove = (e) => {
      position.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
      clearTimeout(idleTimer);
      if (!animationFrame) {
        animationFrame = requestAnimationFrame(animateRing);
      }
      idleTimer = setTimeout(() => {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }, IDLE_TIMEOUT);
    };

    const animateRing = () => {
      ringPosition.current.x += (position.current.x - ringPosition.current.x) * 0.15;
      ringPosition.current.y += (position.current.y - ringPosition.current.y) * 0.15;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPosition.current.x}px, ${ringPosition.current.y}px) translate(-50%, -50%)`;
      }
      animationFrame = requestAnimationFrame(animateRing);
    };

    const handleMouseDown = () => ringRef.current?.classList.add("cursor-click");
    const handleMouseUp = () => ringRef.current?.classList.remove("cursor-click");

    const interactiveSelector = "a, button, [role='button'], .cursor-pointer";

    const handleMouseOver = (e) => {
      if (e.target.closest("input, select, textarea")) {
        if (dotRef.current) dotRef.current.style.opacity = "0";
        if (ringRef.current) ringRef.current.style.opacity = "0";
        return;
      } else {
        if (dotRef.current) dotRef.current.style.opacity = "1";
        if (ringRef.current) ringRef.current.style.opacity = "1";
      }

      if (e.target.closest(interactiveSelector)) {
        ringRef.current?.classList.add("cursor-hover");
      }
    };

    const handleMouseOut = (e) => {
      if (e.target.closest(interactiveSelector)) {
        ringRef.current?.classList.remove("cursor-hover");
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", handleMouseOut);

    return () => {
      document.body.classList.remove("custom-cursor-enabled");
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
      cancelAnimationFrame(animationFrame);
      clearTimeout(idleTimer);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="custom-cursor-dot" />
      <div ref={ringRef} className="custom-cursor-ring" />
    </>
  );
}
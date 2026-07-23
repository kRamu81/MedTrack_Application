export default function MedTrackLogo({ className = "", size = "text-3xl" }) {
  return (
    <span
      className={`font-black tracking-tighter text-[#2563eb] dark:text-[#3b82f6] select-none inline-block ${size} ${className}`}
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      "medtrack"
    </span>
  );
}

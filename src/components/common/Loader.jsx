export default function Loader({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-3">
      <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-sm text-gray-500 font-medium">{text}</p>
    </div>
  );
}

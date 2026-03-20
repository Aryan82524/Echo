import { getInitials } from "../../utils/helpers";

const COLORS = [
  "bg-rose-500", "bg-pink-500", "bg-fuchsia-500",
  "bg-violet-500", "bg-indigo-500", "bg-blue-500",
  "bg-cyan-500", "bg-teal-500", "bg-green-500",
  "bg-amber-500", "bg-orange-500",
];

const getColorFromName = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
};

export default function Avatar({ name = "", src, size = "md", showOnline = false, isOnline = false }) {
  const sizes = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
  };

  const dotSizes = {
    xs: "w-1.5 h-1.5",
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
    xl: "w-4 h-4",
  };

  return (
    <div className="relative flex-shrink-0">
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizes[size]} rounded-full object-cover ring-2 ring-white dark:ring-gray-900`}
        />
      ) : (
        <div
          className={`${sizes[size]} ${getColorFromName(name)} rounded-full flex items-center justify-center text-white font-semibold ring-2 ring-white dark:ring-gray-900`}
        >
          {getInitials(name)}
        </div>
      )}

      {showOnline && (
        <span
          className={`
            absolute bottom-0 right-0 ${dotSizes[size]} rounded-full border-2 border-white dark:border-gray-900
            ${isOnline ? "bg-green-400" : "bg-gray-300 dark:bg-gray-600"}
          `}
        />
      )}
    </div>
  );
}
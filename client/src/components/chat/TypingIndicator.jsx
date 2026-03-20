import { motion, AnimatePresence } from "framer-motion";

export default function TypingIndicator({ names = [] }) {
  if (!names.length) return null;

  const label =
    names.length === 1
      ? `${names[0]} is typing`
      : names.length === 2
      ? `${names[0]} and ${names[1]} are typing`
      : `${names[0]} and ${names.length - 1} others are typing`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className="flex items-end gap-2 mb-1"
      >
        <div className="w-7 flex-shrink-0" />
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl rounded-bl-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
          {/* Bouncing dots */}
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{
                  y: [0, -5, 0],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
                className="block w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500"
              />
            ))}
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">{label}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
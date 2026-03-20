import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-8xl font-bold text-primary-500 mb-4">404</div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Page not found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/chats" className="btn-primary">
          Go to Chats
        </Link>
      </motion.div>
    </div>
  );
}
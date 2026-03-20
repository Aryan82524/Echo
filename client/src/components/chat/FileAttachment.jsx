import { formatFileSize, getFileIcon } from "../../utils/helpers";

export default function FileAttachment({ fileName, fileUrl, fileSize, isOwn }) {
  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        flex items-center gap-3 px-4 py-3 rounded-2xl shadow-sm transition-opacity hover:opacity-80 max-w-xs
        ${isOwn
          ? "bg-primary-500 text-white"
          : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
        }
      `}
    >
      <span className="text-2xl flex-shrink-0">{getFileIcon(fileName)}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isOwn ? "text-white" : "text-gray-900 dark:text-gray-100"}`}>
          {fileName || "File"}
        </p>
        {fileSize && (
          <p className={`text-xs ${isOwn ? "text-white/70" : "text-gray-400"}`}>
            {formatFileSize(fileSize)}
          </p>
        )}
      </div>
      <span className={`text-xs flex-shrink-0 ${isOwn ? "text-white/70" : "text-primary-500"}`}>
        ↓
      </span>
    </a>
  );
}
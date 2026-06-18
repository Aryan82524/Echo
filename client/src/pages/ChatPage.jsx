import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "../context/ChatContext";
import Sidebar from "../components/sidebar/Sidebar";
import ChatWindow from "../components/chat/ChatWindow";

export default function ChatPage() {
  const { selectedChat, loadChats } = useChat();
  const [mobileShowChat, setMobileShowChat] = useState(false);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // On mobile, show chat window when a chat is selected
  useEffect(() => {
    if (selectedChat) setMobileShowChat(true);
  }, [selectedChat]);

  return (
    <div className="h-screen flex bg-wa-bg dark:bg-wa-dark-bg overflow-hidden">
      {/* Sidebar */}
      <div
        className={`
          ${mobileShowChat ? "hidden md:flex" : "flex"}
          w-full md:w-[420px] lg:w-[440px] flex-shrink-0
          flex-col border-r border-gray-200 dark:border-wa-dark-border
          bg-wa-sidebar dark:bg-wa-dark-sidebar
        `}
      >
        <Sidebar onChatSelect={() => setMobileShowChat(true)} />
      </div>

      {/* Chat Window */}
      <div
        className={`
          ${mobileShowChat ? "flex" : "hidden md:flex"}
          flex-1 flex-col min-w-0
        `}
      >
        <AnimatePresence mode="wait">
          {selectedChat ? (
            <motion.div
              key={selectedChat._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full"
            >
              <ChatWindow onBack={() => setMobileShowChat(false)} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full text-center p-8 chat-wallpaper"
            >
              {/* Echo Web-style empty state */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="max-w-md"
              >
                {/* Animated Echo icon */}
                <motion.div
                  className="w-[280px] h-[230px] mx-auto mb-8 relative flex items-center justify-center"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="relative">
                    {/* Glowing circle bg */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: "radial-gradient(circle, rgba(0, 168, 132, 0.1) 0%, transparent 70%)",
                        width: 200,
                        height: 200,
                        top: -30,
                        left: -30,
                      }}
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <svg viewBox="0 0 24 24" className="w-32 h-32" fill="none">
                      <path
                        d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
                        className="fill-gray-300 dark:fill-gray-600"
                        opacity="0.3"
                      />
                      <path
                        d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"
                        className="fill-gray-400 dark:fill-gray-500"
                      />
                      <motion.circle cx="8" cy="10" r="1.2" className="fill-primary-500"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                      />
                      <motion.circle cx="12" cy="10" r="1.2" className="fill-primary-500"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.circle cx="16" cy="10" r="1.2" className="fill-primary-500"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                      />
                    </svg>
                  </div>
                </motion.div>

                <motion.h2
                  className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Echo Chat for Web
                </motion.h2>
                <motion.p
                  className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Send and receive messages instantly.
                  <br />
                  Select a chat from the sidebar to start messaging.
                </motion.p>
                <motion.div
                  className="flex items-center justify-center gap-2 text-xs text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <svg viewBox="0 0 10 12" width="10" height="12" fill="currentColor" opacity="0.5">
                    <path d="M5 0C2.2 0 0 2.2 0 5c0 1.7.8 3.2 2.1 4.1L5 12l2.9-2.9C9.2 8.2 10 6.7 10 5c0-2.8-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5S3.1 1.5 5 1.5 8.5 3.1 8.5 5 6.9 8.5 5 8.5z" />
                  </svg>
                  End-to-end encrypted
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
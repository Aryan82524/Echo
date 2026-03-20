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
    <div className="h-screen flex bg-gray-50 dark:bg-gray-950 overflow-hidden page-enter">
      {/* Sidebar */}
      <div
        className={`
          ${mobileShowChat ? "hidden md:flex" : "flex"}
          w-full md:w-80 lg:w-96 flex-shrink-0
          flex-col border-r border-gray-200 dark:border-gray-800
          bg-white dark:bg-gray-900
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full"
            >
              <ChatWindow onBack={() => setMobileShowChat(false)} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center p-8"
            >
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Select a conversation
              </h2>
              <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs">
                Choose a chat from the sidebar or search for someone to start messaging
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
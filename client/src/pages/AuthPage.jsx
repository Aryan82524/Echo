import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import LoginForm from "../components/auth/LoginForm";
import SignupForm from "../components/auth/SignupForm";

// Floating animated orbs
const orbs = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size: Math.random() * 160 + 50,
  x: Math.random() * 100,
  y: Math.random() * 100,
  delay: Math.random() * 5,
  duration: Math.random() * 6 + 6,
  color: i % 3 === 0 ? "rgba(0,168,132,0.12)" : i % 3 === 1 ? "rgba(37,211,102,0.08)" : "rgba(0,100,80,0.1)",
}));

// Animated text character splitter
function AnimatedText({ text, className = "", delay = 0 }) {
  return (
    <span className={className}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 30, rotateX: 90, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.5,
            delay: delay + i * 0.04,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ display: "inline-block", whiteSpace: char === " " ? "pre" : "normal" }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

// Animated line drawing SVG
function AnimatedLogo() {
  return (
    <motion.div
      className="relative inline-flex items-center justify-center w-24 h-24 rounded-[28px]"
      style={{
        background: "linear-gradient(135deg, #00A884 0%, #25D366 50%, #00A884 100%)",
        backgroundSize: "200% 200%",
      }}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        boxShadow: [
          "0 0 30px rgba(0,168,132,0.3), 0 10px 40px rgba(0,168,132,0.2)",
          "0 0 60px rgba(0,168,132,0.5), 0 10px 60px rgba(0,168,132,0.3)",
          "0 0 30px rgba(0,168,132,0.3), 0 10px 40px rgba(0,168,132,0.2)",
        ],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* SVG icon with draw animation */}
      <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none">
        <motion.path
          d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"
          stroke="white"
          strokeWidth="0.5"
          fill="white"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        <motion.circle cx="8" cy="10" r="1" fill="white"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1] }}
          transition={{ delay: 1.0, duration: 0.5 }}
        />
        <motion.circle cx="12" cy="10" r="1" fill="white"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1] }}
          transition={{ delay: 1.2, duration: 0.5 }}
        />
        <motion.circle cx="16" cy="10" r="1" fill="white"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1] }}
          transition={{ delay: 1.4, duration: 0.5 }}
        />
      </svg>

      {/* Multiple expanding pulse rings */}
      {[0, 0.8, 1.6].map((delay, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-[28px] border border-primary-400/50"
          animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay }}
        />
      ))}
    </motion.div>
  );
}

// Floating grid lines background
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(rgba(0,168,132,1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,168,132,1) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
      }} />
    </div>
  );
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Parallax effect on mouse move
  const bgX = useTransform(mouseX, [0, window.innerWidth], [10, -10]);
  const bgY = useTransform(mouseY, [0, window.innerHeight], [10, -10]);

  const handleMouseMove = (e) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 morph-bg"
      onMouseMove={handleMouseMove}
    >
      <GridBackground />

      {/* Animated floating orbs with parallax */}
      <motion.div className="particles-bg" style={{ x: bgX, y: bgY }}>
        {orbs.map((p) => (
          <motion.div
            key={p.id}
            className="particle"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
              background: `radial-gradient(circle, ${p.color} 0%, transparent 70%)`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, 20, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* Large gradient orb blobs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-[150px] opacity-20"
        style={{ background: "radial-gradient(circle, #00A884 0%, transparent 70%)" }}
        animate={{ x: [-100, 100, -100], y: [-50, 50, -50] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-15"
        style={{ background: "radial-gradient(circle, #25D366 0%, transparent 70%)", right: "-10%", bottom: "10%" }}
        animate={{ x: [50, -50, 50], y: [30, -30, 30] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative w-full max-w-md z-10">
        {/* Logo / Brand with character animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-10"
        >
          {/* Animated logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="mb-6 inline-block"
          >
            <AnimatedLogo />
          </motion.div>

          {/* Title with character-by-character reveal */}
          <h1 className="text-5xl font-black text-white mb-3 tracking-tight">
            <AnimatedText text="Echo" className="gradient-text neon-glow" delay={0.8} />
            <span className="inline-block w-3" />
            <AnimatedText text="Chat" className="text-white/90" delay={1.0} />
          </h1>

          {/* Subtitle with blur-in */}
          <motion.p
            className="text-sm text-gray-400 font-light tracking-widest uppercase"
            initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            Connect instantly • Chat seamlessly
          </motion.p>

          {/* Animated underline */}
          <motion.div
            className="mx-auto mt-4 h-0.5 rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, #00A884, #25D366, #00A884, transparent)" }}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 120, opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.8, ease: "easeOut" }}
          />
        </motion.div>

        {/* Tab Switcher with animated pill */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative rounded-2xl p-1.5 flex mb-8 overflow-hidden border-beam"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Animated sliding pill */}
          <motion.div
            className="absolute top-1.5 bottom-1.5 rounded-xl"
            style={{
              background: "linear-gradient(135deg, #00A884, #25D366)",
              boxShadow: "0 4px 20px rgba(0,168,132,0.4)",
              width: "calc(50% - 6px)",
            }}
            animate={{ x: isLogin ? 4 : "calc(100% + 8px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
          {["Login", "Sign Up"].map((label, i) => (
            <motion.button
              key={label}
              onClick={() => setIsLogin(i === 0)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`relative z-10 flex-1 py-3.5 rounded-xl text-sm font-bold transition-colors duration-300 ${
                (i === 0) === isLogin
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {label}
            </motion.button>
          ))}
        </motion.div>

        {/* Form with 3D perspective transitions */}
        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, rotateY: -15, x: -60, filter: "blur(8px)", scale: 0.95 }}
              animate={{ opacity: 1, rotateY: 0, x: 0, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, rotateY: 15, x: 60, filter: "blur(8px)", scale: 0.95 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{ perspective: 1200 }}
            >
              <LoginForm onSwitch={() => setIsLogin(false)} />
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0, rotateY: 15, x: 60, filter: "blur(8px)", scale: 0.95 }}
              animate={{ opacity: 1, rotateY: 0, x: 0, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, rotateY: -15, x: -60, filter: "blur(8px)", scale: 0.95 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{ perspective: 1200 }}
            >
              <SignupForm onSwitch={() => setIsLogin(true)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer with shimmer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0 }}
          className="text-center mt-8"
        >
          <motion.p
            className="text-xs text-gray-500 flex items-center justify-center gap-2"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <svg viewBox="0 0 12 16" width="10" height="13" fill="currentColor" opacity="0.5">
              <path d="M6 0C3.2 0 1 2.2 1 5v2H0v9h12V7h-1V5c0-2.8-2.2-5-5-5zm3 7H3V5c0-1.7 1.3-3 3-3s3 1.3 3 3v2z" />
            </svg>
            End-to-end encrypted
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
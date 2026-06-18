import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

const inputVariant = {
  hidden: { opacity: 0, x: -30, filter: "blur(8px)" },
  visible: (i) => ({
    opacity: 1, x: 0, filter: "blur(0px)",
    transition: { delay: 0.1 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function LoginForm({ onSwitch }) {
  const { login, loading, error } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [focusField, setFocusField] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setFormError("All fields are required");
      return;
    }
    try {
      await login(form.email, form.password);
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <motion.div
      className="rounded-3xl p-8 shadow-2xl shine-sweep tilt-card"
      style={{
        background: "rgba(17, 27, 33, 0.9)",
        backdropFilter: "blur(40px)",
        border: "1px solid rgba(0,168,132,0.08)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header with mask reveal */}
      <div className="overflow-hidden mb-1">
        <motion.h2
          className="text-2xl font-extrabold text-white"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Welcome back
        </motion.h2>
      </div>
      <div className="overflow-hidden mb-7">
        <motion.p
          className="text-sm text-gray-400"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          Sign in to continue to{" "}
          <span className="gradient-text font-semibold">Echo Chat</span>
        </motion.p>
      </div>

      {(formError || error) && (
        <motion.div
          initial={{ opacity: 0, height: 0, scale: 0.8 }}
          animate={{ opacity: 1, height: "auto", scale: 1 }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"
        >
          <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5 }}>⚠️</motion.span>
          {formError || error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email field */}
        <motion.div custom={0} variants={inputVariant} initial="hidden" animate="visible">
          <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-[0.15em]">
            Email
          </label>
          <motion.div
            className={`relative rounded-xl overflow-hidden transition-all duration-500`}
            animate={focusField === "email" ? {
              boxShadow: "0 0 0 2px rgba(0,168,132,0.3), 0 0 20px rgba(0,168,132,0.1)"
            } : {
              boxShadow: "0 0 0 0px transparent"
            }}
          >
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onFocus={() => setFocusField("email")}
              onBlur={() => setFocusField(null)}
              placeholder="you@example.com"
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-wa-dark-input border border-wa-dark-border text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 transition-all duration-300 text-sm"
              autoComplete="email"
            />
            {/* Focus underline beam */}
            <motion.div
              className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-primary-500 to-wa-green-light"
              initial={{ width: "0%" }}
              animate={{ width: focusField === "email" ? "100%" : "0%" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </motion.div>
        </motion.div>

        {/* Password field */}
        <motion.div custom={1} variants={inputVariant} initial="hidden" animate="visible">
          <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-[0.15em]">
            Password
          </label>
          <motion.div
            className="relative rounded-xl overflow-hidden"
            animate={focusField === "password" ? {
              boxShadow: "0 0 0 2px rgba(0,168,132,0.3), 0 0 20px rgba(0,168,132,0.1)"
            } : {
              boxShadow: "0 0 0 0px transparent"
            }}
          >
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
              </svg>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              onFocus={() => setFocusField("password")}
              onBlur={() => setFocusField(null)}
              placeholder="••••••••"
              className="w-full pl-12 pr-14 py-4 rounded-xl bg-wa-dark-input border border-wa-dark-border text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 transition-all duration-300 text-sm"
              autoComplete="current-password"
            />
            <motion.button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85, rotate: 15 }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary-400 transition-colors"
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                </svg>
              )}
            </motion.button>
            <motion.div
              className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-primary-500 to-wa-green-light"
              initial={{ width: "0%" }}
              animate={{ width: focusField === "password" ? "100%" : "0%" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </motion.div>
        </motion.div>

        {/* Submit button */}
        <motion.div custom={2} variants={inputVariant} initial="hidden" animate="visible">
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(0,168,132,0.4), 0 10px 30px rgba(0,168,132,0.2)" }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-xl font-bold text-white text-sm tracking-wide
                       flex items-center justify-center gap-2 transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed liquid-btn relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #00A884 0%, #25D366 50%, #00A884 100%)",
              backgroundSize: "200% 200%",
              boxShadow: "0 4px 25px rgba(0,168,132,0.35)",
            }}
          >
            {loading ? (
              <>
                <motion.span
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
                <span>Signing in…</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <motion.svg
                  viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                </motion.svg>
              </>
            )}
          </motion.button>
        </motion.div>
      </form>

      <motion.p
        custom={3}
        variants={inputVariant}
        initial="hidden"
        animate="visible"
        className="text-center text-sm text-gray-500 mt-7"
      >
        Don't have an account?{" "}
        <motion.button
          onClick={onSwitch}
          whileHover={{ scale: 1.05, color: "#25D366" }}
          whileTap={{ scale: 0.95 }}
          className="text-primary-500 font-bold transition-colors"
        >
          Sign up
        </motion.button>
      </motion.p>
    </motion.div>
  );
}
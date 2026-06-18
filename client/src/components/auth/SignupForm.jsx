import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

export default function SignupForm({ onSwitch }) {
  const { signup, loading } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [focusField, setFocusField] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      return setFormError("All fields are required");
    }
    if (form.password.length < 6) {
      return setFormError("Password must be at least 6 characters");
    }
    if (form.password !== form.confirm) {
      return setFormError("Passwords do not match");
    }
    try {
      await signup(form.name, form.email, form.password);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const fields = [
    { name: "name", label: "Full Name", type: "text", icon: "👤", placeholder: "John Doe", delay: 0.1 },
    { name: "email", label: "Email", type: "email", icon: "✉️", placeholder: "you@example.com", delay: 0.15 },
    { name: "password", label: "Password", type: showPassword ? "text" : "password", icon: "🔒", placeholder: "Min. 6 characters", delay: 0.2, hasToggle: true },
    { name: "confirm", label: "Confirm Password", type: "password", icon: "🔐", placeholder: "Repeat password", delay: 0.25 },
  ];

  return (
    <div
      className="rounded-3xl p-7 shadow-2xl"
      style={{
        background: "rgba(17, 27, 33, 0.85)",
        backdropFilter: "blur(30px)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <h2 className="text-xl font-bold text-white mb-1">Create account</h2>
        <p className="text-sm text-gray-400 mb-6">
          Join Echo Chat today
        </p>
      </motion.div>

      {formError && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"
        >
          <span>⚠️</span>
          {formError}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((f) => (
          <motion.div
            key={f.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: f.delay }}
          >
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
              {f.label}
            </label>
            <div className={`relative rounded-xl transition-all duration-300 ${focusField === f.name ? "glow-border" : ""}`}>
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{f.icon}</span>
              <input
                type={f.type}
                name={f.name}
                value={form[f.name]}
                onChange={handleChange}
                onFocus={() => setFocusField(f.name)}
                onBlur={() => setFocusField(null)}
                placeholder={f.placeholder}
                className={`w-full pl-12 ${f.hasToggle ? "pr-14" : "pr-4"} py-3.5 rounded-xl bg-wa-dark-input border border-wa-dark-border text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-all duration-300`}
              />
              {f.hasToggle && (
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors text-sm"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              )}
            </div>
          </motion.div>
        ))}

        <motion.button
          type="submit"
          disabled={loading}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          whileHover={{ scale: 1.01, boxShadow: "0 0 30px rgba(0, 168, 132, 0.4)" }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-xl font-bold text-white text-sm tracking-wide
                     flex items-center justify-center gap-2 transition-all duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          style={{
            background: "linear-gradient(135deg, #00A884 0%, #25D366 100%)",
            boxShadow: "0 4px 20px rgba(0, 168, 132, 0.3)",
          }}
        >
          {loading ? (
            <>
              <motion.span
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Creating account…
            </>
          ) : (
            <>
              Create Account
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✨
              </motion.span>
            </>
          )}
        </motion.button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <button
          onClick={onSwitch}
          className="text-primary-500 hover:text-primary-400 font-semibold transition-colors"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}
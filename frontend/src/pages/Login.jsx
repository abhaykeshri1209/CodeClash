import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, NavLink } from "react-router";
import { loginUser } from "../authSlice";
import { useEffect, useState } from "react";

const loginSchema = z.object({
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password is too weak"),
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.auth,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-[#0a0e1a]">
      {/* Ambient animated gradient wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(45,212,191,0.15), transparent 40%), radial-gradient(circle at 80% 80%, rgba(251,191,36,0.10), transparent 45%), radial-gradient(circle at 50% 100%, rgba(99,102,241,0.12), transparent 50%)",
        }}
      />

      {/* Faint grid backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Floating code glyphs */}
      <span
        aria-hidden="true"
        className="hidden sm:block absolute text-teal-400/20 font-mono text-6xl select-none animate-[float_9s_ease-in-out_infinite]"
        style={{ top: "12%", left: "10%" }}
      >
        {"{ }"}
      </span>

      <span
        aria-hidden="true"
        className="hidden sm:block absolute text-amber-400/20 font-mono text-5xl select-none animate-[float_11s_ease-in-out_infinite]"
        style={{
          bottom: "16%",
          left: "14%",
          animationDelay: "1.2s",
        }}
      >
        {"</>"}
      </span>

      <span
        aria-hidden="true"
        className="hidden sm:block absolute text-indigo-400/20 font-mono text-5xl select-none animate-[float_10s_ease-in-out_infinite]"
        style={{
          top: "18%",
          right: "12%",
          animationDelay: "0.6s",
        }}
      >
        {"[ ]"}
      </span>

      <span
        aria-hidden="true"
        className="hidden sm:block absolute text-teal-400/15 font-mono text-4xl select-none animate-[float_8s_ease-in-out_infinite]"
        style={{
          bottom: "10%",
          right: "16%",
          animationDelay: "2s",
        }}
      >
        {"( )"}
      </span>

      {/* Auth card */}
      <div className="relative w-full max-w-sm animate-[fadeInUp_0.7s_ease-out]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.5)] p-8">
          {/* Brand */}
          <div className="flex flex-col items-center mb-8">
            <h1 className="font-mono text-2xl font-semibold tracking-tight text-slate-100">
              <span className="text-teal-400">&lt;</span>
              CodeClash
              <span className="text-amber-400">/&gt;</span>
              <span className="inline-block w-[2px] h-5 bg-teal-400 align-middle ml-1 animate-[blink_1s_step-end_infinite]" />
            </h1>

            <p className="mt-2 text-xs font-mono text-slate-500">
              authenticate() — welcome back
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs font-mono text-red-300">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Email Field */}
            <div className="mb-4">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Email
              </label>

              <input
                type="email"
                placeholder="john@example.com"
                className={`w-full rounded-lg bg-slate-900/60 border px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600
                  outline-none transition-all duration-200
                  focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400/60
                  ${
                    errors.emailId
                      ? "border-red-500/70 animate-[shake_0.4s_ease-in-out]"
                      : "border-white/10 hover:border-white/20"
                  }`}
                {...register("emailId")}
              />

              {errors.emailId && (
                <span className="block text-red-400 text-xs mt-1.5 font-mono">
                  {errors.emailId.message}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full rounded-lg bg-slate-900/60 border px-3.5 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-600
                    outline-none transition-all duration-200
                    focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400/60
                    ${
                      errors.password
                        ? "border-red-500/70 animate-[shake_0.4s_ease-in-out]"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  {...register("password")}
                />

                {/* Show / Hide Password */}
                <button
                  type="button"
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-500 hover:text-teal-400 transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    /* Eye Off */
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 transition-transform duration-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    /* Eye */
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 transition-transform duration-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {errors.password && (
                <span className="block text-red-400 text-xs mt-1.5 font-mono">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full mt-6 overflow-hidden rounded-lg py-2.5 font-mono text-sm font-medium text-slate-950
                bg-gradient-to-r from-teal-400 to-amber-300
                transition-all duration-200
                hover:shadow-[0_0_24px_rgba(45,212,191,0.35)] hover:-translate-y-0.5
                active:translate-y-0
                disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              />

              <span className="relative flex items-center justify-center gap-2">
                {loading && (
                  <svg
                    className="h-4 w-4 animate-spin text-slate-950"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />

                    <path
                      className="opacity-90"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}

                {loading ? "Logging in..." : "Login"}
              </span>
            </button>
          </form>

          {/* Signup Redirect */}
          <div className="text-center mt-6">
            <span className="text-sm text-slate-400">
              Don't have an account?{" "}
              <NavLink
                to="/signup"
                className="relative text-teal-400 hover:text-teal-300 transition-colors duration-200
                  after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0
                  after:bg-teal-400 after:transition-all after:duration-300 hover:after:w-full"
              >
                Sign Up
              </NavLink>
            </span>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }

          50% {
            transform: translateY(-18px) rotate(4deg);
          }
        }

        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }

          50% {
            opacity: 0;
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }

          20% {
            transform: translateX(-4px);
          }

          40% {
            transform: translateX(4px);
          }

          60% {
            transform: translateX(-3px);
          }

          80% {
            transform: translateX(3px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;

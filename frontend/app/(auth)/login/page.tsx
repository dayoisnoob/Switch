// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { Eye, EyeOff } from "lucide-react";
// import {
//   AuthCard,
//   AuthLogo,
//   AuthSubtitle,
//   OAuthButtons,
//   Divider,
// } from "@/components/auth/auth-components";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";

// // ─── YOUR JOB ─────────────────────────────────────────────────────────────────
// // Wire handleSubmit to POST /auth/login
// // On success: router.push('/dashboard')
// // On error: setError(err.message)
// // ──────────────────────────────────────────────────────────────────────────────

// export default function LoginPage() {
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     // YOUR JOB: call api.post('/auth/login', { email, password })
//     setLoading(false);
//   };

//   return (
//     <AuthCard>
//       <AuthLogo />
//       <AuthSubtitle>Sign in to your workspace</AuthSubtitle>

//       <OAuthButtons />
//       <Divider />

//       <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//         <Input
//           label="Email"
//           type="email"
//           name="email"
//           placeholder="you@example.com"
//           autoComplete="email"
//           required
//         />

//         <div className="flex flex-col gap-1.5">
//           <Input
//             label="Password"
//             type={showPassword ? "text" : "password"}
//             name="password"
//             placeholder="••••••••"
//             autoComplete="current-password"
//             required
//             // Inline show/hide toggle as a right-side adornment
//             className="pr-10"
//           />
//           {/* Toggle sits on top of the input — absolute position inside a relative wrapper */}
//           <div className="relative -mt-8 flex justify-end pr-3 pointer-events-none">
//             <button
//               type="button"
//               onClick={() => setShowPassword((v) => !v)}
//               className="pointer-events-auto text-muted hover:text-secondary transition-colors"
//               tabIndex={-1}
//             >
//               {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
//             </button>
//           </div>
//         </div>

//         <div className="flex justify-end mt-2">
//           <Link
//             href="/forgot-password"
//             className="text-xs text-accent hover:opacity-80 transition-opacity"
//           >
//             Forgot password?
//           </Link>
//         </div>

//         {error && (
//           <p className="text-xs text-[--danger] text-center">{error}</p>
//         )}

//         <Button
//           type="submit"
//           variant="primary"
//           size="md"
//           loading={loading}
//           className="w-full"
//         >
//           Sign in
//         </Button>
//       </form>

//       <p className="text-[11px] text-muted text-center mt-5">
//         No account?{" "}
//         <Link
//           href="/register"
//           className="text-accent hover:opacity-80 transition-opacity"
//         >
//           Create one
//         </Link>
//       </p>
//     </AuthCard>
//   );
// }

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import {
  AuthCard,
  AuthInput,
  PrimaryButton,
  ServerError,
} from "@/components/auth/auth-components";
import { AuthService, LoginRequest } from "@/services/auth.service";
import { getErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

export default function EmailLoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>();

  const onLogin = async (data: LoginRequest) => {
    setServerError("");
    setLoading(true);

    try {
      const user = await AuthService.login(data);
      setUser(user);
      router.push("/dashboard");
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-[#8b949e] hover:text-[#c9d1d9] transition-colors mb-6 text-sm self-start"
      >
        <ChevronLeft size={16} />
        Back
      </button>

      <div className="w-full">
        <h1 className="text-xl font-semibold text-[#f0f6fc] mb-1">
          Sign in with email
        </h1>
        <p className="text-sm text-[#8b949e] mb-8">
          Enter your credentials to access your account.
        </p>

        <form onSubmit={handleSubmit(onLogin)} className="w-full space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#c9d1d9]">
              Email address
            </label>
            <AuthInput
              type="email"
              placeholder="name@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
              })}
              disabled={loading}
              autoFocus
            />
            {errors.email && (
              <span className="text-[11px] text-red-400">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-[#c9d1d9]">
                Password
              </label>
              <button
                type="button"
                tabIndex={-1}
                className="text-xs text-[#58a6ff] hover:underline"
                onClick={() => router.push("/forgot-password")}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <AuthInput
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pr-10"
                {...register("password", { required: "Password is required" })}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484f58] hover:text-[#8b949e] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <span className="text-[11px] text-red-400">
                {errors.password.message}
              </span>
            )}
          </div>

          {serverError && <ServerError message={serverError} />}

          <div className="pt-2">
            <PrimaryButton type="submit" loading={loading}>
              Sign In
            </PrimaryButton>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-[#30363d] text-center">
          <p className="text-sm text-[#8b949e]">
            Don&apos;t have an account?{" "}
            <button
              onClick={() => router.push("/register")}
              className="text-[#58a6ff] hover:underline font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </AuthCard>
  );
}

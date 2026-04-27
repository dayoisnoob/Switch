"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  AuthCard,
  AuthInput,
  PrimaryButton,
  ServerError,
} from "@/components/auth/auth-components";
import { AuthService } from "@/services/auth.service";
import { Eye, EyeOff } from "lucide-react";
import { getErrorMessage } from "@/lib/utils";
import { FormValues } from "@/types/auth.types";

export default function CompleteRegister() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!email) router.replace("/register");
  }, [email, router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>();

  const password = watch("password");

  const onFinish = async (data: FormValues) => {
    setServerError("");
    setLoading(true);

    try {
      const userData = { email: email!, ...data };
      await AuthService.completeRegistration(userData);

      router.push("/dashboard");
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <div className="w-full">
        <h1 className="text-xl font-semibold text-[#f0f6fc] mb-1">
          Complete your profile
        </h1>
        <p className="text-sm text-[#8b949e] mb-8">
          Enter your details and set a secure password.
        </p>

        <form onSubmit={handleSubmit(onFinish)} className="w-full space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#c9d1d9]">
                First name
              </label>
              <AuthInput
                placeholder="Stephanie"
                {...register("firstName", { required: "Required" })}
                disabled={loading}
              />
              {errors.firstName && (
                <span className="text-[11px] text-red-400">
                  {errors.firstName.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#c9d1d9]">
                Last name
              </label>
              <AuthInput
                placeholder="Osei"
                {...register("lastName")}
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#c9d1d9]">
              Password
            </label>
            <div className="relative group">
              <AuthInput
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pr-10" // Make room for the icon
                {...register("password", { required: "Required" })}
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

          {/* Confirm Password Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#c9d1d9]">
              Confirm password
            </label>
            <div className="relative group">
              <AuthInput
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pr-10"
                {...register("confirmPassword", {
                  required: "Required",
                  validate: (v) => v === password || "Passwords don't match",
                })}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484f58] hover:text-[#8b949e] transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="text-[11px] text-red-400">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          {serverError && <ServerError message={serverError} />}

          <div className="pt-2">
            <PrimaryButton type="submit" loading={loading}>
              Create Account
            </PrimaryButton>
          </div>
        </form>
      </div>
    </AuthCard>
  );
}

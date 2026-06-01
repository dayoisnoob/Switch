"use client";

import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import { useResetPassword } from "@/hooks/useAuth";
import { CheckCircle2, Eye, EyeOff, Loader2, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

type ResetFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutateAsync: resetPassword, isPending } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async (data: ResetFormValues) => {
    try {
      await resetPassword(data);
      setIsSuccess(true);
    } catch (error) {
      console.error("Reset failed", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] p-4 font-sans text-white selection:bg-[#7C6EF5]/30">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#7C6EF5] flex items-center justify-center text-white text-lg font-black shadow-lg shadow-[#7C6EF5]/20">
          <Image
            src="/logo.svg"
            alt="Switch Logo"
            width={32}
            height={32}
            priority
          />
        </div>
        <span className="text-2xl font-bold tracking-tight text-white/90">
          Switch
        </span>
      </div>

      <div className="w-full max-w-md bg-[#13131A] border border-white/5 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {!token ? (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
              <XCircle className="text-rose-500" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-white/90 tracking-tight mb-2">
              Invalid Link
            </h1>
            <p className="text-[13px] text-white/40 mb-6">
              This password reset link is missing or invalid. Please request a
              new one.
            </p>
            <Link
              href="/forgot-password"
              className="w-full h-11 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl text-[14px] font-semibold transition-all flex items-center justify-center"
            >
              Request new link
            </Link>
          </div>
        ) : isSuccess ? (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="text-emerald-500" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-white/90 tracking-tight mb-2">
              Password updated
            </h1>
            <p className="text-[13px] text-white/40 mb-6">
              Your password has been successfully reset. You can now use your
              new password to sign in.
            </p>
            <Link
              href="/login/email"
              className="w-full h-11 bg-[#7C6EF5] hover:bg-[#6B5ED4] text-white rounded-xl text-[14px] font-semibold transition-all shadow-lg shadow-[#7C6EF5]/20 active:scale-[0.98] flex items-center justify-center"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white/90 tracking-tight mb-2">
                Set new password
              </h1>
              <p className="text-[13px] text-white/40">
                Please enter your new password below.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-white/60 pl-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    {...register("newPassword")}
                    type={showPassword ? "text" : "password"}
                    autoFocus
                    placeholder="••••••••"
                    className="w-full h-11 bg-black/20 border border-white/10 rounded-xl pl-4 pr-10 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#7C6EF5]/50 focus:ring-4 focus:ring-[#7C6EF5]/10 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-[11px] text-rose-400 pl-1">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-white/60 pl-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    {...register("confirmNewPassword")}
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full h-11 bg-black/20 border border-white/10 rounded-xl pl-4 pr-10 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#7C6EF5]/50 focus:ring-4 focus:ring-[#7C6EF5]/10 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmNewPassword && (
                  <p className="text-[11px] text-rose-400 pl-1">
                    {errors.confirmNewPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full h-11 mt-4 bg-[#7C6EF5] hover:bg-[#6B5ED4] disabled:bg-[#7C6EF5]/50 text-white rounded-xl text-[14px] font-semibold transition-all shadow-lg shadow-[#7C6EF5]/20 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset password"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

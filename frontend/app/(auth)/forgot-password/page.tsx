"use client";

import { useForgotPassword } from "@/hooks/useAuth";
import { ChevronLeft, Loader2, MailCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface ForgotPasswordRequest {
  email: string;
}

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate: sendPasswordResetEmail, isPending } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordRequest>();

  const onSubmit = async (data: ForgotPasswordRequest) => {
    sendPasswordResetEmail(data.email);
    setIsSuccess(true);
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
        <div className="mb-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-white/40 hover:text-white transition-colors mb-6"
          >
            <ChevronLeft size={16} />
            Back to login
          </Link>

          {!isSuccess ? (
            <>
              <h1 className="text-2xl font-bold text-white/90 tracking-tight mb-2">
                Reset your password
              </h1>
              <p className="text-[13px] text-white/40">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-12 h-12 rounded-full bg-[#7C6EF5]/10 flex items-center justify-center mb-4">
                <MailCheck className="text-[#7C6EF5]" size={24} />
              </div>
              <h1 className="text-2xl font-bold text-white/90 tracking-tight mb-2">
                Check your email
              </h1>
              <p className="text-[13px] text-white/40">
                We'll send a password reset link to your email address if it
                exists. The link will expire in 15 minutes.
              </p>
            </div>
          )}
        </div>

        {!isSuccess && (
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-white/60 pl-1">
                Email address
              </label>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                type="email"
                autoFocus
                placeholder="you@company.com"
                className="w-full h-11 bg-black/20 border border-white/10 rounded-xl px-4 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#7C6EF5]/50 focus:ring-4 focus:ring-[#7C6EF5]/10 transition-all shadow-inner"
              />
              {errors.email && (
                <p className="text-[11px] text-rose-400 pl-1">
                  {errors.email.message}
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
                  Sending link...
                </>
              ) : (
                "Send reset link"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

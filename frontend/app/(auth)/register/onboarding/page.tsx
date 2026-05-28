"use client";

import { useCompleteReg } from "@/hooks/useAuth";
import { useAcceptInvite } from "@/hooks/useInvitations";
import { ArrowRight, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export interface FormValues {
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}

export default function CompleteRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutate: acceptInvite, isPending: isAccepting } = useAcceptInvite();

  const {
    mutate: completeRegistration,
    isPending,
    isSuccess,
  } = useCompleteReg();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>();

  const password = watch("password");

  useEffect(() => {
    if (!email) router.replace("/register");
  }, [email, router]);

  const onFinish = (data: FormValues) => {
    if (!email) return;
    const userData = { email, ...data };
    completeRegistration(userData, {
      onSuccess: () => {
        const inviteToken = searchParams.get("inviteToken");

        if (inviteToken) {
          acceptInvite(inviteToken, {
            onSuccess: (workspaceSlug) => {
              toast.info("Invitation accepted");
              router.push(`/${workspaceSlug || "dashboard"}`);
            },
            onError: () => {
              router.push("/getting-started");
            },
          });
        } else {
          router.push("/getting-started");
        }
      },
    });
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] p-4 font-sans text-white selection:bg-[#7C6EF5]/30">
      <div className="flex items-center gap-3 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-10 h-10 rounded-xl bg-[#7C6EF5] flex items-center justify-center text-white text-lg font-black shadow-lg shadow-[#7C6EF5]/20">
          S
        </div>
        <span className="text-2xl font-bold tracking-tight text-white/90">
          Switch
        </span>
      </div>

      <div className="w-full max-w-105 bg-[#13131A] border border-white/5 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-500 ">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#00D287] flex items-center justify-center shadow-sm">
              <Check size={14} strokeWidth={3} className="text-[#13131A]" />
            </div>
            <span className="text-[12px] font-bold text-[#00D287]">Email</span>
          </div>

          <div className="flex-1 h-px bg-[#00D287]/30 mx-3"></div>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#00D287] flex items-center justify-center shadow-sm">
              <Check size={14} strokeWidth={3} className="text-[#13131A]" />
            </div>
            <span className="text-[12px] font-bold text-[#00D287]">Verify</span>
          </div>

          <div className="flex-1 h-px bg-[#00D287]/30 mx-3"></div>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#7C6EF5] flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
              3
            </div>
            <span className="text-[12px] font-bold text-white/90">Profile</span>
          </div>
        </div>

        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-full bg-[#00D287]/10 border-2 border-[#00D287]/20 flex items-center justify-center mb-4">
            <Check size={24} strokeWidth={3} className="text-[#00D287]" />
          </div>
          <h1 className="text-xl font-bold text-white/90 tracking-tight mb-2">
            Email verified!
          </h1>
          <p className="text-[13px] text-white/40">
            One last step — set up your profile.
          </p>
        </div>

        <form onSubmit={handleSubmit(onFinish)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-white/60 pl-1 flex items-center gap-1">
              Full name
              <span className="text-[#7C6EF5] text-lg leading-none">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input
                  {...register("firstName", {
                    required: "First name required",
                  })}
                  type="text"
                  placeholder="First name"
                  className="w-full h-11 bg-black/20 border border-white/10 rounded-xl px-4 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#7C6EF5]/50 focus:ring-4 focus:ring-[#7C6EF5]/10 transition-all shadow-inner"
                />
                {errors.firstName && (
                  <p className="absolute -bottom-4 left-1 text-[10px] text-rose-400">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  {...register("lastName")}
                  type="text"
                  placeholder="Last name"
                  className="w-full h-11 bg-black/20 border border-white/10 rounded-xl px-4 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#7C6EF5]/50 focus:ring-4 focus:ring-[#7C6EF5]/10 transition-all shadow-inner"
                />
              </div>
            </div>
          </div>
          <div className="h-2"></div>{" "}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-white/60 pl-1 flex items-center gap-1">
              Password
              <span className="text-[#7C6EF5] text-lg leading-none">*</span>
            </label>
            <div className="relative">
              <input
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Must be at least 8 characters",
                  },
                })}
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
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
            {errors.password && (
              <p className="text-[11px] text-rose-400 pl-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-white/60 pl-1 flex items-center gap-1">
              Confirm password
              <span className="text-[#7C6EF5] text-lg leading-none">*</span>
            </label>
            <div className="relative">
              <input
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (v) => v === password || "Passwords do not match",
                })}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repeat your password"
                className="w-full h-11 bg-black/20 border border-white/10 rounded-xl pl-4 pr-10 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#7C6EF5]/50 focus:ring-4 focus:ring-[#7C6EF5]/10 transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[11px] text-rose-400 pl-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isPending || isSuccess || isAccepting}
            className="w-full h-11 mt-6 bg-[#7C6EF5] hover:bg-[#6B5ED4] disabled:bg-[#7C6EF5]/50 text-white rounded-xl text-[14px] font-semibold transition-all shadow-lg shadow-[#7C6EF5]/20 active:scale-[0.98] flex items-center justify-center gap-2 group"
          >
            {isPending || isSuccess ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {isSuccess ? "Redirecting..." : "Creating account..."}
              </>
            ) : (
              <>
                Create account
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-6 text-center animate-in fade-in duration-500 ">
        <p className="text-[12px] text-white/30">
          By creating an account you agree to our{" "}
          <Link
            href="/terms"
            className="text-[#7C6EF5] hover:text-[#B8B0FF] transition-colors"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-[#7C6EF5] hover:text-[#B8B0FF] transition-colors"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}

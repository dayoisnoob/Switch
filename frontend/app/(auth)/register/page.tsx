"use client";

import { GithubIcon, GoogleIcon } from "@/components/auth/auth-components";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import { useInitialiseReg, useMe } from "@/hooks/useAuth";
import { ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface SignupInitiateRequest {
  email: string;
}

function SignupContent() {
  const router = useRouter();
  const { data: user, isLoading } = useMe();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("inviteToken");

  const [isRedirecting, setIsRedirecting] = useState(false);
  const { mutate: sendOtp, isPending, isSuccess } = useInitialiseReg();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInitiateRequest>();

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (isLoading || user) {
    return <FullScreenLoader />;
  }

  const handleSignup = async (data: SignupInitiateRequest) => {
    sendOtp({ email: data.email, token: inviteToken || "" });
  };

  const handleSocialAuth = (provider: "google" | "github") => {
    setIsRedirecting(true);
    const state = inviteToken ? `inviteToken=${inviteToken}` : "";
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}${state ? `?state=${encodeURIComponent(state)}` : ""}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] p-4 font-sans text-white selection:bg-[#7C6EF5]/30">
      <div className="flex items-center gap-3 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

      <div className="w-full max-w-105 bg-[#13131A] border border-white/5 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-500 ">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#7C6EF5] flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
              1
            </div>
            <span className="text-[12px] font-bold text-white/90">Email</span>
          </div>

          <div className="flex-1 h-px bg-white/10 mx-3"></div>

          <div className="flex items-center gap-2 opacity-40">
            <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-[11px] font-bold text-white">
              2
            </div>
            <span className="text-[12px] font-medium text-white">Verify</span>
          </div>

          <div className="flex-1 h-px bg-white/10 mx-3"></div>

          <div className="flex items-center gap-2 opacity-40">
            <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-[11px] font-bold text-white">
              3
            </div>
            <span className="text-[12px] font-medium text-white">Profile</span>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white/90 tracking-tight mb-2">
            Create your account
          </h1>
          <p className="text-[13px] text-white/40 leading-relaxed">
            Start with your work email address. We'll send a verification code.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleSocialAuth("google")}
            disabled={isRedirecting || isPending || isSuccess}
            className="w-full h-11 flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[14px] font-medium text-white/80 transition-all group"
          >
            <GoogleIcon />
            Sign up with Google
          </button>

          <button
            onClick={() => handleSocialAuth("github")}
            disabled={isRedirecting || isPending || isSuccess}
            className="w-full h-11 flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[14px] font-medium text-white/80 transition-all group"
          >
            <GithubIcon />
            Sign up with GitHub
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-white/5"></div>
          <span className="text-[12px] font-medium text-white/30 tracking-wide">
            or use email
          </span>
          <div className="flex-1 h-px bg-white/5"></div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(handleSignup)}>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-white/60 pl-1 flex items-center gap-1">
              Work email
              <span className="text-[#7C6EF5] text-lg leading-none">*</span>
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
              placeholder="you@company.com"
              className="w-full h-11 bg-black/20 border border-white/10 rounded-xl px-4 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#7C6EF5]/50 focus:ring-4 focus:ring-[#7C6EF5]/10 transition-all shadow-inner"
            />
            {errors.email ? (
              <p className="text-[11px] text-rose-400 pl-1">
                {errors.email.message}
              </p>
            ) : (
              <p className="text-[11px] text-white/30 pl-1 pt-0.5">
                We'll send a 6-digit code to verify this address.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending || isSuccess}
            className="w-full h-11 mt-4 bg-[#7C6EF5] hover:bg-[#6B5ED4] disabled:bg-[#7C6EF5]/50 text-white rounded-xl text-[14px] font-semibold transition-all shadow-lg shadow-[#7C6EF5]/20 active:scale-[0.98] flex items-center justify-center gap-2 group"
          >
            {isPending || isSuccess ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {isSuccess ? "Redirecting..." : "Sending code..."}{" "}
              </>
            ) : (
              <>
                Continue
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-8 animate-in fade-in duration-500">
        <p className="text-[13px] text-white/40">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#7C6EF5] hover:text-[#B8B0FF] font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <SignupContent />
    </Suspense>
  );
}

"use client";

import { GithubIcon, GoogleIcon } from "@/components/auth/auth-components";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import { useMe } from "@/hooks/useAuth";
import { Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { data: user, isLoading } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (isLoading || user) {
    return <FullScreenLoader />;
  }

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
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white/90 tracking-tight mb-2">
            Welcome back
          </h1>
          <p className="text-[13px] text-white/40">
            Choose a sign-in method to continue.
          </p>
        </div>

        <div className="space-y-3 mb-2">
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
            className="w-full h-11 flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[14px] font-medium text-white/80 transition-all group"
          >
            <GoogleIcon />
            Continue with Google
          </a>

          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/auth/github`}
            className="w-full h-11 flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[14px] font-medium text-white/80 transition-all group"
          >
            <GithubIcon />
            Continue with GitHub
          </a>

          <div className="flex items-center gap-3 py-3">
            <div className="flex-1 h-px bg-white/5"></div>
            <span className="text-[12px] font-medium text-white/30 tracking-wide">
              or
            </span>
            <div className="flex-1 h-px bg-white/5"></div>
          </div>

          <Link
            href="/login/email"
            className="w-full h-11 flex items-center justify-center gap-3 bg-white/2 hover:bg-white/5 border border-white/5 rounded-xl text-[14px] font-medium text-white/80 transition-all group"
          >
            <Mail
              size={16}
              className="text-white/50 group-hover:text-white/80 transition-colors"
            />
            Continue with Email
          </Link>
        </div>
      </div>

      <div className="mt-8 animate-in fade-in duration-500">
        <p className="text-[13px] text-white/40">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-white/80 hover:text-white font-medium transition-colors"
          >
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import {
  AuthCard,
  AuthDivider,
  GithubIcon,
  GoogleIcon,
  SocialButton,
} from "@/components/auth/auth-components";
import { Mail } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleSocialAuth = (provider: "google" | "github") => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}`;
  };

  return (
    <AuthCard>
      <div className="w-full">
        <h1 className="text-xl font-semibold text-[#f0f6fc] mb-1">
          Sign in to Switch
        </h1>
        <p className="text-sm text-[#8b949e] mb-8">
          Welcome back. Select a method to continue.
        </p>

        <div className="w-full space-y-2">
          <SocialButton
            icon={GoogleIcon}
            onClick={() => handleSocialAuth("google")}
          >
            Sign in with Google
          </SocialButton>

          <SocialButton
            icon={GithubIcon}
            onClick={() => handleSocialAuth("github")}
          >
            Sign in with GitHub
          </SocialButton>

          <AuthDivider />

          <SocialButton
            icon={Mail}
            onClick={() => (window.location.href = "/login/email")}
          >
            Sign in with Email
          </SocialButton>
        </div>

        <div className="mt-8 pt-6 border-t border-[#30363d] text-center">
          <p className="text-sm text-[#8b949e]">
            Don&apos;t have an account?{" "}
            <a
              href="/register"
              className="text-[#58a6ff] hover:underline font-medium"
            >
              Create one
            </a>
          </p>
        </div>
      </div>
    </AuthCard>
  );
}

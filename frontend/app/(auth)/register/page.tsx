"use client";

import {
  AuthCard,
  SocialButton,
  AuthFooter,
  GoogleIcon,
  GithubIcon,
  AuthDivider,
} from "@/components/auth/auth-components";

import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailSubmit = async () => {
    setLoading(true);
    router.push("/register/initialise");
  };

  const handleSocialAuth = (provider: "google" | "github") => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}`;
  };

  return (
    <AuthCard>
      <div className="flex-column justify-center text-center">
        <h1 className="text-[32px] font-bold mb-3 font-display tracking-tight text-white">
          Sign up for Switch
        </h1>

        <p className="text-[#a7a7a7] text-center mb-10 px-10 text-[15px] leading-snug">
          The minimal Kanban board for focused teams.
        </p>
      </div>

      <div className="w-full ">
        <SocialButton
          icon={GoogleIcon}
          onClick={() => handleSocialAuth("google")}
        >
          Continue with Google
        </SocialButton>

        <SocialButton
          icon={GithubIcon}
          onClick={() => handleSocialAuth("github")}
        >
          Continue with GitHub
        </SocialButton>

        <AuthDivider />

        <SocialButton
          icon={Mail}
          onClick={handleEmailSubmit}
          disabled={loading}
        >
          Continue with Email
        </SocialButton>
      </div>

      <AuthFooter />
    </AuthCard>
  );
}

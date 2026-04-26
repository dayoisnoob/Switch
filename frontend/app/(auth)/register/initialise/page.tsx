"use client";

import {
  AuthCard,
  AuthInput,
  PrimaryButton,
  ServerError,
} from "@/components/auth/auth-components";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function InitRegister() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const setUserMail = useAuthStore((s) => s.setUserMail);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setError("");
    setLoading(true);

    try {
      const res = await AuthService.initialiseRegistration(email);
      setUserMail(email);

      router.push(
        `/register/verify?email=${encodeURIComponent(email)}&status=${res.status}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <div className="w-full flex justify-start mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-[#a7a7a7] hover:text-white transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="w-full px-8">
        <h1 className="text-[24px] font-bold mb-2 text-white">
          Enter email address
        </h1>

        <p className="text-[#a7a7a7] text-[15px] mb-8 leading-snug">
          We&apos;ll send a code to your email to verify your account.
        </p>

        <form onSubmit={handleEmailSubmit} className="w-full space-y-4">
          <AuthInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            autoFocus
            disabled={loading}
          />

          {error && <ServerError message={error} />}

          <PrimaryButton
            type="submit"
            loading={loading}
            disabled={loading || !email}
          >
            Send OTP
          </PrimaryButton>
        </form>
      </div>
    </AuthCard>
  );
}

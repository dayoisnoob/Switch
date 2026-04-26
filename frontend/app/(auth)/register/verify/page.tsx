"use client";

import {
  AuthCard,
  PrimaryButton,
  ServerError,
} from "@/components/auth/auth-components";
import { api } from "@/lib/api";
import { cn, getErrorMessage } from "@/lib/utils";
import { AuthService } from "@/services/auth.service";
import { ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function VerifyPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(30);

  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const status = searchParams.get("status");

  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);

  const OTP_LENGTH = 6;

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    if (!email) router.replace("/register");
    if (otp.length === OTP_LENGTH) {
      handleVerify();
    }
  }, [email, otp, router]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otp.length < OTP_LENGTH || loading || !email) return;

    setError("");
    setLoading(true);

    try {
      await AuthService.verifyLoginOtp(email, otp);
      router.push(`/register/onboarding?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(getErrorMessage(err));
      setOtp("");
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || !email || resending) return;

    setError("");
    setResending(true);

    try {
      await AuthService.resendOtp(email);
      setTimer(60);
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setResending(false);
  };

  return (
    <AuthCard>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-[#8b949e] hover:text-[#c9d1d9] transition-colors mb-6 text-sm"
      >
        <ChevronLeft size={16} />
        Back
      </button>

      <div className="w-full">
        <h1 className="text-xl font-semibold text-[#f0f6fc] mb-1">
          {status === "resuming_registration"
            ? "Welcome back, let's finish your setup"
            : "Verify email"}
        </h1>
        <p className="text-sm text-[#8b949e] mb-8">
          Enter the 6-digit code sent to {email}.
        </p>

        <div className="relative w-full mb-6">
          <input
            ref={inputRef}
            type="text"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))
            }
            className="absolute inset-0 opacity-0 cursor-default"
            autoFocus
          />

          <div
            className="flex justify-between gap-2"
            onClick={() => inputRef.current?.focus()}
          >
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 h-12 flex items-center justify-center text-lg font-medium border border-[#30363d] rounded-md transition-colors",
                  otp.length === i && "border-[#58a6ff] ring-1 ring-[#58a6ff]",
                  otp[i] ? "text-[#f0f6fc]" : "text-[#484f58]",
                )}
              >
                {otp[i] || ""}
              </div>
            ))}
          </div>
        </div>

        {error && <ServerError message={error} />}

        <PrimaryButton
          onClick={() => handleVerify()}
          loading={loading}
          disabled={otp.length < OTP_LENGTH || loading || resending}
        >
          Verify
        </PrimaryButton>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#8b949e]">
            Didn&apos;t receive a code?{" "}
            {timer > 0 ? (
              <span className="text-[#484f58]">Wait {timer}s</span>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-[#58a6ff] hover:underline font-medium disabled:opacity-50"
              >
                {resending ? "Sending..." : "Resend"}
              </button>
            )}
          </p>
        </div>
      </div>
    </AuthCard>
  );
}

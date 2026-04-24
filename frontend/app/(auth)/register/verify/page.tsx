"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { AuthCard, PrimaryButton } from "@/components/auth/auth-components";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

export default function VerifyPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const email = useAuthStore((s) => s.email);

  const inputRef = useRef<HTMLInputElement>(null);

  const OTP_LENGTH = 6;

  useEffect(() => {
    if (!email) router.push("/login");
    if (otp.length === OTP_LENGTH) {
      handleVerify();
    }
  }, [otp]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otp.length < OTP_LENGTH || loading) return;

    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register/verify-otp", { email, code: otp });
      router.push("/register/complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setOtp("");
      inputRef.current?.focus();
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

      <div className="w-full">
        <h1 className="text-[24px] font-bold mb-2 text-white font-display">
          Verify your email
        </h1>
        <p className="text-[#a7a7a7] text-[15px] mb-8 leading-snug">
          Enter the code sent to{" "}
          <span className="text-white font-medium">{email}</span>.
        </p>

        <div className="relative w-full mb-8">
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
                  "flex-1 h-13.5 flex items-center justify-center text-[24px] font-bold border-b-2 transition-all duration-200",
                  otp.length === i ? "border-white" : "border-white/10",
                  otp[i] ? "text-white" : "text-white/20",
                )}
              >
                {otp[i] || ""}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-500 font-medium text-center mb-6 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}

        {/* <PrimaryButton
          onClick={() => handleVerify()}
          loading={loading}
          disabled={otp.length < OTP_LENGTH || loading}
        >
          Verify
        </PrimaryButton> */}

        <p className="text-[13px] text-[#757575] mt-8 text-center">
          Didn&apos;t get a code?{" "}
          <button className="text-white font-bold hover:underline">
            Resend
          </button>
        </p>
      </div>
    </AuthCard>
  );
}

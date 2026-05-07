"use client";

import { useResendOtp, useVerifyReg } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, ChevronLeft, Loader2, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(30);

  const {
    mutate: verifyOtp,
    isPending: isVerifying,
    isSuccess,
  } = useVerifyReg();
  const { mutate: resendOtp, isPending: isResending } = useResendOtp();

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── TIMER LOGIC ──
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    if (!email) router.replace("/register");
  }, [email, router]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)
      .split("");
    if (pastedData.length === 0) return;

    const newCode = [...code];
    pastedData.forEach((char, i) => {
      if (i < 6) newCode[i] = char;
    });
    setCode(newCode);
    setError("");

    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");

    if (fullCode.length !== 6 || isVerifying || !email) return;
    setError("");

    verifyOtp(
      { email, code: fullCode },
      {
        onError: (err: any) => {
          setError(
            err?.response?.data?.message || "Invalid verification code.",
          );
          setCode(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
        },
      },
    );
  };

  const handleResend = async () => {
    if (timer > 0 || !email || isResending) return;

    resendOtp(email, {
      onSuccess: () => {
        setTimer(60);
      },
    });
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] p-4 font-sans text-white selection:bg-[#7C6EF5]/30">
      {/* ── LOGO & BRANDING ── */}
      <div className="flex items-center gap-3 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-10 h-10 rounded-xl bg-[#7C6EF5] flex items-center justify-center text-white text-lg font-black shadow-lg shadow-[#7C6EF5]/20">
          S
        </div>
        <span className="text-2xl font-bold tracking-tight text-white/90">
          Switch
        </span>
      </div>

      {/* ── MAIN CARD ── */}
      <div className="w-full max-w-105 bg-[#13131A] border border-white/5 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        {/* ── STEPPER ── */}
        <div className="flex items-center justify-between mb-8">
          {/* Step 1: Success */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#00D287] flex items-center justify-center shadow-sm">
              <Check size={14} strokeWidth={3} className="text-[#13131A]" />
            </div>
            <span className="text-[12px] font-bold text-[#00D287]">Email</span>
          </div>

          <div className="flex-1 h-px bg-[#00D287]/30 mx-3"></div>

          {/* Step 2: Active */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#7C6EF5] flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
              2
            </div>
            <span className="text-[12px] font-bold text-white/90">Verify</span>
          </div>

          <div className="flex-1 h-px bg-white/10 mx-3"></div>

          {/* Step 3: Inactive */}
          <div className="flex items-center gap-2 opacity-40">
            <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-[11px] font-bold text-white">
              3
            </div>
            <span className="text-[12px] font-medium text-white">Profile</span>
          </div>
        </div>

        {/* ── HEADER & INFO BOX ── */}
        <h1 className="text-2xl font-bold text-white/90 tracking-tight mb-6">
          Check your inbox
        </h1>

        <div className="w-full bg-white/2 border border-white/5 rounded-xl p-4 flex items-center gap-4 mb-8">
          <Mail size={20} className="text-[#7C6EF5]" />
          <div className="flex flex-col">
            <span className="text-[14px] font-semibold text-white/90 truncate max-w-70">
              {email}
            </span>
            <span className="text-[12px] text-white/40">
              6-digit code sent - expires in 10 min
            </span>
          </div>
        </div>

        {/* ── OTP FORM ── */}
        <form onSubmit={handleVerify} className="flex flex-col items-center">
          <div className="w-full flex justify-between gap-2 mb-3">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) =>
                  handleChange(index, e.target.value.replace(/\D/g, ""))
                }
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={cn(
                  "w-full aspect-square bg-black/20 border border-white/10 rounded-xl text-center text-xl font-bold text-white focus:outline-none focus:border-[#7C6EF5]/50 focus:ring-4 focus:ring-[#7C6EF5]/10 transition-all shadow-inner",
                  error &&
                    "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/10",
                )}
              />
            ))}
          </div>

          <p className="text-[12px] text-white/30 text-center mb-6">
            Enter the 6-digit code from your email
          </p>

          {error && (
            <p className="text-[13px] text-rose-400 mb-4 font-medium text-center bg-rose-500/10 py-2 px-4 rounded-lg w-full border border-rose-500/20">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={code.join("").length !== 6 || isVerifying || isSuccess}
            className="w-full h-11 bg-[#2C1D42] hover:bg-[#3D295C] disabled:bg-[#2C1D42]/50 disabled:cursor-not-allowed text-[#B8B0FF] disabled:text-[#B8B0FF]/50 rounded-xl text-[14px] font-semibold transition-all flex items-center justify-center gap-2 group"
          >
            {isVerifying || isSuccess ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {isSuccess ? "Redirecting..." : "Verifying..."}{" "}
              </>
            ) : (
              <>
                Verify code
                <ChevronDown size={16} className="text-[#B8B0FF]/70" />
              </>
            )}
          </button>
        </form>

        {/* ── FOOTER ACTIONS ── */}
        <div className="mt-8 flex flex-col items-center gap-5">
          <p className="text-[13px] text-white/40">
            Didn't get it?{" "}
            {timer > 0 ? (
              <span className="text-white/30 ml-1">Wait {timer}s</span>
            ) : (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-[#7C6EF5] hover:text-[#B8B0FF] font-medium transition-colors ml-1 disabled:opacity-50"
              >
                {isResending ? "Sending..." : "Resend code"}{" "}
              </button>
            )}
          </p>

          <button
            onClick={() => router.back()}
            type="button"
            className="text-[13px] font-medium text-white/30 hover:text-white/70 transition-colors flex items-center gap-1.5"
          >
            <ChevronLeft size={14} />
            Change email
          </button>
        </div>
      </div>
    </div>
  );
}

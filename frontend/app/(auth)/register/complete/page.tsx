"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AuthCard,
  AuthInput,
  PrimaryButton,
} from "@/components/auth/auth-components";
import { api } from "@/lib/api";

export default function CompleteRegister() {
  const [formData, setFormData] = useState({ firstName: "", lastName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Logic: PATCH /auth/register/complete { firstName, lastName }
      await api.patch("/auth/register/complete", formData);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <div className="w-full px-8 py-10">
        <h1 className="text-[24px] font-bold mb-2 text-white font-display">
          About you
        </h1>
        <p className="text-[#a7a7a7] text-[15px] mb-8 leading-snug">
          Set up your profile to start using Switch.
        </p>

        <form onSubmit={handleFinish} className="w-full space-y-4">
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-[#555] uppercase tracking-wider ml-1">
              First Name
            </label>
            <AuthInput
              placeholder="e.g. Stephanie"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-[#555] uppercase tracking-wider ml-1">
              Last Name
            </label>
            <AuthInput
              placeholder="e.g. Osei"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              required
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1">
              {error}
            </p>
          )}

          <div className="pt-2">
            <PrimaryButton
              type="submit"
              loading={loading}
              disabled={!formData.firstName || loading}
            >
              Finish
            </PrimaryButton>
          </div>
        </form>
      </div>
    </AuthCard>
  );
}

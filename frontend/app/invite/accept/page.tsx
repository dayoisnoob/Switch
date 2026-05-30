"use client";

import { useMe } from "@/hooks/useAuth";
import { useAcceptInvite, useVerifyInvite } from "@/hooks/useInvitations";
import { ArrowRight, Loader2, MailOpen, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { data: currentUser } = useMe();

  const {
    data: inviteDetails,
    isLoading: isVerifying,
    isError: isVerifyError,
    error: verifyError,
  } = useVerifyInvite(token);

  const { mutate: acceptInvite, isPending: isAccepting } = useAcceptInvite();

  useEffect(() => {
    if (!token || !inviteDetails || !currentUser || isAccepting) return;

    acceptInvite(token, {
      onSuccess: (data) => {
        if (data?.requiresRegistration) {
          router.push(
            `/register?email=${encodeURIComponent(inviteDetails.email)}&inviteToken=${token}`,
          );
        } else if (data?.requiresLogin) {
          router.push(
            `/login?returnUrl=${encodeURIComponent(`/invite/accept?token=${token}`)}`,
          );
        } else {
          router.push(`/${inviteDetails.workspaceSlug || "dashboard"}`);
        }
      },
    });
  }, [currentUser, inviteDetails, token]);

  useEffect(() => {
    if (!token) router.replace("/dashboard");
  }, [token, router]);

  const handleAccept = () => {
    if (!token || !inviteDetails) return;

    acceptInvite(token, {
      onSuccess: (data) => {
        if (data?.requiresRegistration) {
          router.push(
            `/register?email=${encodeURIComponent(inviteDetails.email)}&inviteToken=${token}`,
          );
        } else if (data?.requiresLogin) {
          router.push(
            `/login?returnUrl=${encodeURIComponent(`/invite/${token}`)}`,
          );
        } else {
          router.push(`/${inviteDetails.workspaceSlug || "dashboard"}`);
        }
      },
    });
  };

  if (!token) return null;

  return (
    <>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#7C6EF5] flex items-center justify-center text-white text-lg font-black shadow-lg shadow-[#7C6EF5]/20">
          S
        </div>
        <span className="text-2xl font-bold tracking-tight text-white/90">
          Switch
        </span>
      </div>

      {isVerifying && (
        <div className="flex flex-col items-center animate-in fade-in duration-300">
          <Loader2 size={32} className="animate-spin text-[#7C6EF5] mb-4" />
          <p className="text-white/60 text-sm font-medium">
            Verifying invitation...
          </p>
        </div>
      )}

      {isVerifyError && (
        <div className="w-full max-w-105 bg-[#13131A] border border-red-500/20 rounded-2xl p-8 text-center animate-in zoom-in-95 duration-300">
          <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white/90 mb-2">
            Invalid Invitation
          </h1>
          <p className="text-[13px] text-white/40 mb-6">
            {(verifyError as any)?.response?.data?.message ||
              "This invitation link is invalid or has expired."}
          </p>
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-[#7C6EF5] hover:text-white transition-colors"
          >
            Return to login
          </button>
        </div>
      )}

      {!isVerifying && !isVerifyError && inviteDetails && (
        <div className="w-full max-w-105 bg-[#13131A] border border-white/5 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative">
              <MailOpen size={28} className="text-[#7C6EF5]" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#00D287] border-2 border-[#13131A]"></div>
            </div>

            <h1 className="text-2xl font-bold text-white/90 tracking-tight mb-2">
              Workspace Invitation
            </h1>

            <p className="text-[13px] text-white/40 leading-relaxed">
              <strong className="text-white/90 font-semibold">
                {inviteDetails.inviterName || "Someone"}
              </strong>{" "}
              has invited you to join{" "}
              <strong className="text-white/90 font-semibold">
                {inviteDetails.workspaceName}
              </strong>{" "}
              on Switch.
            </p>
          </div>

          <button
            onClick={handleAccept}
            disabled={isAccepting}
            className="w-full h-11 bg-[#7C6EF5] hover:bg-[#6B5ED4] disabled:bg-[#7C6EF5]/50 text-white rounded-xl text-[14px] font-semibold transition-all shadow-lg shadow-[#7C6EF5]/20 active:scale-[0.98] flex items-center justify-center gap-2 group"
          >
            {isAccepting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Accepting...
              </>
            ) : (
              <>
                Accept Invitation{" "}
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-[13px] font-medium text-white/30 hover:text-white/70 transition-colors"
            >
              Decline and return to dashboard
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function AcceptInvitePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] p-4 font-sans text-white selection:bg-[#7C6EF5]/30">
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#7C6EF5] animate-spin" />
          </div>
        }
      >
        <AcceptInviteContent />
      </Suspense>
    </div>
  );
}

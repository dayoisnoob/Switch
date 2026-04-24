import {
  AuthCard,
  SocialButton,
  AuthFooter,
  GoogleIcon,
  GithubIcon,
  Mail,
} from "@/components/auth/auth-components";

export default function RegisterPage() {
  return (
    <AuthCard>
      <h1 className="text-[32px] font-bold mb-3 font-display tracking-tight text-white">
        Sign up for Switch
      </h1>

      <p className="text-[#a7a7a7] text-center mb-10 px-10 text-[15px] leading-snug">
        The minimal Kanban board for focused teams.
      </p>

      <div className="w-full px-8">
        <SocialButton icon={Mail}>Use phone or email</SocialButton>

        <SocialButton icon={GoogleIcon}>Continue with Google</SocialButton>

        <SocialButton icon={GithubIcon}>Continue with GitHub</SocialButton>
      </div>

      <AuthFooter />
    </AuthCard>
  );
}

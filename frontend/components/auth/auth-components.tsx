import { cn } from "@/lib/utils";
import { LucideIcon, Mail } from "lucide-react";

type IconType = LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>;

interface SocialButtonProps {
  icon: IconType;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export const AuthCard = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
    <div className="w-full max-w-110 flex flex-col items-center">
      {children}
    </div>
  </div>
);

export const SocialButton = ({
  icon: Icon,
  children,
  onClick,
  disabled,
}: SocialButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "w-full h-11.5 bg-[#161616] hover:bg-[#1f1f1f]",
      "border border-white/6 transition-all duration-200",
      "flex items-center px-4 mb-2.5 group active:scale-[0.98]",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
    )}
  >
    <div className="w-5 flex justify-center items-center">
      <Icon className="w-4.5 h-4.5 text-white" />
    </div>
    <span className="flex-1 text-center font-semibold text-[14px] text-white">
      {children}
    </span>
  </button>
);

export const AuthFooter = () => (
  <div className="fixed bottom-0 left-0 w-full h-16 border-t border-white/10 flex items-center justify-center bg-black">
    <p className="text-[15px] text-[#a7a7a7]">
      Already have an account?{" "}
      <button className="font-bold text-white hover:underline ml-1 transition-colors">
        Log in
      </button>
    </p>
  </div>
);

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

export { GoogleIcon, GithubIcon, Mail };
// export function AuthLogo() {
//   return (
//     <div className="text-center mb-1">
//       <span className="font-display text-2xl font-bold text-primary tracking-tight">
//         switch<span className="text-accent">.</span>
//       </span>
//     </div>
//   );
// }

// export function AuthSubtitle({ children }: { children: React.ReactNode }) {
//   return <p className="text-xs text-muted text-center mb-6">{children}</p>;
// }

// // Three-dot step progress — done (green), active (accent), upcoming (border)
// export function StepDots({
//   total,
//   current,
// }: {
//   total: number;
//   current: number;
// }) {
//   return (
//     <div className="flex justify-center gap-1.5 mb-5">
//       {Array.from({ length: total }).map((_, i) => (
//         <div
//           key={i}
//           className={cn(
//             "h-0.5 w-5 rounded-full transition-colors duration-300",
//             i < current && "bg-[--success]",
//             i === current && "bg-accent",
//             i > current && "bg-[--border-md]",
//           )}
//         />
//       ))}
//     </div>
//   );
// }

// // Stacked OAuth buttons — used on login and register step 1
// export function OAuthButtons() {
//   return (
//     <div className="flex flex-col gap-3">
//       <a
//         href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
//         className={cn(
//           "flex items-center justify-center gap-2.5 h-10 rounded-lg border border-[--border-md]",
//           "bg-card text-secondary text-sm font-medium",
//           "hover:border-[--border-lg] hover:text-primary transition-colors duration-150",
//         )}
//       >
//         <GoogleIcon />
//         Continue with Google
//       </a>

//       <a
//         href={`${process.env.NEXT_PUBLIC_API_URL}/auth/github`}
//         className={cn(
//           "flex items-center justify-center gap-2.5 h-10 rounded-lg border border-[--border-md]",
//           "bg-card text-secondary text-sm font-medium",
//           "hover:border-[--border-lg] hover:text-primary transition-colors duration-150",
//         )}
//       >
//         <GithubIcon />
//         Continue with GitHub
//       </a>
//     </div>
//   );
// }

// export function Divider() {
//   return (
//     <div className="flex items-center gap-3 my-5">
//       <div className="flex-1 h-px bg-[--border]" />
//       <span className="text-xs font-medium text-muted  tracking-wider">or</span>
//       <div className="flex-1 h-px bg-[--border]" />
//     </div>
//   );
// }

// // ─── Icons ────────────────────────────────────────────────────────────────────

// function GoogleIcon() {
//   return (
//     <svg width="14" height="14" viewBox="0 0 24 24">
//       <path
//         d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//         fill="#4285F4"
//       />
//       <path
//         d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//         fill="#34A853"
//       />
//       <path
//         d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
//         fill="#FBBC05"
//       />
//       <path
//         d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
//         fill="#EA4335"
//       />
//     </svg>
//   );
// }

// function GithubIcon() {
//   return (
//     <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
//       <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
//     </svg>
//   );
// }

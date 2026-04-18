import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { GrGithub } from "react-icons/gr";

export default function LandingPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
            Switch.
          </h1>
          <p className="text-lg text-gray-500">
            The minimal Kanban board for focused teams.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Get started</h2>

          <Link
            href={`${apiUrl}/auth/google`}
            className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 text-white px-4 py-3 rounded-xl font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            <FcGoogle className="text-[24px] rounded-full p-2]" />
            Continue with Google
          </Link>
          <Link
            href={`${apiUrl}/auth/github`}
            className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 text-white px-4 py-3 rounded-xl font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            <GrGithub className="text-[24px] rounded-full p-2]" />
            Continue with Github
          </Link>
        </div>
      </div>
    </div>
  );
}

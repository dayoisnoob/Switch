import Image from "next/image";

export const FullScreenLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-[#0A0A0A]">
    <div className="w-18 h-18 rounded-xl shadow-[0_0_25px_rgba(124,110,245,0.3)] flex items-center justify-center shrink-0 overflow-hidden animate-pulse">
      <Image
        src="/logo.svg"
        alt="Loading Switch..."
        width={64}
        height={64}
        priority
        className="w-full h-full object-cover"
      />
    </div>
  </div>
);

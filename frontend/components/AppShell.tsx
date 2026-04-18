"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiLayout, FiHome, FiSettings } from "react-icons/fi";

export default function AppShell({
  children,
  workspaceName,
}: {
  children: React.ReactNode;
  workspaceName: string;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* THE SIDEBAR (Responsive) */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-50 border-r border-gray-200 transform transition-transform duration-200 ease-in-out flex flex-col
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <div className="w-6 h-6 bg-gray-900 rounded-md"></div>
            Switch
          </div>
          {/* Close button for mobile only */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-gray-500"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-500 tracking-wider mb-2 uppercase">
            {workspaceName}
          </p>
          <Link
            href="/workspace"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-900 bg-gray-200/50"
          >
            <FiLayout className="text-lg" /> Boards
          </Link>
          <Link
            href="/workspace"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <FiSettings className="text-lg" /> Settings
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header (Only visible on small screens) */}
        <header className="h-14 border-b border-gray-200 bg-white flex items-center px-4 md:hidden flex-shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <FiMenu className="text-2xl" />
          </button>
          <span className="ml-4 font-semibold text-gray-900">Switch</span>
        </header>

        {/* This is where your Pages get injected! */}
        <div className="flex-1 overflow-hidden relative">{children}</div>
      </main>
    </div>
  );
}

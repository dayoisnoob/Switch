"use client";

import CreateWorkspaceModal from "@/components/modals/AddWorkspaceModal";
import Link from "next/link";
import { useState } from "react";

export default function MarketingPage() {
  const [isAddWorkspaceOpen, setIsAddWorkspaceOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-900 rounded-lg"></div>
              <span className="font-bold text-xl tracking-tight text-gray-900">
                Switch
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Log in
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
          Kanban, without the clutter.
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Switch is a minimalist project management tool designed for developers
          who want to write code, not manage tickets.
        </p>
        <button
          onClick={() => setIsAddWorkspaceOpen(true)}
          className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-xl text-white bg-gray-900 hover:bg-gray-800 transition-colors"
        >
          Start building for free
        </button>
      </main>

      <CreateWorkspaceModal
        isOpen={isAddWorkspaceOpen}
        onClose={() => setIsAddWorkspaceOpen(false)}
      />
    </div>
  );
}

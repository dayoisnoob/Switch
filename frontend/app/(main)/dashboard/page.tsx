"use client";

import { useMe } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Plus, Layout, Users, ArrowRight, Search, Clock } from "lucide-react";

export default function DashboardPage() {
  const { data: user } = useMe();
  const recentBoards = [
    {
      id: "1",
      name: "Engineering Roadmap",
      workspace: "Switch Team",
      updated: "2m ago",
    },
    {
      id: "2",
      name: "Design System",
      workspace: "Internal",
      updated: "4h ago",
    },
  ];

  return (
    <div className="max-w-250 mx-auto py-12 px-8">
      <header className="mb-10">
        <h1 className="text-2xl font-bold text-[#f0f6fc] mb-2">
          Welcome back, {user ? user.firstName : ""}
        </h1>
        <p className="text-[#8b949e] text-sm">
          Select a project to continue or create a new board to get started.
        </p>
      </header>

      <div className="relative mb-12 group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#484f58] group-focus-within:text-[#58a6ff]">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="Search boards, members, or tasks... (Cmd + K)"
          className="w-full h-14 bg-[#11141a] border border-[#30363d] rounded-xl pl-12 pr-4 text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all placeholder:text-[#484f58]"
        />
      </div>

      <section className="mb-12">
        <h3 className="text-[11px] font-bold text-[#484f58] uppercase tracking-widest mb-4">
          Get Started
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionCard
            icon={<Plus className="text-white" />}
            title="Start from Scratch"
            desc="Create a new blank board"
            color="bg-[#238636]"
          />
          <ActionCard
            icon={<Layout className="text-white" />}
            title="Explore Templates"
            desc="Start with a pre-built flow"
            color="bg-[#30363d]"
          />
          <ActionCard
            icon={<Users className="text-white" />}
            title="Invite Team"
            desc="Collaborate with others"
            color="bg-[#30363d]"
          />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-bold text-[#484f58] uppercase tracking-widest">
            Recent Boards
          </h3>
          <button className="text-xs text-[#58a6ff] hover:underline flex items-center gap-1">
            View all <ArrowRight size={12} />
          </button>
        </div>

        <div className="space-y-2">
          {recentBoards.map((board) => (
            <div
              key={board.id}
              className="flex items-center justify-between p-4 bg-[#11141a] border border-[#30363d] rounded-lg hover:border-[#484f58] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-[#1c2128] border border-[#30363d] flex items-center justify-center text-[#8b949e] group-hover:text-[#f0f6fc]">
                  <Layout size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#f0f6fc]">
                    {board.name}
                  </h4>
                  <p className="text-xs text-[#484f58]">{board.workspace}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[#484f58] text-xs">
                <Clock size={14} />
                {board.updated}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ActionCard({ icon, title, desc, color }: any) {
  return (
    <button className="flex flex-col items-center justify-center p-6 bg-[#11141a] border border-[#30363d] rounded-xl hover:border-[#484f58] hover:bg-[#161b22] transition-all text-center group">
      <div
        className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
          color,
        )}
      >
        {icon}
      </div>
      <h4 className="text-sm font-semibold text-[#f0f6fc] mb-1">{title}</h4>
      <p className="text-xs text-[#8b949e]">{desc}</p>
    </button>
  );
}

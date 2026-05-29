"use client";

import { ListTodo, Package, Plus, Users } from "lucide-react";

interface EmptyProjectStateProps {
  onCreateProject: () => void;
}

export default function EmptyProjectState({
  onCreateProject,
}: EmptyProjectStateProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[60vh] px-4 animate-in fade-in zoom-in-95 duration-500">
      {/* inline style */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float-1 { animation: float 4s ease-in-out infinite; }
        .animate-float-2 { animation: float 4s ease-in-out 1s infinite; }
        .animate-float-3 { animation: float 5s ease-in-out 2s infinite; }
      `,
        }}
      />

      <div className="relative w-32 h-32 flex items-center justify-center mb-6">
        <div className="absolute top-2 left-4 w-10 h-10 bg-white/2 border border-white/5 rounded-xl flex items-center justify-center z-10 shadow-sm animate-float-2">
          <ListTodo size={18} className="text-[#7C6EF5] opacity-50" />
        </div>

        <div className="relative w-16 h-16 bg-white/4 border border-white/8 rounded-2xl flex items-center justify-center z-20 shadow-md animate-float-1 backdrop-blur-sm">
          <Package size={24} className="text-[#7C6EF5]" />
          <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-[#7C6EF5] border-[3px] border-[#0A0A0A] rounded-full flex items-center justify-center shadow-sm">
            <Plus size={12} className="text-white" strokeWidth={3} />
          </div>
        </div>

        <div className="absolute bottom-4 right-2 w-8 h-8 bg-white/2 border border-white/5 rounded-lg flex items-center justify-center z-30 shadow-sm animate-float-3">
          <Users size={14} className="text-white/40" />
        </div>
      </div>

      <h2 className="text-lg font-bold text-white mb-2 tracking-tight">
        Create your first project
      </h2>
      <p className="text-[13px] text-white/40 text-center max-w-90 leading-relaxed mb-8">
        Projects help you organize boards, track tasks, and keep your team
        aligned. Create one to get started.
      </p>

      <button
        onClick={onCreateProject}
        className="h-10 px-5 bg-[#7C6EF5] hover:bg-[#6b5ee6] text-white rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(124,110,245,0.3)] hover:shadow-[0_0_20px_rgba(124,110,245,0.5)] mb-10"
      >
        <Plus size={16} />
        Create project
      </button>

      <div className="w-full max-w-115 space-y-3">
        <div className="bg-white/2 border border-white/5 rounded-xl p-4 flex items-start gap-4 hover:bg-white/3 transition-colors">
          <div className="w-8 h-8 shrink-0 rounded-lg bg-[#7C6EF5]/10 flex items-center justify-center mt-0.5">
            <Package size={16} className="text-[#7C6EF5]" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[13px] font-semibold text-white/90 mb-0.5">
              Organize your work
            </span>
            <span className="text-xs text-white/40 leading-relaxed">
              Group your related boards, documents, and milestones into focused
              workspaces.
            </span>
          </div>
        </div>

        <div className="bg-white/2 border border-white/5 rounded-xl p-4 flex items-start gap-4 hover:bg-white/3 transition-colors">
          <div className="w-8 h-8 shrink-0 rounded-lg bg-emerald-500/10 flex items-center justify-center mt-0.5">
            <Users size={16} className="text-emerald-400" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[13px] font-semibold text-white/90 mb-0.5">
              Collaborate effectively
            </span>
            <span className="text-xs text-white/40 leading-relaxed">
              Share project context seamlessly and keep everyone on your team
              aligned on goals.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

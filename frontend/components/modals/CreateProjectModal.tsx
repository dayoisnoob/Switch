// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { X, PlusSquare } from "lucide-react";
// import { useForm } from "react-hook-form";
// import { AuthInput, PrimaryButton } from "@/components/auth/auth-components";
// import { useWorkspaceStore } from "@/store/workspace.store";
// import { getErrorMessage } from "@/lib/utils";
// import { ProjectService } from "@/services/projects.service";

// interface CreateProjectModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// // 1. Update the form interface to include the description
// interface ProjectFormValues {
//   name: string;
//   description: string;
// }

// export default function CreateProjectModal({
//   isOpen,
//   onClose,
// }: CreateProjectModalProps) {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);

//   // 2. Pass the interface to useForm
//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm<ProjectFormValues>();

//   if (!isOpen) return null;

//   const onSubmit = async (data: ProjectFormValues) => {
//     if (!activeWorkspace) return;

//     setLoading(true);
//     setError("");

//     try {
//       const response = await ProjectService.create({
//         name: data.name,
//         description: data.description,
//         workspaceSlug: activeWorkspace.slug,
//       });

//       reset();
//       onClose();

//       router.push(`/${activeWorkspace.slug}/${response.slug}`);
//     } catch (err) {
//       setError(getErrorMessage(err));
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-100 flex items-center justify-center bg-[#000000aa] backdrop-blur-sm p-4">
//       <div className="w-full max-w-md bg-[#11141a] border border-[#30363d] rounded-xl shadow-2xl">
//         <div className="p-6 border-b border-[#30363d] flex justify-between items-center bg-[#0d1117]">
//           <div className="flex items-center gap-3">
//             <PlusSquare size={20} className="text-[#58a6ff]" />
//             <h2 className="text-lg font-semibold text-[#f0f6fc]">
//               Create new project
//             </h2>
//           </div>
//           <button
//             onClick={onClose}
//             className="text-[#484f58] hover:text-[#f0f6fc] transition-colors"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
//           <div className="space-y-4">
//             {/* Title Input */}
//             <div className="space-y-2">
//               <label className="text-sm font-medium text-[#c9d1d9]">
//                 Project Title <span className="text-red-400">*</span>
//               </label>
//               <AuthInput
//                 placeholder="e.g., Q3 Product Launch"
//                 {...register("name", { required: "Project name is required" })}
//                 autoFocus
//               />
//               {errors.name && (
//                 <p className="text-xs text-red-400">{errors.name.message}</p>
//               )}
//             </div>

//             {/* Description Textarea */}
//             <div className="space-y-2">
//               <div className="flex justify-between items-center">
//                 <label className="text-sm font-medium text-[#c9d1d9]">
//                   Description
//                 </label>
//                 <span className="text-[11px] text-[#484f58]">Optional</span>
//               </div>
//               <textarea
//                 placeholder="What is this project about?"
//                 {...register("description")}
//                 rows={3}
//                 className="w-full bg-[#0b0e14] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#f0f6fc] placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] resize-none custom-scrollbar transition-all"
//               />
//             </div>

//             <p className="text-[11px] text-[#8b949e]">
//               This will create a dedicated board in{" "}
//               <span className="text-[#f0f6fc]">{activeWorkspace?.name}</span>.
//             </p>
//           </div>

//           {error && (
//             <div className="p-3 bg-red-900/10 border border-red-900/30 rounded text-xs text-red-400">
//               {error}
//             </div>
//           )}

//           <div className="flex gap-3 pt-2">
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 h-10 text-sm font-medium text-[#c9d1d9] hover:bg-[#1c2128] rounded-md transition-colors border border-[#30363d]"
//             >
//               Cancel
//             </button>
//             <PrimaryButton className="flex-1" loading={loading}>
//               Create Project
//             </PrimaryButton>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { AlignLeft, ChevronDown, Plus, X } from "lucide-react";
import { useGetWorkspaces } from "@/hooks/useWorkspace";

const AVAILABLE_LABELS = [
  "Frontend",
  "Backend",
  "Design",
  "Mobile",
  "Feature",
  "Docs",
];

// const WORKSPACES = [
//   { id: "1", name: "Acme Corp" },
//   { id: "2", name: "Pixel Studio" },
//   { id: "3", name: "Nova Labs" },
// ];

export default function CreateProjectModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🎨");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const { data: workspaces, isLoading: workspacesLoading } = useGetWorkspaces();
  const [workspaceId, setWorkspaceId] = useState("");

  const toggleLabel = (label: string) => {
    setSelectedLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-999 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={onClose} // Clicking the backdrop closes the modal
    >
      <div
        className="w-full max-w-[460px] bg-[#141218] border border-[#26242c] rounded-2xl shadow-2xl relative flex flex-col"
        onClick={(e) => e.stopPropagation()} // Equivalent to your onclick="event.stopPropagation()"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#6e6b7b] hover:text-white transition-colors"
        >
          <X size={16} strokeWidth={1.5} />
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            {/* Translated: background:rgba(74,186,133,.1) and stroke="var(--success)" */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 bg-[#4aba85]/10 text-[#4aba85]">
              <AlignLeft size={18} strokeWidth={1.5} />
            </div>
            <h1 className="text-xl font-bold text-white mb-1.5 tracking-tight">
              New project
            </h1>
            <p className="text-[13px] text-[#8b8898] leading-relaxed">
              Projects contain boards, columns, and cards for your team&apos;s
              work.
            </p>
          </div>

          <div className="space-y-5">
            {/* Row 1: Icon & Name (gap-3 = 12px) */}
            <div className="flex items-start gap-3">
              <div>
                <div className="text-[12px] font-semibold text-[#8b8898] mb-1.5">
                  Icon
                </div>
                {/* .emoji-picker-trigger */}
                <button className="w-10 h-10 bg-[#1a1820] border border-[#2c2a35] hover:border-[#433f52] rounded-lg flex items-center justify-center text-lg transition-colors">
                  {icon}
                </button>
              </div>

              <div className="flex-1">
                <div className="text-[12px] font-semibold text-[#8b8898] mb-1.5 flex gap-1">
                  Project name <span className="text-[#a855f7]">*</span>
                </div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Design System"
                  autoFocus
                  className="w-full h-10 bg-[#1a1820] border border-[#2c2a35] focus:border-[#a855f7] rounded-lg px-3 text-[13px] text-white placeholder-[#524f5f] outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="text-[12px] font-semibold text-[#8b8898] mb-1.5">
                Description
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="What is this project about?"
                className="w-full bg-[#1a1820] border border-[#2c2a35] focus:border-[#a855f7] rounded-lg p-3 text-[13px] text-white placeholder-[#524f5f] outline-none transition-all shadow-sm resize-none"
              />
            </div>

            {/* Workspace Dropdown */}
            <div>
              <div className="text-[12px] font-semibold text-[#8b8898] mb-1.5">
                Workspace
              </div>
              <div className="relative">
                <select
                  value={workspaceId}
                  onChange={(e) => setWorkspaceId(e.target.value)}
                  className="w-full h-10 bg-[#1a1820] border border-[#2c2a35] focus:border-[#a855f7] rounded-lg px-3 text-[13px] text-white outline-none transition-all shadow-sm appearance-none cursor-pointer"
                >
                  {workspacesLoading ? (
                    <option value="">Loading workspaces...</option>
                  ) : workspaces?.length === 0 ? (
                    <option value="">No workspaces found</option>
                  ) : (
                    workspaces?.map((ws) => (
                      <option key={ws.id} value={ws.id}>
                        {ws.name}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6e6b7b] pointer-events-none"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#26242c] w-full" />

            {/* Labels */}
            <div>
              <div className="text-[12px] font-semibold text-[#8b8898] mb-2.5">
                Labels
              </div>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_LABELS.map((label) => {
                  const isSelected = selectedLabels.includes(label);
                  return (
                    <button
                      key={label}
                      onClick={() => toggleLabel(label)}
                      className={`px-3 py-1.5 rounded-full text-[13px] font-medium border transition-all ${
                        isSelected
                          ? "border-[#a855f7] bg-[#a855f7]/10 text-[#a855f7]"
                          : "border-[#2c2a35] bg-[#1a1820] text-[#a1a1a1] hover:border-[#433f52] hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          {/* .btn-ghost */}
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-semibold text-[#8b8898] hover:text-white bg-transparent rounded-lg transition-colors"
          >
            Cancel
          </button>
          {/* .btn-primary */}
          <button
            disabled={!name.trim() || !workspaceId || workspacesLoading}
            className="px-4 py-2 text-[13px] font-semibold text-white bg-[#a855f7] hover:bg-[#9333ea] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2 shadow-md"
          >
            <Plus size={14} strokeWidth={2} /> Create project
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, PlusSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { AuthInput, PrimaryButton } from "@/components/auth/auth-components";
import { useWorkspaceStore } from "@/store/workspace.store";
import { getErrorMessage } from "@/lib/utils";
import { ProjectService } from "@/services/projects.service";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 1. Update the form interface to include the description
interface ProjectFormValues {
  name: string;
  description: string;
}

export default function CreateProjectModal({
  isOpen,
  onClose,
}: CreateProjectModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);

  // 2. Pass the interface to useForm
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>();

  if (!isOpen) return null;

  const onSubmit = async (data: ProjectFormValues) => {
    if (!activeWorkspace) return;

    setLoading(true);
    setError("");

    try {
      const response = await ProjectService.createProject({
        name: data.name,
        description: data.description, // Now correctly pulling from form
        workspaceSlug: activeWorkspace.slug,
      });

      reset();
      onClose();

      // 3. Redirect using the Clean Slugs routing we discussed
      router.push(`/${activeWorkspace.slug}/${response.slug}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000000aa] backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#11141a] border border-[#30363d] rounded-xl shadow-2xl">
        <div className="p-6 border-b border-[#30363d] flex justify-between items-center bg-[#0d1117]">
          <div className="flex items-center gap-3">
            <PlusSquare size={20} className="text-[#58a6ff]" />
            <h2 className="text-lg font-semibold text-[#f0f6fc]">
              Create new project
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#484f58] hover:text-[#f0f6fc] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="space-y-4">
            {/* Title Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#c9d1d9]">
                Project Title <span className="text-red-400">*</span>
              </label>
              <AuthInput
                placeholder="e.g., Q3 Product Launch"
                {...register("name", { required: "Project name is required" })}
                autoFocus
              />
              {errors.name && (
                <p className="text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Description Textarea */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-[#c9d1d9]">
                  Description
                </label>
                <span className="text-[11px] text-[#484f58]">Optional</span>
              </div>
              <textarea
                placeholder="What is this project about?"
                {...register("description")}
                rows={3}
                className="w-full bg-[#0b0e14] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#f0f6fc] placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] resize-none custom-scrollbar transition-all"
              />
            </div>

            <p className="text-[11px] text-[#8b949e]">
              This will create a dedicated board in{" "}
              <span className="text-[#f0f6fc]">{activeWorkspace?.name}</span>.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-900/10 border border-red-900/30 rounded text-xs text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 text-sm font-medium text-[#c9d1d9] hover:bg-[#1c2128] rounded-md transition-colors border border-[#30363d]"
            >
              Cancel
            </button>
            <PrimaryButton className="flex-1" loading={loading}>
              Create Project
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import {
  cn,
  formatDateShort,
  formattedTime,
  handleDownload,
} from "@/lib/utils";
import {
  Download,
  FileText,
  File as GenericFile,
  Image as ImageIcon,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";

import {
  useDeleteAttachment,
  useUploadAttachment,
} from "@/hooks/useAttacments";
import { useMe } from "@/hooks/useAuth";
import { useWorkspaceStore } from "@/store/workspace.store";
import { BoardCard, CardAttachment } from "@/types/board.types";
import { useWorkspaceRole } from "@/hooks/useWorkspace";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/"))
    return <ImageIcon size={20} className="text-amber-400" />;
  if (mimeType.includes("pdf") || mimeType.includes("document"))
    return <FileText size={20} className="text-purple-400" />;
  return <GenericFile size={20} className="text-[#7C6EF5]" />;
}

export function CardAttachments({ card }: { card: BoardCard }) {
  const { data: currentUser } = useMe();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { mutate: upload, isPending: isUploading } = useUploadAttachment(
    card.id,
  );
  const { mutate: remove, isPending: isDeleting } = useDeleteAttachment(
    card.id,
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  const { canManageWorkspace } = useWorkspaceRole();

  return (
    <section>
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
        <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
          Attachments
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          aria-busy={isUploading}
          aria-live="polite"
          className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5 disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <div
                className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"
                aria-hidden="true"
              />
              <span>Uploading…</span>
            </>
          ) : (
            <>
              <Upload size={13} aria-hidden="true" />
              <span>Upload</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-2">
        {card.attachments?.map((file: CardAttachment) => {
          if (!file) return null;
          const canDelete =
            file.userId === currentUser?.id || canManageWorkspace;

          return (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-[#13131A] hover:bg-[#16161F] transition-colors group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-[#1A1A24] flex items-center justify-center border border-white/5 shrink-0">
                  {getFileIcon(file.mimeType)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[14px] font-semibold text-white/90 transition-colors truncate">
                    {file.fileName}
                  </span>
                  <span className="text-[11px] text-white/40 flex items-center gap-1.5">
                    {formatBytes(file.fileSize)}
                    <span>•</span>
                    {file.user?.firstName}
                    <span>•</span>
                    {formatDateShort(file.createdAt)} at{" "}
                    {formattedTime(file.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pl-4 shrink-0">
                <button
                  onClick={() => handleDownload(file.fileUrl, file.fileName)}
                  className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                >
                  <Download size={14} />
                </button>
                {canDelete && (
                  <button
                    onClick={() => remove(file.id)}
                    disabled={isDeleting}
                    className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                  >
                    {isDeleting ? (
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "mt-3 w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer",
          isDragging
            ? "border-[#7C6EF5] bg-[#7C6EF5]/10"
            : "border-white/10 hover:border-[#7C6EF5]/50 hover:bg-[#7C6EF5]/5",
          isUploading && "opacity-50 pointer-events-none",
        )}
      >
        <Upload
          size={20}
          className={cn(
            "mb-2 transition-colors",
            isDragging ? "text-[#7C6EF5]" : "text-white/20",
          )}
        />
        <span className="text-[13px] font-medium text-white/50">
          {isDragging
            ? "Drop file to upload!"
            : "Drop files here or click to upload"}
        </span>
      </div>
    </section>
  );
}

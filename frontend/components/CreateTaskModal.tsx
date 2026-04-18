"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiX, FiMoreHorizontal, FiPlus } from "react-icons/fi";
import { clientFetch } from "@/lib/clientFetch";

interface CreateTaskModalProps {
  workspaceId: string;
  projectId: string;
  boardId: string;
  columnId: string;
  columnName: string;
}

export default function CreateTaskModal({
  workspaceId,
  projectId,
  boardId,
  columnId,
  columnName,
}: CreateTaskModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/tasks`;
      const res = await clientFetch(endpoint, {
        method: "POST",
        body: JSON.stringify({ title, description, columnId }),
      });

      if (res.ok) {
        setIsOpen(false);
        setTitle("");
        setDescription("");
        router.refresh();
      } else {
        alert("Failed to create task.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* The Trigger Button - Inside Column */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 w-full px-2 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <FiPlus /> Add a card
      </button>

      {/* The Modal Overlay - Dark Theme matching image */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1f1f2a] rounded-xl shadow-xl w-full max-w-7xl h-[90vh] p-8 border border-gray-700 flex flex-col">
            {/* Column Name */}
            <p className="text-xs font-semibold text-gray-500 tracking-wider mb-6 uppercase">
              {columnName}
            </p>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              {/* Title Input */}
              <div className="mb-6">
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Card title..."
                  className="w-full text-4xl font-extrabold text-white bg-transparent border-none outline-none focus:ring-0 p-0"
                />
              </div>

              {/* Status Indicator (Hardcoded for now) */}
              <div className="flex items-center gap-2 mb-8 bg-[#2d2d38] p-2 rounded-lg w-fit text-sm">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-300 font-medium">{columnName}</span>
              </div>

              {/* Description Textarea */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  DESCRIPTION
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a more detailed description..."
                  rows={6}
                  className="w-full p-4 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent text-sm bg-[#2d2d38] text-white resize-none"
                />
              </div>

              {/* Comments Section (Placeholder) */}
              <div className="mb-8 p-4 bg-[#2d2d38] rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  D
                </div>
                <input
                  type="text"
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-2 border border-gray-600 rounded-lg text-sm bg-[#1f1f2a]"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg"
                  >
                    Comment
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Activity Feed (Placeholder) */}
              <div className="mb-12">
                <p className="text-sm font-medium text-gray-300 mb-4">
                  ACTIVITY
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    D
                  </div>
                  <div className="flex-1 flex justify-between items-center bg-[#2d2d38] p-3 rounded-xl">
                    <p className="text-sm text-gray-300">
                      <span className="font-bold">Dayo Kowalski</span> created
                      this card 3d ago
                    </p>
                    <FiMoreHorizontal className="text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Sidebar options */}
              <div className="border-t border-gray-700 pt-8 mt-auto flex justify-between items-center text-sm font-medium text-gray-400">
                <div className="flex gap-6">
                  <p>PRIORITY: None</p>
                  <p>ASSIGNEES: + Add assignee</p>
                  <p>LABELS: + Add label</p>
                  <p>DUE DATE: dd/mm/yyyy</p>
                  <p>MOVE TO: {columnName}</p>
                </div>
                <button
                  type="button"
                  className="text-red-500 font-bold hover:text-red-400"
                >
                  Delete card
                </button>
              </div>

              <div className="pt-6 flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

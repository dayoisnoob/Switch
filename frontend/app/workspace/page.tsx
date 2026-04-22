import CreateProjectModal from "@/components/CreateProjectModal";
import CreateWorkspaceModal from "@/components/CreateWorkspaceModal";
import { fetchApi } from "@/lib/api";
import { Workspace } from "@/types/workspaces";
import Link from "next/link";
import { FiLayout, FiUsers, FiSettings, FiFolderPlus } from "react-icons/fi";

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface WorkspaceWithProjects extends Workspace {
  projects?: Project[];
}

export default async function WorkspacePage() {
  const res = await fetchApi("/workspaces");

  if (!res.ok) {
    return (
      <div className="text-red-500 text-center py-10">
        Failed to load workspaces. Please log in again.
      </div>
    );
  }

  const json = await res.json();
  const workspaces: WorkspaceWithProjects[] = json.data;

  if (!workspaces || workspaces.length === 0) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 border border-gray-200">
          <FiFolderPlus className="text-3xl text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Switch
        </h2>
        <p className="text-gray-500 mb-8">
          You don&apos;t have any workspaces yet. A workspace is where you
          organize your projects, boards, and team members.
        </p>
        <CreateWorkspaceModal />
      </div>
    );
  }

  for (const ws of workspaces) {
    const projRes = await fetchApi(`/workspace/${ws.id}/projects`);
    if (projRes.ok) {
      const projJson = await projRes.json();
      ws.projects = projJson.data;
    } else {
      ws.projects = [];
    }
  }

  return (
    <div className="space-y-12">
      {workspaces.map((ws) => (
        <section key={ws.id} className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-900 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                {ws.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{ws.name}</h2>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 rounded-md transition-colors shadow-sm">
                <FiLayout /> Projects
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium hover:bg-gray-100 text-gray-600 rounded-md transition-colors">
                <FiUsers /> Members
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium hover:bg-gray-100 text-gray-600 rounded-md transition-colors">
                <FiSettings /> Settings
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ws.projects?.map((project) => (
              <Link
                key={project.id}
                href={`/workspace/${ws.id}/projects/${project.id}/board`}
                className="group cursor-pointer h-28 rounded-xl bg-white border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all flex flex-col justify-between block"
              >
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-black transition-colors">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {project.description}
                    </p>
                  )}
                </div>
                <p className="text-xs font-medium text-blue-600 bg-blue-50 w-max px-2 py-0.5 rounded">
                  Active
                </p>
              </Link>
            ))}

            <CreateProjectModal workspaceId={ws.id} />
          </div>
        </section>
      ))}
    </div>
  );
}

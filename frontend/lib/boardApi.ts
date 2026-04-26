// import { clientFetch } from "@/lib/clientFetch";
// import { BoardState } from "@/types/board";
// import { ApiError } from "./ApiError";

// export const getBoard = async (
//   workspaceId: string,
//   projectId: string,
// ): Promise<BoardState> => {
//   const res = await clientFetch(
//     `/workspace/${workspaceId}/projects/${projectId}/board`,
//   );

//   // Handle Auth/Not Found errors cleanly
//   if (res.status === 401 || res.status === 403 || res.status === 404) {
//     throw new ApiError("UNAUTHORIZED", res.status);
//   }

//   // Handle general server errors
//   if (!res.ok) {
//     const errorData = await res.json().catch(() => ({}));
//     throw new ApiError(
//       errorData.message || "Failed to fetch board data",
//       res.status,
//     );
//   }

//   // THE FORMATTING: Unwrap the payload so the frontend only sees the actual data object
//   const json = await res.json();
//   return json.data;
// };

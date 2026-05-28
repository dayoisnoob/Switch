import { ApiResponse } from "@/types";
import axios, { isAxiosError } from "axios";
import { ApiError } from "./ApiError";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: { resolve: () => void; reject: (err: Error) => void }[] = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response.data?.data ?? response.data,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute = originalRequest?.url?.startsWith("/auth/");

    // pass non-401s and auth route errors straight through
    if (!isAxiosError(error) || error.response?.status !== 401 || isAuthRoute) {
      const data = error.response?.data;
      const message =
        data?.errors?.[0]?.message ?? data?.message ?? "Something went wrong";
      return Promise.reject(
        new ApiError(message, error.response?.status ?? 500),
      );
    }

    // queue concurrent requests while refresh is in flight
    if (isRefreshing) {
      return new Promise<void>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => api(originalRequest))
        .catch(Promise.reject);
    }

    isRefreshing = true;

    try {
      await api.post("/auth/refresh");
      processQueue(null);
      return api(originalRequest);
    } catch (refreshError) {
      const err = new Error("Session expired. Please sign in again.");
      processQueue(err);
      window.location.href = "/login";
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

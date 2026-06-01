import axios, { AxiosError, isAxiosError } from "axios";
import { ApiError } from "./ApiError";
import { toast } from "sonner";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshQueue: Array<(err: Error | null) => void> = [];

const processQueue = (error: Error | null) => {
  refreshQueue.forEach((callback) => callback(error));
  refreshQueue = [];
};

api.interceptors.response.use(
  (response) => response.data?.data ?? response.data,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute = originalRequest?.url?.startsWith("/auth/");
    const isMeRoute = originalRequest?.url?.includes("/users/me");

    if (!isAxiosError(error) || error.response?.status !== 401 || isAuthRoute) {
      const data = error.response?.data;
      const message =
        data?.errors?.[0]?.message ?? data?.message ?? "Something went wrong";
      return Promise.reject(
        new ApiError(message, error.response?.status ?? 500),
      );
    }

    if (isMeRoute) {
      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          refreshQueue.push((err) => {
            if (err) return reject(err);
            resolve();
          });
        }).then(() => api(originalRequest));
      }
      return Promise.reject(new ApiError("Unauthorized", 401));
    }

    if (isRefreshing) {
      return new Promise<void>((resolve, reject) => {
        refreshQueue.push((err) => {
          if (err) return reject(err);
          resolve();
        });
      }).then(() => api(originalRequest));
    }

    isRefreshing = true;
    try {
      await api.post("/auth/refresh");
      processQueue(null);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(new Error("Session expired"));
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

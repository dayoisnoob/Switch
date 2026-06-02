import axios, { AxiosError } from "axios";
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
  async (error: AxiosError<any>) => {
    const originalRequest = error.config;
    const status = error.response?.status ?? 500;
    const data = error.response?.data;
    const message =
      data?.errors?.[0]?.message ?? data?.message ?? "Something went wrong";

    const isAuthRoute = originalRequest?.url?.startsWith("/auth/");

    if (status === 429) toast.error(message);

    if (status !== 401 || isAuthRoute || !originalRequest) {
      return Promise.reject(new ApiError(message, status));
    }

    if (isRefreshing) {
      return new Promise<void>((resolve, reject) => {
        refreshQueue.push((err) => (err ? reject(err) : resolve()));
      }).then(() => api(originalRequest));
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

import axios from "axios";
import { secureStorage } from "../utils/secureStorage";

const isDev = import.meta.env.DEV;
export const API_BASE_URL = isDev
	? "/api"
	: import.meta.env.VITE_API_URL || "https://qlnn.dulieudakha.vn/api";

export const apiClient = axios.create({
	baseURL: API_BASE_URL,
	timeout: 15000,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request Interceptor: Gắn Bearer Token
apiClient.interceptors.request.use(
	async (config) => {
		const token = await secureStorage.getItem("accessToken");
		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: {
	resolve: (token: string) => void;
	reject: (err: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token as string);
		}
	});
	failedQueue = [];
};

// Response Interceptor: Tự động refresh token khi gặp 401 (Có khóa và hàng đợi)
apiClient.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		if (error.response?.status === 401 && !originalRequest._retry) {
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({
						resolve: (token: string) => {
							originalRequest.headers.Authorization = `Bearer ${token}`;
							resolve(apiClient(originalRequest));
						},
						reject: (err: any) => {
							reject(err);
						},
					});
				});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				const refreshToken = await secureStorage.getItem("refreshToken");
				if (!refreshToken) {
					throw new Error("No refresh token available");
				}

				const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
					refreshToken,
				});

				const newAccessToken =
					res.data.data?.accessToken || res.data.accessToken;
				const newRefreshToken =
					res.data.data?.refreshToken || res.data.refreshToken;

				await secureStorage.setItem("accessToken", newAccessToken);
				if (newRefreshToken) {
					await secureStorage.setItem("refreshToken", newRefreshToken);
				}

				processQueue(null, newAccessToken);

				originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
				return apiClient(originalRequest);
			} catch (refreshErr) {
				processQueue(refreshErr, null);
				await secureStorage.clear();
				window.dispatchEvent(new CustomEvent("auth:expired"));
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(error);
	},
);

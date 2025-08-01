"use client";

import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from "axios";

import { apiRoutePrefix } from "@/core/constants";
import { apiRoute } from "@/routes/routes";

// Define the shape of the CSRF token API response
interface CSRFTokenResponse {
	status: number;
	message: string;
	data: string; // The CSRF token itself
}

// Cache for CSRF token
let csrfTokenCache: string | null = null;
let isFetchingToken = false; // Prevent concurrent token fetches

const axiosApi = axios.create({
	baseURL: apiRoutePrefix,
	withCredentials: true, // Ensures cookies are included in requests
	headers: {
		"ngrok-skip-browser-warning": "true"
	}
});

// Function to fetch and cache CSRF token
const fetchAndCacheCSRFToken = async (): Promise<string | null> => {
	if (!isFetchingToken) {
		isFetchingToken = true;
		try {
			await axiosApi
				.get<CSRFTokenResponse>(apiRoute.csrfToken)
				.then(response => {
					csrfTokenCache = response.data.data;
					console.log("CSRF token refreshed");
				})
				.catch(error => {
					console.log("Error fetching CSRF token:", error);
					csrfTokenCache = null; // Reset cache on error
				});
		} catch (error) {
			console.error("Error fetching CSRF token:", error);
			csrfTokenCache = null; // Reset cache on error
		} finally {
			isFetchingToken = false;
		}
	}
	// Wait for token fetch to complete (in case of concurrent calls)
	while (isFetchingToken) {
		await new Promise(resolve => setTimeout(resolve, 100));
	}
	return csrfTokenCache;
};

// Add interceptor to include CSRF token in requests
axiosApi.interceptors.request.use(
	async (config: InternalAxiosRequestConfig) => {
		if (
			config.method &&
			config.method.toLowerCase() !== "get" && // Only for non-GET requests
			!config.headers?.["X-CSRF-Token"] // If the CSRF token is not already set
		) {
			if (!csrfTokenCache) {
				await fetchAndCacheCSRFToken();
			}
			if (csrfTokenCache) {
				// Ensure headers are an AxiosHeaders instance
				if (!config.headers) {
					config.headers = new AxiosHeaders();
				}
				config.headers.set("X-CSRF-Token", csrfTokenCache);
			}
		}
		return config;
	},
	(error: AxiosError) => Promise.reject(error)
);

// Add interceptor to handle token expiration or invalidation
axiosApi.interceptors.response.use(
	response => response,
	async (error: AxiosError) => {
		if (error.response?.status === 403) {
			console.warn("CSRF token invalid or expired. Refreshing token...");
			await fetchAndCacheCSRFToken(); // Refresh token
			const originalRequest = error.config; // Get the failed request
			if (originalRequest && csrfTokenCache) {
				if (!originalRequest.headers) {
					originalRequest.headers = new AxiosHeaders();
				}
				originalRequest.headers.set("X-CSRF-Token", csrfTokenCache);
				return axiosApi(originalRequest); // Retry the failed request
			}
		}
		return Promise.reject(error);
	}
);

export default axiosApi;

import {
	type BaseQueryFn,
	type FetchArgs,
	type FetchBaseQueryError,
	fetchBaseQuery
} from "@reduxjs/toolkit/query/react";

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

const csrfUrl = apiRoutePrefix + apiRoute.csrf; // Full URL for CSRF token endpoint

// Function to fetch and cache CSRF token
const fetchAndCacheCSRFToken = async (): Promise<string | null> => {
	if (!isFetchingToken) {
		isFetchingToken = true;
		try {
			const baseQuery = fetchBaseQuery({
				baseUrl: apiRoutePrefix,
				credentials: "include",
				headers: {
					"ngrok-skip-browser-warning": "true"
				}
			});

			const result = await baseQuery(
				{ url: csrfUrl, method: "GET" },
				{} as any, // api object (not used in this context)
				{} as any // extraOptions (not used in this context)
			);

			if (result.data) {
				const response = result.data as CSRFTokenResponse;
				csrfTokenCache = response.data;
				// console.log("CSRF token refreshed");
			} else {
				console.log("Error fetching CSRF token:", result.error);
				csrfTokenCache = null; // Reset cache on error
			}
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

// Create the base query with CSRF token handling
const baseQueryWithCSRF: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
	args,
	api,
	extraOptions
) => {
	const baseQuery = fetchBaseQuery({
		baseUrl: apiRoutePrefix,
		credentials: "include",
		headers: {
			"ngrok-skip-browser-warning": "true"
		},
		prepareHeaders: async headers => {
			// Only add CSRF token for non-GET requests
			if (typeof args === "object" && args.method && args.method.toLowerCase() !== "get") {
				if (!csrfTokenCache) {
					await fetchAndCacheCSRFToken();
				}
				if (csrfTokenCache) {
					headers.set("X-CSRF-Token", csrfTokenCache);
				}
			} else if (typeof args === "string") {
				// If args is just a URL string, it's a GET request by default
				// No CSRF token needed
			}
			return headers;
		}
	});

	// Execute the query
	let result = await baseQuery(args, api, extraOptions);

	// Handle CSRF token expiration or invalidation
	if (result.error && result.error.status === 403) {
		console.warn("CSRF token invalid or expired. Refreshing token...");

		// Refresh the CSRF token
		await fetchAndCacheCSRFToken();

		// Retry the original request with the new token
		if (
			csrfTokenCache &&
			typeof args === "object" &&
			args.method &&
			args.method.toLowerCase() !== "get"
		) {
			const retryBaseQuery = fetchBaseQuery({
				baseUrl: apiRoutePrefix,
				credentials: "include",
				headers: {
					"ngrok-skip-browser-warning": "true"
				},
				prepareHeaders: headers => {
					headers.set("X-CSRF-Token", csrfTokenCache!);
					return headers;
				}
			});

			result = await retryBaseQuery(args, api, extraOptions);
		}
	}

	return result;
};

// Export the configured base query
export { baseQueryWithCSRF };

// Export a function to create the base query with custom options
export const createBaseQueryWithCSRF = (customOptions?: {
	baseUrl?: string;
	additionalHeaders?: Record<string, string>;
}) => {
	const { baseUrl = apiRoutePrefix, additionalHeaders = {} } = customOptions || {};

	const customBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
		args,
		api,
		extraOptions
	) => {
		const baseQuery = fetchBaseQuery({
			baseUrl,
			credentials: "include",
			headers: {
				"ngrok-skip-browser-warning": "true",
				...additionalHeaders
			},
			prepareHeaders: async headers => {
				// Add any additional custom headers
				Object.entries(additionalHeaders).forEach(([key, value]) => {
					headers.set(key, value);
				});

				// Only add CSRF token for non-GET requests
				if (typeof args === "object" && args.method && args.method.toLowerCase() !== "get") {
					if (!csrfTokenCache) {
						await fetchAndCacheCSRFToken();
					}
					if (csrfTokenCache) {
						headers.set("X-CSRF-Token", csrfTokenCache);
					}
				}
				return headers;
			}
		});

		// Execute the query
		let result = await baseQuery(args, api, extraOptions);

		// Handle CSRF token expiration or invalidation
		if (result.error && result.error.status === 403) {
			console.warn("CSRF token invalid or expired. Refreshing token...");

			// Refresh the CSRF token
			await fetchAndCacheCSRFToken();

			// Retry the original request with the new token
			if (
				csrfTokenCache &&
				typeof args === "object" &&
				args.method &&
				args.method.toLowerCase() !== "get"
			) {
				const retryBaseQuery = fetchBaseQuery({
					baseUrl,
					credentials: "include",
					headers: {
						"ngrok-skip-browser-warning": "true",
						...additionalHeaders
					},
					prepareHeaders: headers => {
						Object.entries(additionalHeaders).forEach(([key, value]) => {
							headers.set(key, value);
						});
						headers.set("X-CSRF-Token", csrfTokenCache!);
						return headers;
					}
				});

				result = await retryBaseQuery(args, api, extraOptions);
			}
		}

		return result;
	};

	return customBaseQuery;
};

// Utility function to manually refresh CSRF token if needed
export const refreshCSRFToken = () => fetchAndCacheCSRFToken();

// Utility function to get current cached CSRF token
export const getCurrentCSRFToken = () => csrfTokenCache;

// Utility function to clear CSRF token cache
export const clearCSRFTokenCache = () => {
	csrfTokenCache = null;
};

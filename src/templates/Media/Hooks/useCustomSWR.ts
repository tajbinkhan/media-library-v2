import { AxiosError, AxiosRequestConfig } from "axios";
import useSWR, { SWRConfiguration } from "swr";

import axiosApi from "@/lib/axios-config";

/**
 * Custom fetcher function that handles API requests with proper typing and Axios configuration
 * @param args - The fetcher arguments containing URL and optional Axios config
 * @returns The response data
 */
const fetcher = async <T = any>(key: string | [string, AxiosRequestConfig?]): Promise<T> => {
	try {
		// Handle both string and array key formats
		let url: string;
		let axiosConfig: AxiosRequestConfig | undefined;

		if (Array.isArray(key)) {
			[url, axiosConfig] = key;
		} else {
			url = key;
		}

		const response = await axiosApi.get<T>(url, axiosConfig);
		return response.data;
	} catch (error) {
		// Properly handle and throw API errors
		if (error instanceof AxiosError) {
			throw error.response?.data || error;
		}
		throw error;
	}
};

/**
 * Type for the enhanced SWR response with additional helper methods
 */
type EnhancedSWRResponse<Data = any, Error = any> = {
	data: Data | undefined;
	error: Error | undefined;
	isLoading: boolean;
	isValidating: boolean;
	refresh: () => Promise<Data | undefined>;
	[key: string]: any;
};

/**
 * A custom SWR hook that wraps the useSWR hook with additional functionality
 * @template Data - The type of data returned from the API
 * @template Error - The type of error returned from the API
 * @param path - The API endpoint path or array of paths
 * @param axiosConfigOrOptions - Optional Axios request config or SWR options
 * @param swrOptions - Optional SWR configuration options (if axiosConfig is provided)
 * @returns An enhanced SWR response object with typed data, error, and helper methods
 */
const useCustomSWR = <Data = any, Error = any>(
	path: string | string[],
	axiosConfigOrOptions?: AxiosRequestConfig | SWRConfiguration,
	swrOptions?: SWRConfiguration
): EnhancedSWRResponse<Data, Error> => {
	// Determine if the second parameter is Axios config or SWR options
	const isAxiosConfig =
		axiosConfigOrOptions &&
		(axiosConfigOrOptions.hasOwnProperty("headers") ||
			axiosConfigOrOptions.hasOwnProperty("params") ||
			axiosConfigOrOptions.hasOwnProperty("data") ||
			axiosConfigOrOptions.hasOwnProperty("timeout") ||
			axiosConfigOrOptions.hasOwnProperty("withCredentials"));

	// Set up the correct parameters
	const axiosConfig = isAxiosConfig ? (axiosConfigOrOptions as AxiosRequestConfig) : undefined;
	const options = isAxiosConfig ? swrOptions : (axiosConfigOrOptions as SWRConfiguration);
	// Create the fetcher key: URL + Axios config if provided
	const fetcherKey = axiosConfig ? [path, axiosConfig] : path;

	const result = useSWR<Data, Error>(fetcherKey, fetcher, options);
	const { mutate } = result;

	return {
		...result,
		// Add a more intuitive name for mutate
		refresh: () => mutate()
	};
};

export default useCustomSWR;

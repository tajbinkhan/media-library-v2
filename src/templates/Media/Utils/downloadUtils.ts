/**
 * Download utilities for media files
 * Provides robust file downloading with fallback methods
 */
import { mediaApiRoutes } from "../Routes/MediaRoutes";

import axiosApi from "@/lib/axios-config";

/**
 * Download options interface
 */
interface DownloadOptions {
	/** Preferred download method */
	method?: "server" | "blob" | "direct";
	/** Timeout in milliseconds */
	timeout?: number;
	/** Callback for download progress */
	onProgress?: (progress: number) => void;
	/** Callback for download start */
	onStart?: () => void;
	/** Callback for download complete */
	onComplete?: () => void;
	/** Callback for download error */
	onError?: (error: Error) => void;
}

/**
 * Downloads a media file using the most appropriate method
 * @param mediaItem - The media item to download
 * @param options - Download options
 */
export async function downloadMediaFile(
	mediaItem: { id: number; originalFilename: string; secureUrl: string },
	options: DownloadOptions = {}
): Promise<void> {
	const { method = "server", timeout = 30000, onProgress, onStart, onComplete, onError } = options;

	try {
		onStart?.();

		// Method 1: Server-side download endpoint (Recommended)
		if (method === "server") {
			try {
				await downloadViaServer(mediaItem.id, mediaItem.originalFilename, {
					timeout,
					onProgress,
					onComplete,
					onError
				});
				return;
			} catch (error) {
				console.warn("Server download failed, trying blob method:", error);
				// Fallback to blob method
			}
		}

		// Method 2: Blob download (Fallback)
		if (method === "blob" || method === "server") {
			try {
				await downloadViaBlob(mediaItem.secureUrl, mediaItem.originalFilename, {
					timeout,
					onProgress,
					onComplete,
					onError
				});
				return;
			} catch (error) {
				console.warn("Blob download failed, trying direct method:", error);
				// Fallback to direct method
			}
		}

		// Method 3: Direct download (Last resort)
		downloadViaDirect(mediaItem.secureUrl, mediaItem.originalFilename);
		onComplete?.();
	} catch (error) {
		const downloadError = error instanceof Error ? error : new Error("Download failed");
		onError?.(downloadError);
		throw downloadError;
	}
}

/**
 * Download via server endpoint
 */
async function downloadViaServer(
	mediaId: number,
	filename: string,
	options: Pick<DownloadOptions, "timeout" | "onProgress" | "onComplete" | "onError">
): Promise<void> {
	const { timeout, onProgress, onComplete } = options;

	const response = await axiosApi.get(mediaApiRoutes.mediaDownload(mediaId), {
		responseType: "blob",
		timeout,
		onDownloadProgress: (progressEvent: any) => {
			if (progressEvent.total && onProgress) {
				const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
				onProgress(progress);
			}
		}
	});

	// Create blob and download
	const blob = new Blob([response.data]);
	const url = window.URL.createObjectURL(blob);

	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.style.display = "none";

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	// Cleanup
	window.URL.revokeObjectURL(url);
	onComplete?.();
}

/**
 * Download via blob fetch
 */
async function downloadViaBlob(
	url: string,
	filename: string,
	options: Pick<DownloadOptions, "timeout" | "onProgress" | "onComplete" | "onError">
): Promise<void> {
	const { timeout, onProgress, onComplete } = options;

	// Create AbortController for timeout
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	try {
		const response = await fetch(url, {
			signal: controller.signal,
			mode: "cors",
			credentials: "omit"
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const contentLength = response.headers.get("content-length");
		const total = contentLength ? parseInt(contentLength, 10) : 0;
		let loaded = 0;

		const reader = response.body?.getReader();
		if (!reader) {
			throw new Error("Unable to read response body");
		}

		const chunks: Uint8Array[] = [];

		while (true) {
			const { done, value } = await reader.read();

			if (done) break;

			chunks.push(value);
			loaded += value.length;

			if (total && onProgress) {
				const progress = Math.round((loaded * 100) / total);
				onProgress(progress);
			}
		}

		// Combine chunks into blob
		const blob = new Blob(chunks);
		const downloadUrl = window.URL.createObjectURL(blob);

		const link = document.createElement("a");
		link.href = downloadUrl;
		link.download = filename;
		link.style.display = "none";

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		// Cleanup
		window.URL.revokeObjectURL(downloadUrl);
		onComplete?.();
	} finally {
		clearTimeout(timeoutId);
	}
}

/**
 * Direct download (fallback method)
 */
function downloadViaDirect(url: string, filename: string): void {
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.target = "_blank";
	link.rel = "noopener noreferrer";
	link.style.display = "none";

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

/**
 * Simple download function for backward compatibility
 */
export function downloadFile(url: string, filename: string): void {
	downloadViaDirect(url, filename);
}

/**
 * Check if download is supported
 */
export function isDownloadSupported(): boolean {
	const link = document.createElement("a");
	return typeof link.download !== "undefined";
}

/**
 * Get appropriate download method based on browser capabilities
 */
export function getPreferredDownloadMethod(): "server" | "blob" | "direct" {
	// Check if we're in a modern browser
	if (typeof fetch !== "undefined" && typeof Blob !== "undefined") {
		return "server"; // Prefer server method
	}

	if (typeof Blob !== "undefined") {
		return "blob";
	}

	return "direct";
}

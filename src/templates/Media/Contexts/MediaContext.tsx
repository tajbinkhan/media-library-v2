"use client";

import axios, { AxiosProgressEvent, CancelTokenSource } from "axios";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

// Define types locally since .d.ts files cannot be imported
interface UploadedFile extends File {
	path?: string;
	id?: string;
	progress?: number;
	status?: "pending" | "uploading" | "completed" | "failed" | "cancelled";
	preview?: string;
	cancelTokenSource?: CancelTokenSource;
	uploadedUrl?: string;
	serverId?: string;
	metadata?: {
		dimensions?: { width: number; height: number };
		dates?: { created?: Date; modified?: Date; uploaded?: Date };
		tags?: string[];
		description?: string;
		alt?: string;
	};
}

interface RejectedFile {
	file: UploadedFile;
	errors: { code: string; message: string; details?: Record<string, any> }[];
}

// ============================================================================
// Types
// ============================================================================

interface MediaContextState {
	// Modal state
	isUploaderOpen: boolean;

	// File states
	acceptedFiles: UploadedFile[];
	rejectedFiles: RejectedFile[];

	// Upload state
	uploadQueue: UploadedFile[];
	activeUploads: Set<string>;
	uploadErrors: Map<string, string>;
	uploadComplete: { successful: number; failed: number } | null;

	// Preview management
	previewUrls: Map<string, string>;
	imageLoadErrors: Set<string>;

	// Upload configuration
	uploadConfig: UploadConfig;
}

interface UploadConfig {
	maxFileSize: number;
	maxFiles: number;
	maxConcurrentUploads: number;
	acceptedFileTypes: Record<string, string[]>;
	multiple: boolean;
	uploadUrl: string;
}

interface MediaContextActions {
	// Modal actions
	openUploader: () => void;
	closeUploader: () => void;

	// File management actions
	addAcceptedFiles: (files: File[]) => void;
	addRejectedFiles: (rejectedFiles: RejectedFile[]) => void;
	removeAcceptedFile: (index: number) => void;
	removeRejectedFile: (index: number) => void;
	clearAllFiles: () => void;

	// Upload actions
	uploadFiles: (files: UploadedFile[]) => Promise<void>;
	cancelUpload: (fileId: string) => void;
	cancelAllUploads: () => void;
	retryUpload: (fileId: string) => void;
	clearUploadComplete: () => void;

	// Preview management
	generatePreviewUrl: (file: File) => string | null;
	handleImageError: (file: File) => void;
	getPreviewUrl: (file: File) => string | null;

	// Utility functions
	formatFileSize: (bytes: number) => string;
	isImageFile: (file: File) => boolean;
	getFileKey: (file: File) => string;

	// Configuration
	updateUploadConfig: (config: Partial<UploadConfig>) => void;
}

type MediaContextType = MediaContextState & MediaContextActions;

// ============================================================================
// Default Values
// ============================================================================

const defaultUploadConfig: UploadConfig = {
	maxFileSize: 10 * 1024 * 1024, // 10MB
	maxFiles: 20,
	maxConcurrentUploads: 3,
	acceptedFileTypes: {
		"image/jpeg": [],
		"image/png": [],
		"image/gif": [],
		"image/webp": [],
		"image/svg+xml": [],
		"application/pdf": []
	},
	multiple: true,
	uploadUrl: "http://localhost:8080/media/upload"
};

const defaultContextValue: MediaContextType = {
	// State
	isUploaderOpen: false,
	acceptedFiles: [],
	rejectedFiles: [],
	uploadQueue: [],
	activeUploads: new Set(),
	uploadErrors: new Map(),
	uploadComplete: null,
	previewUrls: new Map(),
	imageLoadErrors: new Set(),
	uploadConfig: defaultUploadConfig,

	// Actions
	openUploader: () => {},
	closeUploader: () => {},
	addAcceptedFiles: () => {},
	addRejectedFiles: () => {},
	removeAcceptedFile: () => {},
	removeRejectedFile: () => {},
	clearAllFiles: () => {},
	uploadFiles: async () => {},
	cancelUpload: () => {},
	cancelAllUploads: () => {},
	retryUpload: () => {},
	clearUploadComplete: () => {},
	generatePreviewUrl: () => null,
	handleImageError: () => {},
	getPreviewUrl: () => null,
	formatFileSize: () => "",
	isImageFile: () => false,
	getFileKey: () => "",
	updateUploadConfig: () => {}
};

// ============================================================================
// Context
// ============================================================================

const MediaContext = createContext<MediaContextType>(defaultContextValue);

// ============================================================================
// Provider Component
// ============================================================================

interface MediaProviderProps {
	children: React.ReactNode;
	initialConfig?: Partial<UploadConfig>;
}

export function MediaProvider({ children, initialConfig }: MediaProviderProps) {
	// ========================================================================
	// State
	// ========================================================================

	const [isUploaderOpen, setIsUploaderOpen] = useState(false);
	const [acceptedFiles, setAcceptedFiles] = useState<UploadedFile[]>([]);
	const [rejectedFiles, setRejectedFiles] = useState<RejectedFile[]>([]);
	const [uploadQueue, setUploadQueue] = useState<UploadedFile[]>([]);
	const [activeUploads, setActiveUploads] = useState<Set<string>>(new Set());
	const [uploadErrors, setUploadErrors] = useState<Map<string, string>>(new Map());
	const [uploadComplete, setUploadComplete] = useState<{
		successful: number;
		failed: number;
	} | null>(null);
	const [previewUrls, setPreviewUrls] = useState<Map<string, string>>(new Map());
	const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());
	const [uploadConfig, setUploadConfig] = useState<UploadConfig>({
		...defaultUploadConfig,
		...initialConfig
	});

	// Ref to track object URLs for cleanup
	const objectUrlsRef = useRef<Set<string>>(new Set());

	// ========================================================================
	// Utility Functions
	// ========================================================================

	const getFileKey = (file: File): string => {
		// Add safety checks but preserve original file data
		if (!file) {
			return `invalid-file-${Date.now()}-${Math.random()}`;
		}

		const fileName = file.name || `unnamed-file-${Date.now()}`;
		const fileSize = file.size ?? 0;
		const lastModified = file.lastModified || Date.now();

		return `${fileName}-${fileSize}-${lastModified}`;
	};

	const isImageFile = (file: File): boolean => {
		if (!file || !file.type) return false;
		return file.type.startsWith("image/");
	};

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	// ========================================================================
	// Preview Management
	// ========================================================================

	const generatePreviewUrl = (file: File): string | null => {
		if (!file || !isImageFile(file)) return null;

		try {
			const url = URL.createObjectURL(file);
			objectUrlsRef.current.add(url);
			return url;
		} catch (error) {
			return null;
		}
	};

	const getPreviewUrl = (file: File): string | null => {
		if (!file || !isImageFile(file)) return null;
		const fileKey = getFileKey(file);
		const hasError = imageLoadErrors.has(fileKey);
		return hasError ? null : previewUrls.get(fileKey) || null;
	};

	const handleImageError = (file: File): void => {
		if (!file) return;
		const fileKey = getFileKey(file);
		setImageLoadErrors(prev => new Set(prev).add(fileKey));
	};

	// ========================================================================
	// File Management Actions
	// ========================================================================

	const addAcceptedFiles = (files: File[]): void => {
		const newAcceptedFiles: UploadedFile[] = files.map(file => {
			// Attach custom properties directly to the original File object
			(file as UploadedFile).id = `${file.name || "unnamed"}-${Date.now()}-${Math.random()}`;
			(file as UploadedFile).status = "pending";
			(file as UploadedFile).progress = 0;
			return file as UploadedFile;
		});

		setAcceptedFiles(prev => [...prev, ...newAcceptedFiles]);
		// Don't automatically add to upload queue - wait for user to click upload
	};

	const addRejectedFiles = (rejectedFileList: RejectedFile[]): void => {
		const newRejectedFiles: RejectedFile[] = rejectedFileList.map(rejection => {
			const uploadedFile = rejection.file as UploadedFile;
			uploadedFile.id = `${rejection.file.name}-${Date.now()}-${Math.random()}`;
			uploadedFile.status = "failed";
			return rejection;
		});

		setRejectedFiles(prev => [...prev, ...newRejectedFiles]);
	};

	const removeAcceptedFile = (index: number): void => {
		const fileToRemove = acceptedFiles[index];
		if (fileToRemove?.id) {
			// Cancel upload if it's in progress
			cancelUpload(fileToRemove.id);
			// Remove from queue if it's pending
			setUploadQueue(prev => prev.filter(file => file.id !== fileToRemove.id));
		}
		setAcceptedFiles(prev => prev.filter((_, i) => i !== index));
	};

	const removeRejectedFile = (index: number): void => {
		setRejectedFiles(prev => prev.filter((_, i) => i !== index));
	};

	const clearAllFiles = (): void => {
		// Cancel all active uploads
		cancelAllUploads();
		setAcceptedFiles([]);
		setRejectedFiles([]);
		setUploadQueue([]);
		setUploadErrors(new Map());
	};

	// ========================================================================
	// Upload Functions
	// ========================================================================

	const uploadFile = async (file: UploadedFile): Promise<void> => {
		if (!file || !file.id) {
			return;
		}

		try {
			// Create cancel token
			const cancelTokenSource = axios.CancelToken.source();
			file.cancelTokenSource = cancelTokenSource;

			// Update file status to uploading
			setAcceptedFiles(prev =>
				prev.map(f => {
					if (f.id === file.id) {
						const updatedFile = f;
						updatedFile.status = "uploading";
						updatedFile.progress = 0;
						return updatedFile;
					}
					return f;
				})
			);

			// Add to active uploads
			setActiveUploads(prev => new Set(prev).add(file.id!));

			// Create form data
			const formData = new FormData();
			formData.append("file", file);
			formData.append("fileName", file.name);

			// Upload with progress tracking
			const response = await axios.post(uploadConfig.uploadUrl, formData, {
				headers: {
					"Content-Type": "multipart/form-data"
				},
				cancelToken: cancelTokenSource.token,
				onUploadProgress: (progressEvent: AxiosProgressEvent) => {
					if (progressEvent.total) {
						const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
						setAcceptedFiles(prev =>
							prev.map(f => {
								if (f.id === file.id) {
									const updatedFile = f;
									updatedFile.progress = progress;
									return updatedFile;
								}
								return f;
							})
						);
					}
				}
			});

			// Upload successful - Remove the file from acceptedFiles immediately
			setAcceptedFiles(prev => prev.filter(f => f.id !== file.id));

			// Optionally store completed file info if you need it later
			// You could add it to a separate completedFiles state if needed
		} catch (error) {
			if (axios.isCancel(error)) {
				setAcceptedFiles(prev =>
					prev.map(f => {
						if (f.id === file.id) {
							const updatedFile = f;
							updatedFile.status = "cancelled";
							return updatedFile;
						}
						return f;
					})
				);
			} else {
				const errorMessage = axios.isAxiosError(error)
					? error.response?.data?.message || error.message
					: "Upload failed";

				setAcceptedFiles(prev =>
					prev.map(f => {
						if (f.id === file.id) {
							const updatedFile = f;
							updatedFile.status = "failed";
							return updatedFile;
						}
						return f;
					})
				);

				setUploadErrors(prev => new Map(prev).set(file.id!, errorMessage));
			}
		} finally {
			// Remove from active uploads
			setActiveUploads(prev => {
				const newSet = new Set(prev);
				newSet.delete(file.id!);
				return newSet;
			});

			// Remove from upload queue
			setUploadQueue(prev => prev.filter(f => f.id !== file.id));

			// Remove any existing error for successful uploads
			if (!Error || axios.isCancel(Error)) {
				setUploadErrors(prev => {
					const newMap = new Map(prev);
					newMap.delete(file.id!);
					return newMap;
				});
			}
		}
	};

	// Simplified queue processing using useEffect
	const processUploadQueue = () => {
		// This will be handled by the useEffect hook
	};

	const uploadFiles = async (files: UploadedFile[]): Promise<void> => {
		// Simply add all files to the queue - useEffect will handle processing
		const filesToAdd = files.filter(
			file => !uploadQueue.some(queuedFile => queuedFile.id === file.id)
		);

		if (filesToAdd.length > 0) {
			setUploadQueue(prev => [...prev, ...filesToAdd]);
		}
	};

	const cancelUpload = (fileId: string): void => {
		const file = acceptedFiles.find(f => f.id === fileId);
		if (file?.cancelTokenSource) {
			file.cancelTokenSource.cancel("Upload cancelled by user");
		}

		// Remove from active uploads
		setActiveUploads(prev => {
			const newSet = new Set(prev);
			newSet.delete(fileId);
			return newSet;
		});

		// Remove from upload queue
		setUploadQueue(prev => prev.filter(f => f.id !== fileId));

		// Update file status
		setAcceptedFiles(prev =>
			prev.map(f => {
				if (f.id === fileId) {
					const updatedFile = f;
					updatedFile.status = "cancelled";
					return updatedFile;
				}
				return f;
			})
		);

		// Continue processing queue after cancellation
		setTimeout(() => processUploadQueue(), 100);
	};

	const retryUpload = (fileId: string): void => {
		const file = acceptedFiles.find(f => f.id === fileId);
		if (file && (file.status === "failed" || file.status === "cancelled")) {
			// Reset file status
			setAcceptedFiles(prev =>
				prev.map(f => {
					if (f.id === fileId) {
						const updatedFile = f;
						updatedFile.status = "pending";
						updatedFile.progress = 0;
						return updatedFile;
					}
					return f;
				})
			);

			// Add back to queue if not already there
			setUploadQueue(prev => {
				if (!prev.some(queuedFile => queuedFile.id === fileId)) {
					return [...prev, file];
				}
				return prev;
			});

			// Remove error
			setUploadErrors(prev => {
				const newMap = new Map(prev);
				newMap.delete(fileId);
				return newMap;
			});

			// Process queue
			setTimeout(() => processUploadQueue(), 100);
		}
	};

	const cancelAllUploads = (): void => {
		// Cancel all files that are currently uploading
		acceptedFiles.forEach(file => {
			if (file.id && activeUploads.has(file.id)) {
				const cancelTokenSource = file.cancelTokenSource;
				if (cancelTokenSource) {
					cancelTokenSource.cancel("All uploads cancelled by user");
				}
			}
		});

		// Clear all active uploads
		setActiveUploads(new Set());

		// Clear the upload queue
		setUploadQueue([]);

		// Update all uploading files to cancelled status
		setAcceptedFiles(prev =>
			prev.map(f => {
				if (f.status === "uploading" || f.status === "pending") {
					const updatedFile = f;
					updatedFile.status = "cancelled";
					return updatedFile;
				}
				return f;
			})
		);

		// Clear any upload errors
		setUploadErrors(new Map());
	};

	// ========================================================================
	// Modal Actions
	// ========================================================================

	const openUploader = (): void => {
		setIsUploaderOpen(true);
	};

	const closeUploader = (): void => {
		setIsUploaderOpen(false);
		// Clear files when closing
		clearAllFiles();
	};

	// ========================================================================
	// Configuration Actions
	// ========================================================================

	const updateUploadConfig = (config: Partial<UploadConfig>): void => {
		setUploadConfig(prev => ({ ...prev, ...config }));
	};

	// ========================================================================
	// Effects
	// ========================================================================

	// Generate preview URLs when files change
	useEffect(() => {
		const newPreviewUrls = new Map<string, string>();
		const newObjectUrls = new Set<string>();

		// Get current file keys
		const currentFileKeys = new Set([
			...acceptedFiles.map(getFileKey),
			...rejectedFiles.map(rejectedFile => getFileKey(rejectedFile.file))
		]);

		// Clean up old URLs that are no longer needed
		previewUrls.forEach((url, key) => {
			if (!currentFileKeys.has(key)) {
				URL.revokeObjectURL(url);
			}
		});

		// Process accepted files
		acceptedFiles.forEach(file => {
			if (isImageFile(file)) {
				const fileKey = getFileKey(file);
				const existingUrl = previewUrls.get(fileKey);

				if (existingUrl) {
					newPreviewUrls.set(fileKey, existingUrl);
					newObjectUrls.add(existingUrl);
				} else {
					const url = generatePreviewUrl(file);
					if (url) {
						newPreviewUrls.set(fileKey, url);
						newObjectUrls.add(url);
					}
				}
			}
		});

		// Process rejected files
		rejectedFiles.forEach(rejectedFile => {
			const file = rejectedFile.file;
			if (isImageFile(file)) {
				const fileKey = getFileKey(file);
				const existingUrl = previewUrls.get(fileKey);

				if (existingUrl) {
					newPreviewUrls.set(fileKey, existingUrl);
					newObjectUrls.add(existingUrl);
				} else {
					const url = generatePreviewUrl(file);
					if (url) {
						newPreviewUrls.set(fileKey, url);
						newObjectUrls.add(url);
					}
				}
			}
		});

		// Update refs and state
		objectUrlsRef.current = newObjectUrls;
		setPreviewUrls(newPreviewUrls);

		// Clear image load errors for files that are no longer present
		setImageLoadErrors(prev => {
			const newErrors = new Set<string>();
			prev.forEach(key => {
				if (currentFileKeys.has(key)) {
					newErrors.add(key);
				}
			});
			return newErrors;
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [acceptedFiles, rejectedFiles]);

	// Reset files when modal closes
	useEffect(() => {
		if (!isUploaderOpen) {
			setAcceptedFiles([]);
			setRejectedFiles([]);
		}
	}, [isUploaderOpen]);

	// Cleanup object URLs on unmount
	useEffect(() => {
		return () => {
			objectUrlsRef.current.forEach(url => {
				URL.revokeObjectURL(url);
			});
			objectUrlsRef.current.clear();
		};
	}, []);

	// ========================================================================
	// Effects
	// ========================================================================

	// Monitor upload completion
	useEffect(() => {
		// Check if all uploads are complete when activeUploads or acceptedFiles change
		if (activeUploads.size === 0 && uploadQueue.length === 0) {
			const allFiles = acceptedFiles.filter(
				file => file.status === "completed" || file.status === "failed"
			);

			if (allFiles.length > 0) {
				const successful = allFiles.filter(file => file.status === "completed").length;
				const failed = allFiles.filter(file => file.status === "failed").length;

				// Only set completion if we haven't already done so for this batch
				if (!uploadComplete && (successful > 0 || failed > 0)) {
					setUploadComplete({ successful, failed });

					// Remove uploaded files from the list after a short delay
					setTimeout(() => {
						setAcceptedFiles(prev =>
							prev.filter(file => file.status !== "completed" && file.status !== "failed")
						);
					}, 2000); // Give user time to see the success message
				}
			}
		}
	}, [activeUploads.size, uploadQueue.length, acceptedFiles, uploadComplete]);

	// Process upload queue whenever activeUploads or uploadQueue changes
	useEffect(() => {
		const processQueue = () => {
			// Only process if we have queue and available slots
			if (uploadQueue.length === 0 || activeUploads.size >= uploadConfig.maxConcurrentUploads) {
				return;
			}

			const pendingFiles = uploadQueue.filter(file => file.status === "pending");
			const availableSlots = uploadConfig.maxConcurrentUploads - activeUploads.size;
			const filesToUpload = pendingFiles.slice(0, availableSlots);

			if (filesToUpload.length > 0) {
				// Start uploads
				filesToUpload.forEach(file => {
					uploadFile(file);
				});
			}
		};

		// Process queue whenever activeUploads or uploadQueue changes
		const timeoutId = setTimeout(processQueue, 50);

		return () => clearTimeout(timeoutId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeUploads.size, uploadQueue.length, uploadConfig.maxConcurrentUploads]);

	// ========================================================================
	// Context Value
	// ========================================================================

	const contextValue: MediaContextType = {
		// State
		isUploaderOpen,
		acceptedFiles,
		rejectedFiles,
		uploadQueue,
		activeUploads,
		uploadErrors,
		uploadComplete,
		previewUrls,
		imageLoadErrors,
		uploadConfig,

		// Actions
		openUploader,
		closeUploader,
		addAcceptedFiles,
		addRejectedFiles,
		removeAcceptedFile,
		removeRejectedFile,
		clearAllFiles,
		uploadFiles,
		cancelUpload,
		cancelAllUploads,
		retryUpload,
		generatePreviewUrl,
		handleImageError,
		getPreviewUrl,
		formatFileSize,
		isImageFile,
		getFileKey,
		updateUploadConfig,
		clearUploadComplete: () => setUploadComplete(null)
	};

	return <MediaContext.Provider value={contextValue}>{children}</MediaContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

export function useMedia(): MediaContextType {
	const context = useContext(MediaContext);

	if (!context) {
		throw new Error("useMedia must be used within a MediaProvider");
	}

	return context;
}

// ============================================================================
// Export
// ============================================================================

export { MediaContext };
export type { MediaContextActions, MediaContextState, MediaContextType, UploadConfig };

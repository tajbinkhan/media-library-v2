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
			console.warn("Invalid file object:", file);
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
			console.error("Error creating object URL:", error);
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
		console.error("Failed to load image preview for:", file.name || "unknown file");
	};

	// ========================================================================
	// File Management Actions
	// ========================================================================

	const addAcceptedFiles = (files: File[]): void => {
		const newAcceptedFiles: UploadedFile[] = files.map(file => {
			// Create a new object with preserved file properties
			const uploadedFile: UploadedFile = {
				// Explicitly copy all File properties
				name: file.name,
				size: file.size,
				type: file.type,
				lastModified: file.lastModified,
				webkitRelativePath: (file as any).webkitRelativePath || "",

				// File methods - bind to original file
				stream: file.stream.bind(file),
				text: file.text.bind(file),
				arrayBuffer: file.arrayBuffer.bind(file),
				slice: file.slice.bind(file),

				// Our custom properties
				id: `${file.name || "unnamed"}-${Date.now()}-${Math.random()}`,
				status: "pending",
				progress: 0
			} as UploadedFile;

			// Set the prototype to File prototype so it behaves like a File
			Object.setPrototypeOf(uploadedFile, File.prototype);

			return uploadedFile;
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
			console.error("Invalid file object for upload - missing id:", file);
			return;
		}

		// Validate file properties
		if (!file.name || typeof file.name !== "string") {
			console.error("Invalid file object for upload - missing or invalid name:", file);
			return;
		}

		if (file.size === undefined || file.size === null) {
			console.warn("File size is undefined, but proceeding with upload:", file.name);
		}

		try {
			// Create cancel token
			const cancelTokenSource = axios.CancelToken.source();
			file.cancelTokenSource = cancelTokenSource;

			// Update file status to uploading
			setAcceptedFiles(prev =>
				prev.map(f => {
					if (f.id === file.id) {
						// Preserve the file object and just update our custom properties
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

			// Create form data - use the original file object for the actual upload
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
									// Preserve the file object and just update progress
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

			// Upload successful
			setAcceptedFiles(prev =>
				prev.map(f => {
					if (f.id === file.id) {
						// Preserve the file object and update status
						const updatedFile = f;
						updatedFile.status = "completed";
						updatedFile.progress = 100;
						updatedFile.uploadedUrl = response.data.url;
						updatedFile.serverId = response.data.id;
						return updatedFile;
					}
					return f;
				})
			);

			// Remove from active uploads
			setActiveUploads(prev => {
				const newSet = new Set(prev);
				newSet.delete(file.id!);
				return newSet;
			});

			// Remove any existing error
			setUploadErrors(prev => {
				const newMap = new Map(prev);
				newMap.delete(file.id!);
				return newMap;
			});
		} catch (error) {
			// Remove from active uploads
			setActiveUploads(prev => {
				const newSet = new Set(prev);
				newSet.delete(file.id!);
				return newSet;
			});

			if (axios.isCancel(error)) {
				// Upload was cancelled
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
				// Upload failed
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
		}
	};

	const processUploadQueue = async (): Promise<void> => {
		const pendingFiles = uploadQueue.filter(
			file => file.status === "pending" && !activeUploads.has(file.id!)
		);

		const availableSlots = uploadConfig.maxConcurrentUploads - activeUploads.size;
		const filesToUpload = pendingFiles.slice(0, availableSlots);

		// Upload files concurrently
		const uploadPromises = filesToUpload.map(file => uploadFile(file));
		await Promise.allSettled(uploadPromises);

		// Remove uploaded files from queue
		setUploadQueue(prev =>
			prev.filter(file => !filesToUpload.some(uploaded => uploaded.id === file.id))
		);

		// Continue processing if there are more files and available slots
		const remainingPending = uploadQueue.filter(
			file => file.status === "pending" && !filesToUpload.some(uploaded => uploaded.id === file.id)
		);

		if (remainingPending.length > 0 && activeUploads.size < uploadConfig.maxConcurrentUploads) {
			// Small delay to prevent overwhelming the server
			setTimeout(() => processUploadQueue(), 100);
		}
	};

	const uploadFiles = async (files: UploadedFile[]): Promise<void> => {
		// Add files to queue if not already there
		const newFiles = files.filter(
			file => !uploadQueue.some(queuedFile => queuedFile.id === file.id)
		);

		if (newFiles.length > 0) {
			setUploadQueue(prev => {
				const updatedQueue = [...prev, ...newFiles];
				// Process the queue after state update using the updated queue
				setTimeout(() => processUploadQueueWithFiles(updatedQueue), 0);
				return updatedQueue;
			});
		} else {
			// If no new files, process existing queue
			setTimeout(() => processUploadQueue(), 0);
		}
	};

	// Helper function to process queue with specific files
	const processUploadQueueWithFiles = async (queueFiles: UploadedFile[]): Promise<void> => {
		const pendingFiles = queueFiles.filter(
			file => file.status === "pending" && !activeUploads.has(file.id!)
		);

		const availableSlots = uploadConfig.maxConcurrentUploads - activeUploads.size;
		const filesToUpload = pendingFiles.slice(0, availableSlots);

		if (filesToUpload.length === 0) return;

		// Upload files concurrently
		const uploadPromises = filesToUpload.map(file => uploadFile(file));
		await Promise.allSettled(uploadPromises);

		// Remove uploaded files from queue
		setUploadQueue(prev =>
			prev.filter(file => !filesToUpload.some(uploaded => uploaded.id === file.id))
		);

		// Continue processing if there are more files and available slots
		const remainingPending = queueFiles.filter(
			file => file.status === "pending" && !filesToUpload.some(uploaded => uploaded.id === file.id)
		);

		if (remainingPending.length > 0 && activeUploads.size < uploadConfig.maxConcurrentUploads) {
			// Small delay to prevent overwhelming the server
			setTimeout(() => processUploadQueue(), 100);
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
	};

	const cancelAllUploads = (): void => {
		acceptedFiles.forEach(file => {
			if (file.id && activeUploads.has(file.id)) {
				cancelUpload(file.id);
			}
		});
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

			// Add back to queue
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
			processUploadQueue();
		}
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

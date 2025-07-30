// ============================================================================
// Media Upload Types
// ============================================================================

/**
 * Represents a file that has been uploaded or selected for upload
 * Extends the native File interface with additional properties
 */
interface UploadedFile extends File {
	/** Optional file path, may be provided by react-dropzone */
	path?: string;
	/** Unique identifier for the file */
	id?: string;
	/** Upload progress (0-100) */
	progress?: number;
	/** Upload status */
	status?: UploadStatus;
	/** Preview URL for image files */
	preview?: string;
	/** File metadata */
	metadata?: FileMetadata;
}

/**
 * Upload status enumeration
 */
type UploadStatus = "pending" | "uploading" | "completed" | "failed" | "cancelled";

/**
 * File metadata interface
 */
interface FileMetadata {
	/** File dimensions for images */
	dimensions?: {
		width: number;
		height: number;
	};
	/** File creation/modification dates */
	dates?: {
		created?: Date;
		modified?: Date;
		uploaded?: Date;
	};
	/** File tags/categories */
	tags?: string[];
	/** File description */
	description?: string;
	/** Alternative text for accessibility */
	alt?: string;
}

/**
 * Represents a file that was rejected during upload
 */
interface RejectedFile {
	/** The rejected file */
	file: UploadedFile;
	/** Array of validation errors */
	errors: FileError[];
}

/**
 * File validation error
 */
interface FileError {
	/** Error code (e.g., 'file-too-large', 'file-invalid-type') */
	code: string;
	/** Human-readable error message */
	message: string;
	/** Additional error details */
	details?: Record<string, any>;
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Props for MediaUploaderBox component
 */
interface MediaUploaderBoxProps {
	/** Callback when files are successfully accepted */
	onFilesAccepted: (files: File[]) => void;
	/** Callback when files are rejected */
	onFilesRejected: (rejectedFiles: RejectedFile[]) => void;
	/** Callback to close the uploader */
	onClose: () => void;
	/** Maximum file size allowed (in bytes) */
	maxFileSize?: number;
	/** Maximum number of files allowed */
	maxFiles?: number;
	/** Accepted file types */
	acceptedFileTypes?: Record<string, string[]>;
	/** Whether multiple files can be selected */
	multiple?: boolean;
	/** Custom validation function */
	validator?: (file: File) => FileError | null;
	/** Whether the uploader is disabled */
	disabled?: boolean;
	/** Custom class name */
	className?: string;
}

/**
 * Props for MediaUploadedItems component
 */
interface MediaUploadedItemsProps {
	/** Array of accepted files */
	acceptedFiles: UploadedFile[];
	/** Array of rejected files */
	rejectedFiles: RejectedFile[];
	/** Callback to remove an accepted file by index */
	onRemoveAcceptedFile: (index: number) => void;
	/** Callback to remove a rejected file by index */
	onRemoveRejectedFile: (index: number) => void;
	/** Callback to clear all files */
	onClearAll: () => void;
	/** Callback to retry uploading a file */
	onRetryFile?: (file: UploadedFile) => void;
	/** Callback to start upload process */
	onStartUpload?: (files: UploadedFile[]) => void;
	/** Whether files are currently being uploaded */
	isUploading?: boolean;
	/** Custom class name */
	className?: string;
}

/**
 * Props for MediaTemplate component
 */
interface MediaTemplateProps {
	/** Initial files to display */
	initialFiles?: UploadedFile[];
	/** Upload configuration */
	uploadConfig?: UploadConfig;
	/** Custom callbacks */
	callbacks?: MediaCallbacks;
	/** UI customization options */
	customization?: MediaCustomization;
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Upload configuration options
 */
interface UploadConfig {
	/** API endpoint for file upload */
	uploadEndpoint?: string;
	/** Maximum file size in bytes */
	maxFileSize?: number;
	/** Maximum number of files */
	maxFiles?: number;
	/** Accepted MIME types */
	acceptedTypes?: string[];
	/** Whether to allow multiple files */
	multiple?: boolean;
	/** Upload timeout in milliseconds */
	timeout?: number;
	/** Request headers */
	headers?: Record<string, string>;
	/** Additional form data */
	additionalData?: Record<string, any>;
}

/**
 * Callback functions for media operations
 */
interface MediaCallbacks {
	/** Called when upload starts */
	onUploadStart?: (files: UploadedFile[]) => void;
	/** Called during upload progress */
	onUploadProgress?: (file: UploadedFile, progress: number) => void;
	/** Called when upload completes successfully */
	onUploadSuccess?: (file: UploadedFile, response: any) => void;
	/** Called when upload fails */
	onUploadError?: (file: UploadedFile, error: Error) => void;
	/** Called when upload is cancelled */
	onUploadCancel?: (file: UploadedFile) => void;
	/** Called when files are selected */
	onFilesSelected?: (files: File[]) => void;
	/** Called when files are validated */
	onFilesValidated?: (accepted: UploadedFile[], rejected: RejectedFile[]) => void;
}

/**
 * UI customization options
 */
interface MediaCustomization {
	/** Custom theme colors */
	theme?: {
		primary?: string;
		success?: string;
		error?: string;
		warning?: string;
	};
	/** Custom text labels */
	labels?: {
		uploadTitle?: string;
		uploadDescription?: string;
		dropzoneText?: string;
		browseText?: string;
		acceptedFilesTitle?: string;
		rejectedFilesTitle?: string;
		clearAllText?: string;
		cancelText?: string;
		uploadButtonText?: string;
	};
	/** Custom icons */
	icons?: {
		upload?: React.ComponentType;
		success?: React.ComponentType;
		error?: React.ComponentType;
		file?: React.ComponentType;
		remove?: React.ComponentType;
	};
	/** Layout options */
	layout?: {
		compact?: boolean;
		showPreview?: boolean;
		showProgress?: boolean;
		showMetadata?: boolean;
	};
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * File size utility type
 */
type FileSizeUnit = "B" | "KB" | "MB" | "GB" | "TB";

/**
 * File size representation
 */
interface FileSize {
	value: number;
	unit: FileSizeUnit;
	bytes: number;
}

/**
 * Supported image formats
 */
type SupportedImageFormat =
	| "image/jpeg"
	| "image/jpg"
	| "image/png"
	| "image/gif"
	| "image/webp"
	| "image/svg+xml";

/**
 * File category types
 */
type FileCategory = "image" | "video" | "audio" | "document" | "archive" | "other";

/**
 * Upload event types
 */
type UploadEventType =
	| "file-added"
	| "file-removed"
	| "upload-started"
	| "upload-progress"
	| "upload-completed"
	| "upload-failed"
	| "upload-cancelled";

/**
 * Upload event data
 */
interface UploadEvent {
	type: UploadEventType;
	file: UploadedFile;
	progress?: number;
	error?: Error;
	timestamp: Date;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Standard API response for file upload
 */
interface UploadResponse {
	/** Whether the upload was successful */
	success: boolean;
	/** Uploaded file information */
	file?: {
		id: string;
		name: string;
		url: string;
		size: number;
		type: string;
		metadata?: FileMetadata;
	};
	/** Error information if upload failed */
	error?: {
		code: string;
		message: string;
		details?: any;
	};
	/** Response message */
	message?: string;
}

/**
 * Batch upload response
 */
interface BatchUploadResponse {
	/** Whether all uploads were successful */
	success: boolean;
	/** Individual upload results */
	results: UploadResponse[];
	/** Summary statistics */
	summary: {
		total: number;
		successful: number;
		failed: number;
	};
	/** Overall error message if any */
	error?: string;
}

// ============================================================================
// Hook Types
// ============================================================================

/**
 * Return type for useMediaUpload hook
 */
interface UseMediaUploadReturn {
	/** Current accepted files */
	acceptedFiles: UploadedFile[];
	/** Current rejected files */
	rejectedFiles: RejectedFile[];
	/** Whether uploader is open */
	isUploaderOpen: boolean;
	/** Whether upload is in progress */
	isUploading: boolean;
	/** Upload progress (0-100) */
	uploadProgress: number;
	/** Functions to control the uploader */
	actions: {
		openUploader: () => void;
		closeUploader: () => void;
		addFiles: (files: File[]) => void;
		removeAcceptedFile: (index: number) => void;
		removeRejectedFile: (index: number) => void;
		clearAllFiles: () => void;
		startUpload: () => Promise<void>;
		cancelUpload: () => void;
	};
}

/**
 * Hook options for useMediaUpload
 */
interface UseMediaUploadOptions {
	/** Upload configuration */
	config?: UploadConfig;
	/** Event callbacks */
	callbacks?: MediaCallbacks;
	/** Auto-start upload when files are added */
	autoUpload?: boolean;
	/** Validate files on selection */
	validateOnSelect?: boolean;
}

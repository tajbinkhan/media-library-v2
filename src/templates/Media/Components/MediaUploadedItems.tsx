"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import {
	AlertCircle,
	Check,
	File,
	FileImage,
	FileText,
	Loader2,
	Music,
	RotateCcw,
	Trash2,
	Video,
	X
} from "lucide-react";
import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import { useMedia } from "@/templates/Media/Contexts/MediaContext";

// Define component types locally
interface MediaUploadedItemsProps {
	acceptedFiles: UploadedFile[];
	rejectedFiles: RejectedFile[];
	onRemoveAcceptedFile: (index: number) => void;
	onRemoveRejectedFile: (index: number) => void;
	onClearAll: () => void;
	cancelUpload?: (fileId: string) => void;
	retryUpload?: (fileId: string) => void;
}

// Custom truncate function
const truncateFileName = (fileName: string, maxLength: number = 5) => {
	if (fileName.length <= maxLength) {
		return fileName;
	}

	// Show first part and last part with ellipsis in between
	const firstPart = fileName.substring(0, Math.floor(maxLength * 0.6));
	const lastPart = fileName.substring(fileName.length - Math.floor(maxLength * 0.3));

	return `${firstPart}...${lastPart}`;
};

// Get file type icon based on MIME type
const getFileTypeIcon = (file: File) => {
	if (!file || !file.type) {
		return <File className="h-5 w-5" />;
	}

	const mimeType = file.type.toLowerCase();

	if (mimeType.startsWith("image/")) {
		return <FileImage className="h-5 w-5" />;
	}
	if (mimeType.startsWith("video/")) {
		return <Video className="h-5 w-5" />;
	}
	if (mimeType.startsWith("audio/")) {
		return <Music className="h-5 w-5" />;
	}
	if (mimeType.includes("pdf")) {
		return <FileText className="h-5 w-5" />;
	}
	if (mimeType.includes("text/") || mimeType.includes("document")) {
		return <FileText className="h-5 w-5" />;
	}

	// Default file icon
	return <File className="h-5 w-5" />;
};

export default function MediaUploadedItems({
	acceptedFiles,
	rejectedFiles,
	onRemoveAcceptedFile,
	onRemoveRejectedFile,
	onClearAll,
	cancelUpload,
	retryUpload
}: MediaUploadedItemsProps) {
	// Get utility functions from context
	const {
		formatFileSize,
		isImageFile,
		getFileKey,
		getPreviewUrl,
		handleImageError: contextHandleImageError,
		imageLoadErrors,
		uploadErrors,
		activeUploads // <-- Added
	} = useMedia();

	// State to track additional image load errors locally
	const [localImageLoadErrors, setLocalImageLoadErrors] = useState<Set<string>>(new Set());

	// Local handle image error function
	const handleLocalImageError = useCallback(
		(file: File) => {
			const fileKey = getFileKey(file);
			setLocalImageLoadErrors(prev => new Set(prev).add(fileKey));
			contextHandleImageError(file);
		},
		[getFileKey, contextHandleImageError]
	);

	// Check if image has error (combine context and local errors)
	const hasImageError = useCallback(
		(file: File) => {
			const fileKey = getFileKey(file);
			return imageLoadErrors.has(fileKey) || localImageLoadErrors.has(fileKey);
		},
		[getFileKey, imageLoadErrors, localImageLoadErrors]
	);

	// Get status icon and color based on file status
	const getStatusIcon = (file: any) => {
		switch (file.status) {
			case "uploading":
				return <Loader2 className="h-3 w-3 animate-spin" />;
			case "completed":
				return <Check className="h-3 w-3" />;
			case "failed":
				return <X className="h-3 w-3" />;
			case "cancelled":
				return <X className="h-3 w-3" />;
			case "pending":
			default:
				return <Check className="h-3 w-3" />;
		}
	};

	const getStatusColor = (file: any) => {
		switch (file.status) {
			case "uploading":
				return "bg-blue-500 text-white";
			case "completed":
				return "bg-green-500 text-white";
			case "failed":
				return "bg-red-500 text-white";
			case "cancelled":
				return "bg-gray-500 text-white";
			case "pending":
			default:
				return "bg-orange-500 text-white";
		}
	};

	const getStatusBadge = (file: any) => {
		const status = file.status || "pending";
		const colors = {
			pending:
				"border-orange-300 bg-orange-100 text-orange-800 dark:border-orange-700 dark:bg-orange-900/50 dark:text-orange-200",
			uploading:
				"border-blue-300 bg-blue-100 text-blue-800 dark:border-blue-700 dark:bg-blue-900/50 dark:text-blue-200",
			completed:
				"border-green-300 bg-green-100 text-green-800 dark:border-green-700 dark:bg-green-900/50 dark:text-green-200",
			failed:
				"border-red-300 bg-red-100 text-red-800 dark:border-red-700 dark:bg-red-900/50 dark:text-red-200",
			cancelled:
				"border-gray-300 bg-gray-100 text-gray-800 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-200"
		};

		return colors[status as keyof typeof colors] || colors.pending;
	};

	// Get preview URL with error checking
	const getPreviewUrlSafe = useCallback(
		(file: File): string | null => {
			if (hasImageError(file)) return null;
			return getPreviewUrl(file);
		},
		[hasImageError, getPreviewUrl]
	);

	const removeFileExtension = (fileName: string) => {
		if (!fileName || typeof fileName !== "string") {
			return "unknown-file";
		}
		const lastDotIndex = fileName.lastIndexOf(".");
		return lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
	};

	// Responsive truncate based on screen size
	const getResponsiveTruncateLength = () => {
		// You can adjust these values based on your needs
		if (typeof window !== "undefined") {
			const width = window.innerWidth;
			if (width < 640) return 5; // sm
			if (width < 768) return 10; // md
			if (width < 1024) return 22; // lg
			return 22; // xl and above
		}
		return 22; // default for SSR
	};

	// Combine accepted and rejected files into a single list
	const allFiles = useMemo(
		() => [
			...acceptedFiles.map((file, index) => ({
				file,
				isAccepted: true,
				originalIndex: index,
				errors: undefined
			})),
			...rejectedFiles.map((rejectedFile, index) => ({
				file: rejectedFile.file,
				isAccepted: false,
				originalIndex: index,
				errors: rejectedFile.errors
			}))
		],
		[acceptedFiles, rejectedFiles]
	);

	// Filter out null files
	const validFiles = useMemo(() => {
		return allFiles.filter(item => item.file);
	}, [allFiles]);

	// Virtualization setup - use for large lists only
	const parentRef = useRef<HTMLDivElement>(null);
	const shouldUseVirtualization = validFiles.length > 20;

	const rowVirtualizer = useVirtualizer({
		count: validFiles.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 120, // Estimated height per item
		overscan: 5,
		enabled: shouldUseVirtualization
	});

	// Render individual file item
	const renderFileItem = useCallback(
		(
			item: { file: File; isAccepted: boolean; originalIndex: number; errors?: any[] },
			index: number
		) => {
			const { file, isAccepted, originalIndex, errors } = item;
			const uploadedFile = file as UploadedFile; // Cast to UploadedFile type

			const fileNameWithoutExtension = removeFileExtension(uploadedFile.name || "unknown-file");

			const truncatedFileName = truncateFileName(
				fileNameWithoutExtension,
				getResponsiveTruncateLength()
			);

			const isImage = isImageFile(uploadedFile);
			const previewUrl = getPreviewUrlSafe(uploadedFile);
			const fileTypeIcon = getFileTypeIcon(uploadedFile);

			// Get upload status and progress
			const uploadStatus = uploadedFile.status || "pending";
			const progress = uploadedFile.progress || 0;
			const fileId = uploadedFile.id;
			const uploadError = fileId ? uploadErrors.get(fileId) : null;

			return (
				<div
					key={`${uploadedFile.name || "unknown"}-${index}-${uploadedFile.size || 0}`}
					className={`flex w-full flex-col rounded-lg border p-3 transition-colors ${
						isAccepted
							? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20"
							: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
					}`}
				>
					{/* Main row with preview/icon and file info */}
					<div className="flex items-center justify-between">
						{/* Left section with preview/icon and file info */}
						<div className="flex min-w-0 flex-1 items-center space-x-3">
							{/* File preview or icon */}
							<div className="flex-shrink-0">
								{isImage && previewUrl ? (
									<div className="relative h-12 w-12 rounded-md border">
										<Image
											src={previewUrl}
											alt={`Preview of ${uploadedFile.name || "file"}`}
											fill
											className="object-cover"
											sizes="48px"
											unoptimized={true}
											onError={() => handleLocalImageError(uploadedFile)}
											onLoad={() => {
												// Remove from local error set if it loads successfully
												const fileKey = getFileKey(uploadedFile);
												setLocalImageLoadErrors(prev => {
													const newSet = new Set(prev);
													newSet.delete(fileKey);
													return newSet;
												});
											}}
										/>
										{/* Status overlay */}
										<div
											className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full ${getStatusColor(uploadedFile)}`}
										>
											{getStatusIcon(uploadedFile)}
										</div>
									</div>
								) : (
									<div className="relative">
										<div
											className={`flex h-12 w-12 items-center justify-center rounded-md border ${
												isAccepted
													? "border-green-200 bg-green-100 text-green-600 dark:border-green-700 dark:bg-green-900/50 dark:text-green-400"
													: "border-red-200 bg-red-100 text-red-600 dark:border-red-700 dark:bg-red-900/50 dark:text-red-400"
											}`}
										>
											{fileTypeIcon}
										</div>
										{/* Status overlay */}
										<div
											className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full ${getStatusColor(uploadedFile)}`}
										>
											{getStatusIcon(uploadedFile)}
										</div>
									</div>
								)}
							</div>
							<div className="min-w-0 flex-1">
								<div className="mb-1 flex items-center space-x-2">
									<p
										className={`text-sm font-medium ${
											isAccepted
												? "text-green-900 dark:text-green-100"
												: "text-red-900 dark:text-red-100"
										}`}
										title={uploadedFile.name || "Unknown file"} // Show full name on hover
									>
										{truncatedFileName}
									</p>
									<Badge
										variant="secondary"
										className={`flex-shrink-0 text-xs ${getStatusBadge(uploadedFile)}`}
									>
										{uploadStatus.charAt(0).toUpperCase() + uploadStatus.slice(1)}
									</Badge>
								</div>
								<div className="flex items-center space-x-2">
									<p
										className={`text-xs ${
											isAccepted
												? "text-green-600 dark:text-green-400"
												: "text-red-600 dark:text-red-400"
										}`}
									>
										{formatFileSize(uploadedFile.size || 0)}
									</p>
									<Badge variant="outline" className="text-xs whitespace-nowrap">
										{fileTypeIcon}
										<span className="ml-1">
											{uploadedFile.type ? uploadedFile.type.split("/")[1] || "File" : "File"}
										</span>
									</Badge>
									{uploadStatus === "uploading" && (
										<Badge variant="outline" className="text-xs">
											{progress}%
										</Badge>
									)}
								</div>
								{!isAccepted && errors && (
									<div className="mt-1 space-y-1">
										{errors.map((error: any) => (
											<div key={error.code} className="flex items-center space-x-1">
												<AlertCircle className="h-3 w-3 flex-shrink-0 text-red-500" />
												<span className="text-xs text-red-600 dark:text-red-400">
													{truncateFileName(error.message, 40)}
												</span>
											</div>
										))}
									</div>
								)}
								{isAccepted && uploadError && (
									<div className="mt-1 flex items-center space-x-1">
										<AlertCircle className="h-3 w-3 flex-shrink-0 text-red-500" />
										<span className="text-xs text-red-600 dark:text-red-400">{uploadError}</span>
									</div>
								)}
							</div>
						</div>

						{/* Right section with action buttons */}
						<div className="ml-3 flex flex-shrink-0 items-center space-x-2">
							{isAccepted && uploadStatus === "failed" && retryUpload && fileId && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => retryUpload(fileId)}
									className="h-8 w-8 p-0 text-orange-600 hover:bg-orange-100 hover:text-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/50"
									title="Retry upload"
								>
									<RotateCcw className="h-4 w-4" />
								</Button>
							)}
							{isAccepted && uploadStatus === "uploading" && cancelUpload && fileId && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => cancelUpload(fileId)}
									className="h-8 w-8 p-0 text-gray-600 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-900/50"
									title="Cancel upload"
								>
									<X className="h-4 w-4" />
								</Button>
							)}
							{uploadStatus !== "uploading" && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() =>
										isAccepted
											? onRemoveAcceptedFile(originalIndex)
											: onRemoveRejectedFile(originalIndex)
									}
									className={`h-8 w-8 p-0 ${
										isAccepted
											? "text-green-600 hover:bg-green-100 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/50"
											: "text-red-600 hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/50"
									}`}
									title="Remove file"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							)}
						</div>
					</div>

					{/* Progress bar for uploading files */}
					{isAccepted && uploadStatus === "uploading" && (
						<div className="mt-3">
							<Progress value={progress} className="w-full" />
						</div>
					)}
				</div>
			);
		},
		[
			isImageFile,
			getPreviewUrlSafe,
			formatFileSize,
			uploadErrors,
			handleLocalImageError,
			getFileKey,
			setLocalImageLoadErrors,
			onRemoveAcceptedFile,
			onRemoveRejectedFile,
			retryUpload,
			cancelUpload
		]
	);

	return (
		<div className="mx-auto w-full max-w-4xl space-y-6">
			{/* Header with Clear All button */}
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">Upload Results ({validFiles.length})</h3>
				<Button
					variant="outline"
					size="sm"
					onClick={onClearAll}
					className="text-muted-foreground hover:text-foreground bg-transparent"
					disabled={activeUploads.size > 0} // <-- Added
				>
					<Trash2 className="mr-2 h-4 w-4" />
					Clear All
				</Button>
			</div>

			{/* Single unified file list */}
			<Card className="pb-5">
				<CardHeader>
					<CardTitle className="flex flex-wrap items-center space-x-2">
						<File className="h-5 w-5" />
						<span>Files ({validFiles.length})</span>
						{acceptedFiles.length > 0 && (
							<Badge
								variant="secondary"
								className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
							>
								<Check className="mr-1 h-3 w-3" />
								{acceptedFiles.length} Accepted
							</Badge>
						)}
						{rejectedFiles.length > 0 && (
							<Badge
								variant="secondary"
								className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
							>
								<X className="mr-1 h-3 w-3" />
								{rejectedFiles.length} Rejected
							</Badge>
						)}
					</CardTitle>
					<CardDescription>Files ready for upload and rejected files</CardDescription>
				</CardHeader>
				<CardContent>
					<ScrollArea ref={parentRef} className="h-48 w-full">
						{shouldUseVirtualization ? (
							// Virtualized rendering for large lists
							<div
								style={{
									height: `${rowVirtualizer.getTotalSize()}px`,
									width: "100%",
									position: "relative"
								}}
							>
								{rowVirtualizer.getVirtualItems().map(virtualItem => (
									<div
										key={virtualItem.index}
										style={{
											position: "absolute",
											top: 0,
											left: 0,
											width: "100%",
											height: `${virtualItem.size}px`,
											transform: `translateY(${virtualItem.start}px)`,
											padding: "0.25rem"
										}}
									>
										{renderFileItem(validFiles[virtualItem.index], virtualItem.index)}
									</div>
								))}
							</div>
						) : (
							// Simple rendering for smaller lists
							<div className="space-y-3 p-1">
								{validFiles.map((item, index) => renderFileItem(item, index))}
							</div>
						)}
						<ScrollBar orientation="vertical" />
					</ScrollArea>
				</CardContent>
			</Card>
		</div>
	);
}

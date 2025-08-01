"use client";

import {
	Check,
	Copy,
	Download,
	File,
	FileImage,
	FileText,
	FileVideo,
	Music,
	Trash2
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import MediaDeleteAlert from "./MediaDeleteAlert";

// ============================================================================
// Component
// ============================================================================

export default function MediaPreviewModal({ item, onClose, refresh }: MediaPreviewModalProps) {
	// ========================================================================
	// State Management
	// ========================================================================

	const [copySuccess, setCopySuccess] = useState<string | null>(null);
	const [deleteItem, setDeleteItem] = useState<MediaItem | null>(null);

	// ========================================================================
	// Event Handlers
	// ========================================================================

	const handleCopyToClipboard = async (text: string, type: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopySuccess(type);
			setTimeout(() => setCopySuccess(null), 2000);
		} catch (error) {
			console.error("Failed to copy to clipboard:", error);
		}
	};

	const handleDownloadFile = (url: string, filename: string) => {
		const link = document.createElement("a");
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const handleDeleteStart = () => {
		if (item) {
			setDeleteItem(item);
		}
	};

	const handleDeleteSuccess = () => {
		refresh?.();
		onClose(); // Close the preview modal after successful deletion
	};

	const handleCloseDelete = () => {
		setDeleteItem(null);
	};
	// ========================================================================
	// Utility Functions
	// ========================================================================

	const formatFileSize = (bytes: number | undefined): string => {
		if (!bytes || bytes === 0) return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
	};

	const formatDate = (dateString: string | undefined): string => {
		if (!dateString) return "Unknown";
		try {
			return new Date(dateString).toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric"
			});
		} catch {
			return "Unknown";
		}
	};

	const getFileIcon = (type: string | undefined) => {
		if (!type) return <File className="h-6 w-6 text-gray-400" />;

		if (type.startsWith("image/")) return <FileImage className="h-6 w-6 text-blue-500" />;
		if (type.startsWith("video/")) return <FileVideo className="h-6 w-6 text-purple-500" />;
		if (type.startsWith("audio/")) return <Music className="h-6 w-6 text-green-500" />;
		if (type.includes("pdf") || type.includes("document"))
			return <FileText className="h-6 w-6 text-red-500" />;

		return <File className="h-6 w-6 text-gray-400" />;
	};

	const getFileTypeLabel = (type: string | undefined) => {
		if (!type) return "Unknown";

		const typeMap: Record<string, string> = {
			"image/jpeg": "JPEG",
			"image/png": "PNG",
			"image/gif": "GIF",
			"image/webp": "WebP",
			"video/mp4": "MP4",
			"video/mov": "MOV",
			"audio/mp3": "MP3",
			"audio/wav": "WAV",
			"application/pdf": "PDF"
		};

		return typeMap[type] || type.split("/")[1]?.toUpperCase() || "FILE";
	};

	const isImageFile = (type: string | undefined): boolean => {
		return Boolean(type && type.startsWith("image/"));
	};

	// ========================================================================
	// Render
	// ========================================================================

	if (!item) return null;

	const isImage = isImageFile(item.mimeType);

	return (
		<Dialog open={!!item} onOpenChange={onClose}>
			<DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center justify-between">
						<span className="truncate pr-4">{item.originalFilename}</span>
					</DialogTitle>
					<DialogDescription>
						{formatFileSize(item.fileSize)} • {getFileTypeLabel(item.mimeType)} •
						{item.width && item.height && ` ${item.width} × ${item.height} •`}
						{formatDate(item.createdAt)}
					</DialogDescription>
				</DialogHeader>

				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => handleCopyToClipboard(item.secureUrl, "url")}
						className="flex items-center gap-2"
					>
						{copySuccess === "url" ? (
							<Check className="h-4 w-4 text-green-500" />
						) : (
							<Copy className="h-4 w-4" />
						)}
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => handleDownloadFile(item.secureUrl, item.originalFilename)}
						className="flex items-center gap-2"
					>
						<Download className="h-4 w-4" />
					</Button>
					{refresh && (
						<Button
							variant="destructive"
							size="sm"
							onClick={handleDeleteStart}
							className="flex items-center gap-2"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					)}
				</div>

				<div className="mt-4">
					{isImage ? (
						<div className="relative max-h-[60vh] w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
							<Image
								src={item.secureUrl}
								alt={item.altText || item.originalFilename}
								width={item.width || 800}
								height={item.height || 600}
								className="h-auto max-h-[60vh] w-full object-contain"
								unoptimized={true}
								priority
							/>
						</div>
					) : (
						<div className="flex aspect-video w-full items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
							<div className="text-center">
								{getFileIcon(item.mimeType)}
								<p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-400">
									{getFileTypeLabel(item.mimeType)} File
								</p>
								<p className="text-sm text-gray-500 dark:text-gray-500">
									Preview not available for this file type
								</p>
							</div>
						</div>
					)}

					{/* File Details */}
					<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="space-y-3">
							<div>
								<Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
									Filename
								</Label>
								<p className="text-sm text-gray-900 dark:text-gray-100">
									{item.originalFilename.substring(0, 20) +
										(item.originalFilename.length > 20 ? "..." : "")}
								</p>
							</div>
							{item.altText && (
								<div>
									<Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
										Alt Text
									</Label>
									<p className="text-sm text-gray-900 dark:text-gray-100">{item.altText}</p>
								</div>
							)}
							{item.description && (
								<div>
									<Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
										Description
									</Label>
									<p className="text-sm text-gray-900 dark:text-gray-100">{item.description}</p>
								</div>
							)}
						</div>
						<div className="space-y-3">
							<div>
								<Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
									File Size
								</Label>
								<p className="text-sm text-gray-900 dark:text-gray-100">
									{formatFileSize(item.fileSize)}
								</p>
							</div>
							{item.width && item.height && (
								<div>
									<Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
										Dimensions
									</Label>
									<p className="text-sm text-gray-900 dark:text-gray-100">
										{item.width} × {item.height} pixels
									</p>
								</div>
							)}
							<div>
								<Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
									Created
								</Label>
								<p className="text-sm text-gray-900 dark:text-gray-100">
									{formatDate(item.createdAt)}
								</p>
							</div>
						</div>
					</div>
				</div>
			</DialogContent>

			{/* Delete Confirmation Modal */}
			<MediaDeleteAlert
				item={deleteItem}
				onClose={handleCloseDelete}
				onSuccess={handleDeleteSuccess}
			/>
		</Dialog>
	);
}

// ============================================================================
// Export
// ============================================================================

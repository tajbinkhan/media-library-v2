"use client";

import { useMediaDownload } from "../Hooks/useMediaDownload";
import {
	Calendar,
	Check,
	Copy,
	Download,
	Edit3,
	Eye,
	File,
	FileImage,
	FileText,
	FileVideo,
	Loader2,
	Music,
	Trash2
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import MediaDeleteAlert from "./MediaDeleteAlert";
import MediaEditModal from "./MediaEditModal";
import MediaPreviewModal from "./MediaPreviewModal";

// ============================================================================
// Component
// ============================================================================

export default function MediaSingleView({
	item,
	isSelected,
	onItemDelete,
	refresh
}: MediaSingleViewProps) {
	// ========================================================================
	// State Management
	// ========================================================================

	const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
	const [editItem, setEditItem] = useState<MediaItem | null>(null);
	const [deleteItem, setDeleteItem] = useState<MediaItem | null>(null);
	const [copySuccess, setCopySuccess] = useState<string | null>(null);

	// Download hook
	const { downloadState, download } = useMediaDownload();

	// ========================================================================
	// Event Handlers
	// ========================================================================

	const handleItemClick = () => {
		setPreviewItem(item);
	};

	const handleEditStart = () => {
		setEditItem(item);
	};

	const handleDeleteStart = () => {
		setDeleteItem(item);
	};

	const handleDeleteSuccess = () => {
		refresh();
	};

	const handleCloseDelete = () => {
		setDeleteItem(null);
	};

	const handleCopyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopySuccess(`item-${item.id}`);
			setTimeout(() => setCopySuccess(null), 2000);
		} catch (error) {
			console.error("Failed to copy to clipboard:", error);
		}
	};

	const handleDownloadFile = async (mediaItem: MediaItem) => {
		await download(mediaItem);
	};

	const handleEditSave = () => {
		setEditItem(null);
		refresh();
	};

	const handleEditCancel = () => {
		setEditItem(null);
	};

	const handleClosePreview = () => {
		setPreviewItem(null);
	};

	const handleCloseEdit = () => {
		setEditItem(null);
	};

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

	const isImage = isImageFile(item.mimeType);
	const fileIcon = getFileIcon(item.mimeType);
	const fileTypeLabel = getFileTypeLabel(item.mimeType);

	return (
		<>
			<Card
				className={`group relative transform cursor-pointer overflow-hidden border py-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-gray-700 ${
					isSelected
						? "border-blue-200 ring-2 shadow-blue-100 ring-blue-500 dark:border-blue-600 dark:shadow-blue-900/50"
						: "border-gray-200 bg-white shadow-sm hover:border-gray-300 dark:bg-gray-900 dark:hover:border-gray-600"
				}`}
				onClick={handleItemClick}
			>
				<CardContent className="p-0">
					{/* Media Preview */}
					<div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
						{isImage && item.secureUrl ? (
							<>
								<Image
									src={item.secureUrl}
									alt={item.altText || item.originalFilename || "Media file"}
									fill
									className="object-cover transition-all duration-500 group-hover:scale-105"
									sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16.67vw"
									unoptimized={true}
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
							</>
						) : (
							<div className="flex h-full items-center justify-center">
								<div className="p-6 text-center">
									<div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg dark:bg-gray-800">
										{fileIcon}
									</div>
									<Badge variant="secondary" className="px-2 py-1 text-xs font-medium">
										{fileTypeLabel}
									</Badge>
								</div>
							</div>
						)}

						{/* Quick Actions Overlay */}
						<div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
							<div className="flex gap-2">
								<Button
									size="sm"
									variant="secondary"
									className="h-8 w-8 bg-white/90 p-0 hover:bg-white dark:bg-gray-900/90 dark:hover:bg-gray-900"
									onClick={(e: React.MouseEvent) => {
										e.stopPropagation();
										handleItemClick();
									}}
								>
									<Eye className="h-4 w-4" />
								</Button>
								<Button
									size="sm"
									variant="secondary"
									className="h-8 w-8 bg-white/90 p-0 hover:bg-white dark:bg-gray-900/90 dark:hover:bg-gray-900"
									onClick={(e: React.MouseEvent) => {
										e.stopPropagation();
										handleCopyToClipboard(item.secureUrl);
									}}
								>
									{copySuccess === `item-${item.id}` ? (
										<Check className="h-4 w-4 text-green-500" />
									) : (
										<Copy className="h-4 w-4" />
									)}
								</Button>
								<Button
									size="sm"
									variant="secondary"
									className="h-8 w-8 bg-white/90 p-0 hover:bg-white dark:bg-gray-900/90 dark:hover:bg-gray-900"
									onClick={(e: React.MouseEvent) => {
										e.stopPropagation();
										handleDownloadFile(item);
									}}
									disabled={
										downloadState.isDownloading && downloadState.downloadingFileId === item.id
									}
									title={
										downloadState.isDownloading && downloadState.downloadingFileId === item.id
											? `Downloading... ${downloadState.progress}%`
											: "Download file"
									}
								>
									{downloadState.isDownloading && downloadState.downloadingFileId === item.id ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Download className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>

						{/* Selection indicator */}
						{isSelected && (
							<div className="absolute top-3 left-3">
								<div className="rounded-full bg-blue-500 p-1 text-white shadow-lg">
									<Check className="h-4 w-4" />
								</div>
							</div>
						)}

						{/* Delete Button */}
						<div className="absolute top-3 right-3 opacity-0 transition-all duration-200 group-hover:opacity-100">
							<Button
								variant="destructive"
								size="sm"
								className="h-8 w-8 p-0 shadow-lg"
								onClick={(e: React.MouseEvent) => {
									e.stopPropagation();
									handleDeleteStart();
								}}
								title="Delete file"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>

						{/* File type badge for non-images */}
						{!isImage && (
							<div className="absolute bottom-3 left-3">
								<Badge
									variant="secondary"
									className="bg-white/90 text-xs font-medium dark:bg-gray-900/90"
								>
									{fileTypeLabel}
								</Badge>
							</div>
						)}
					</div>

					{/* Enhanced File Info */}
					<div className="bg-white p-4 dark:bg-gray-900">
						<div className="mb-2 flex items-start justify-between">
							<div className="min-w-0 flex-1">
								<h4
									className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100"
									title={item.originalFilename || "Unknown file"}
								>
									{item.originalFilename || "Unknown file"}
								</h4>
								{item.altText && (
									<p
										className="truncate text-xs text-gray-500 dark:text-gray-400"
										title={item.altText}
									>
										{item.altText}
									</p>
								)}
							</div>
							{/* Edit Button */}
							<Button
								variant="ghost"
								size="sm"
								className="h-6 w-6 flex-shrink-0 p-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
								onClick={(e: React.MouseEvent) => {
									e.stopPropagation();
									handleEditStart();
								}}
								title="Edit details"
							>
								<Edit3 className="h-3 w-3 text-gray-400 hover:text-orange-500" />
							</Button>
						</div>

						<div className="flex items-center justify-between text-xs">
							<div className="flex flex-col gap-1">
								<span className="font-medium text-gray-600 dark:text-gray-400">
									{formatFileSize(item.fileSize)}
								</span>
								{item.width && item.height && (
									<span className="text-gray-500 dark:text-gray-500">
										{item.width} × {item.height}
									</span>
								)}
							</div>
							<span className="flex items-center text-gray-400 dark:text-gray-500">
								<Calendar className="mr-1 h-3 w-3" />
								{formatDate(item.createdAt)}
							</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Modal Components */}
			<MediaPreviewModal item={previewItem} onClose={handleClosePreview} refresh={refresh} />
			<MediaEditModal
				item={editItem}
				onClose={handleCloseEdit}
				onSave={handleEditSave}
				onCancel={handleEditCancel}
			/>
			<MediaDeleteAlert
				item={deleteItem}
				onClose={handleCloseDelete}
				onSuccess={handleDeleteSuccess}
			/>
		</>
	);
}

// ============================================================================
// Export
// ============================================================================

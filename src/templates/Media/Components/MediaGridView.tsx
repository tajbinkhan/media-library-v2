"use client";

import { Calendar, FileImage, Grid3X3, HardDrive, Search, Trash2, Upload } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import MediaSingleView from "./MediaSingleView";
import { apiRoute } from "@/routes/routes";
import useCustomSWR from "@/templates/Media/Hooks/useCustomSWR";

// ============================================================================
// Types
// ============================================================================

interface MediaListResponse {
	data: MediaItem[];
	pagination?: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		limit: number;
		hasNextPage: boolean;
		hasPrevPage: boolean;
	};
}

interface MediaGridViewProps {
	onItemSelect?: (item: MediaItem) => void;
	onItemDelete?: (item: MediaItem) => void;
	onUpload?: () => void;
	className?: string;
}

// ============================================================================
// Component
// ============================================================================

export default function MediaGridView({
	onItemSelect,
	onItemDelete,
	onUpload,
	className = ""
}: MediaGridViewProps) {
	const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
	const [searchQuery, setSearchQuery] = useState("");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

	// Fetch media list using SWR
	const {
		data: response,
		error,
		isLoading,
		refresh
	} = useCustomSWR<MediaListResponse>(apiRoute.media);

	// ========================================================================
	// Utility Functions
	// ========================================================================

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

	const isImageFile = (type: string | undefined): boolean => {
		return Boolean(type && type.startsWith("image/"));
	};

	// ========================================================================
	// Event Handlers
	// ========================================================================

	const handleItemDelete = (item: MediaItem) => {
		if (onItemDelete) {
			onItemDelete(item);
		}
	};

	const toggleItemSelection = (itemId: number) => {
		setSelectedItems(prev => {
			const newSelection = new Set(prev);
			if (newSelection.has(itemId)) {
				newSelection.delete(itemId);
			} else {
				newSelection.add(itemId);
			}
			return newSelection;
		});
	};

	// ========================================================================
	// Render Functions
	// ========================================================================

	const renderLoadingSkeleton = () => (
		<div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
			{Array.from({ length: 12 }).map((_, index) => (
				<Card
					key={index}
					className="group overflow-hidden border-0 bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm transition-all duration-300 hover:shadow-md dark:from-gray-900 dark:to-gray-800"
				>
					<CardContent className="p-0">
						<div className="relative">
							<Skeleton className="aspect-square w-full rounded-t-lg" />
							<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
						</div>
						<div className="space-y-3 p-4">
							<Skeleton className="h-4 w-full" />
							<div className="flex items-center justify-between">
								<Skeleton className="h-3 w-12" />
								<Skeleton className="h-3 w-16" />
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);

	const renderEmptyState = () => (
		<div className="flex flex-col items-center justify-center py-20 text-center">
			<div className="mb-6 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 p-6 dark:from-blue-900/20 dark:to-indigo-900/20">
				<HardDrive className="h-12 w-12 text-blue-500" />
			</div>
			<h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
				No media files yet
			</h3>
			<p className="mb-6 max-w-md text-sm text-gray-500 dark:text-gray-400">
				Start building your media library by uploading your first files. Drag and drop or click the
				upload button to get started.
			</p>
			<Button
				onClick={onUpload}
				className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
			>
				<Upload className="mr-2 h-4 w-4" />
				Upload Your First File
			</Button>
		</div>
	);

	const renderErrorState = () => (
		<div className="flex flex-col items-center justify-center py-20 text-center">
			<div className="mb-6 rounded-full bg-gradient-to-br from-red-50 to-red-100 p-6 dark:from-red-900/20 dark:to-red-900/20">
				<Trash2 className="h-12 w-12 text-red-500" />
			</div>
			<h3 className="mb-3 text-xl font-semibold text-red-900 dark:text-red-100">
				Unable to load media files
			</h3>
			<p className="mb-6 max-w-md text-sm text-red-600 dark:text-red-400">
				{error?.message ||
					"Something went wrong while fetching your media files. Please try again."}
			</p>
			<Button
				onClick={refresh}
				variant="outline"
				className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
			>
				Try Again
			</Button>
		</div>
	);

	const renderMediaItem = (item: MediaItem) => {
		const isSelected = selectedItems.has(item.id);

		return (
			<MediaSingleView
				key={item.id}
				item={item}
				isSelected={isSelected}
				onItemDelete={handleItemDelete}
				refresh={refresh}
			/>
		);
	};

	// ========================================================================
	// Main Render
	// ========================================================================

	const mediaItems = response?.data || [];
	const filteredItems = mediaItems.filter(
		item => !searchQuery || item.originalFilename?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className={`w-full ${className}`}>
			{/* Enhanced Header */}
			<div className="mb-8">
				<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h2 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-3xl font-bold text-transparent dark:from-gray-100 dark:to-gray-400">
							Media Library
						</h2>
						<p className="mt-1 text-gray-500 dark:text-gray-400">
							{isLoading ? (
								<span className="flex items-center">
									<span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-b-2 border-blue-500"></span>
									Loading media files...
								</span>
							) : (
								`${filteredItems.length} of ${mediaItems.length} media ${mediaItems.length === 1 ? "file" : "files"}`
							)}
						</p>
					</div>

					<div className="flex items-center gap-3">
						{/* Search */}
						<div className="relative">
							<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
							<Input
								placeholder="Search files..."
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								className="w-64 border-gray-200 bg-white pl-10 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:focus:border-blue-400"
							/>
						</div>

						{/* View Toggle */}
						<div className="flex items-center rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
							<Button
								variant={viewMode === "grid" ? "default" : "ghost"}
								size="sm"
								onClick={() => setViewMode("grid")}
								className="h-8 px-3"
							>
								<Grid3X3 className="h-4 w-4" />
							</Button>
						</div>

						{/* Upload Button */}
						{onUpload && (
							<Button
								onClick={onUpload}
								variant="default"
								size="sm"
								className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
							>
								<Upload className="mr-2 h-4 w-4" />
								Upload
							</Button>
						)}

						{/* Refresh Button */}
						{mediaItems.length > 0 && (
							<Button
								onClick={refresh}
								variant="outline"
								size="sm"
								disabled={isLoading}
								className="border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
							>
								<div className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}>🔄</div>
								Refresh
							</Button>
						)}
					</div>
				</div>

				{/* Stats Bar */}
				{mediaItems.length > 0 && (
					<div className="flex items-center gap-4 rounded-lg bg-gray-50 px-4 py-2 text-sm text-gray-500 dark:bg-gray-900/50 dark:text-gray-400">
						<span className="flex items-center">
							<HardDrive className="mr-1 h-4 w-4" />
							{mediaItems.length} files
						</span>
						<span className="flex items-center">
							<FileImage className="mr-1 h-4 w-4 text-blue-500" />
							{mediaItems.filter(item => isImageFile(item.mimeType)).length} images
						</span>
						<span className="flex items-center">
							<Calendar className="mr-1 h-4 w-4" />
							Updated {formatDate(mediaItems[0]?.updatedAt)}
						</span>
					</div>
				)}
			</div>

			{/* Content */}
			{isLoading ? (
				renderLoadingSkeleton()
			) : error ? (
				renderErrorState()
			) : filteredItems.length === 0 ? (
				searchQuery ? (
					<div className="flex flex-col items-center justify-center py-20 text-center">
						<div className="mb-6 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 p-6 dark:from-gray-900/20 dark:to-gray-800/20">
							<Search className="h-12 w-12 text-gray-400" />
						</div>
						<h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
							No results found
						</h3>
						<p className="mb-6 max-w-md text-sm text-gray-500 dark:text-gray-400">
							No files match your search for &ldquo;{searchQuery}&rdquo;. Try adjusting your search
							terms.
						</p>
						<Button onClick={() => setSearchQuery("")} variant="outline">
							Clear Search
						</Button>
					</div>
				) : (
					renderEmptyState()
				)
			) : (
				<div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
					{filteredItems.map(renderMediaItem)}
				</div>
			)}

			{/* Pagination */}
			{response?.pagination && response.pagination.totalPages > 1 && (
				<div className="mt-8 flex items-center justify-center space-x-2">
					<p className="text-muted-foreground text-sm">
						Page {response.pagination.currentPage} of {response.pagination.totalPages}(
						{response.pagination.totalItems} total items)
					</p>
				</div>
			)}
		</div>
	);
}

// ============================================================================
// Export
// ============================================================================

export type { MediaGridViewProps };

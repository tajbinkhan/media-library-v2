"use client";

import { FileText, Film, Image as ImageIcon, Music, X } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";

interface MediaPreviewProps {
	item: MediaItem | null;
	onRemove?: () => void;
	className?: string;
}

export default function MediaPreview({ item, onRemove, className = "" }: MediaPreviewProps) {
	if (!item) {
		return null;
	}

	const isImage = item.mimeType?.startsWith("image/");
	const isVideo = item.mimeType?.startsWith("video/");
	const isAudio = item.mimeType?.startsWith("audio/");
	const isPdf = item.mimeType?.includes("pdf");

	const getFileIcon = () => {
		if (isVideo) return <Film className="h-6 w-6 text-blue-600" />;
		if (isAudio) return <Music className="h-6 w-6 text-green-600" />;
		if (isPdf) return <FileText className="h-6 w-6 text-red-600" />;
		return <ImageIcon className="h-6 w-6 text-purple-600" />;
	};

	const getFileExtension = (filename: string) => {
		return filename.split(".").pop()?.toUpperCase() || "";
	};

	return (
		<div className={`group relative ${className}`}>
			<div className="relative aspect-square w-full rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
				{isImage && item.secureUrl ? (
					<Image
						src={item.secureUrl}
						alt={item.altText || item.filename || "Selected media"}
						fill
						className="rounded-xl object-cover"
						sizes="120px"
						unoptimized={true}
					/>
				) : (
					<div className="flex h-full flex-col items-center justify-center p-3">
						<div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-700">
							{getFileIcon()}
						</div>
						<div className="text-center">
							<div className="mb-1 text-xs font-medium text-gray-900 dark:text-gray-100">
								{getFileExtension(item.filename || "")}
							</div>
							<p className="max-w-full truncate text-xs text-gray-500 dark:text-gray-400">
								{item.filename}
							</p>
						</div>
					</div>
				)}

				{/* Remove Button */}
				{onRemove && (
					<Button
						variant="ghost"
						size="sm"
						className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 p-0 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-red-600"
						onClick={onRemove}
					>
						<X size={12} />
					</Button>
				)}
			</div>
		</div>
	);
}

/**
 * Example component demonstrating the media download functionality
 * This shows how to use the download utilities and hooks
 */
import { useMediaDownload } from "../Hooks/useMediaDownload";
import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface MediaDownloadExampleProps {
	mediaItem: MediaItem;
}

export default function MediaDownloadExample({ mediaItem }: MediaDownloadExampleProps) {
	const { downloadState, download, clearDownloadState } = useMediaDownload();

	const handleDownload = async () => {
		await download(mediaItem);
	};

	const isDownloading =
		downloadState.isDownloading && downloadState.downloadingFileId === mediaItem.id;

	return (
		<div className="rounded-lg border p-4">
			<h3 className="mb-4 text-lg font-semibold">Download Example</h3>

			{/* Basic Download Button */}
			<div className="mb-4">
				<Button
					onClick={handleDownload}
					disabled={isDownloading}
					className="flex items-center gap-2"
				>
					{isDownloading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Download className="h-4 w-4" />
					)}
					{isDownloading ? "Downloading..." : "Download File"}
				</Button>
			</div>

			{/* Progress Information */}
			{isDownloading && (
				<div className="mb-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
					<div className="mb-2 flex items-center justify-between">
						<span className="text-sm font-medium">Download Progress</span>
						<span className="text-sm">{downloadState.progress}%</span>
					</div>
					<div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
						<div
							className="h-2 rounded-full bg-blue-600 transition-all duration-300"
							style={{ width: `${downloadState.progress}%` }}
						/>
					</div>
				</div>
			)}

			{/* Error Display */}
			{downloadState.error && (
				<div className="mb-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
					<div className="flex items-center justify-between">
						<span className="text-sm text-red-600 dark:text-red-400">{downloadState.error}</span>
						<Button
							variant="ghost"
							size="sm"
							onClick={clearDownloadState}
							className="text-red-600 hover:text-red-700 dark:text-red-400"
						>
							Dismiss
						</Button>
					</div>
				</div>
			)}

			{/* File Information */}
			<div className="text-sm text-gray-600 dark:text-gray-400">
				<div>File: {mediaItem.originalFilename}</div>
				<div>Size: {(mediaItem.fileSize / 1024 / 1024).toFixed(2)} MB</div>
				<div>Type: {mediaItem.mimeType}</div>
			</div>
		</div>
	);
}

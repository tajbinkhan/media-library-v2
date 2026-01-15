/**
 * Hook for managing media file downloads
 * Provides state management and progress tracking for downloads
 */
import { downloadMediaFile } from "../Utils/downloadUtils";
import { useCallback, useState } from "react";

interface DownloadState {
	/** Whether a download is in progress */
	isDownloading: boolean;
	/** Download progress (0-100) */
	progress: number;
	/** Download error if any */
	error: string | null;
	/** ID of the currently downloading file */
	downloadingFileId: string | null;
}

interface UseMediaDownloadReturn {
	/** Current download state */
	downloadState: DownloadState;
	/** Function to start a download */
	download: (mediaItem: MediaItem) => Promise<void>;
	/** Function to clear download state */
	clearDownloadState: () => void;
}

/**
 * Hook for managing media file downloads
 */
export function useMediaDownload(): UseMediaDownloadReturn {
	const [downloadState, setDownloadState] = useState<DownloadState>({
		isDownloading: false,
		progress: 0,
		error: null,
		downloadingFileId: null
	});

	const download = useCallback(async (mediaItem: MediaItem) => {
		try {
			setDownloadState({
				isDownloading: true,
				progress: 0,
				error: null,
				downloadingFileId: mediaItem.secureUrl
			});

			await downloadMediaFile(
				{
					publicId: mediaItem.publicId,
					originalFilename: mediaItem.originalFilename,
					secureUrl: mediaItem.secureUrl
				},
				{
					onProgress: progress => {
						setDownloadState(prev => ({
							...prev,
							progress
						}));
					},
					onComplete: () => {
						setDownloadState(prev => ({
							...prev,
							isDownloading: false,
							progress: 100
						}));

						// Clear state after a short delay
						setTimeout(() => {
							setDownloadState({
								isDownloading: false,
								progress: 0,
								error: null,
								downloadingFileId: null
							});
						}, 2000);
					},
					onError: error => {
						setDownloadState(prev => ({
							...prev,
							isDownloading: false,
							error: error.message,
							downloadingFileId: null
						}));
					}
				}
			);
		} catch (error) {
			setDownloadState(prev => ({
				...prev,
				isDownloading: false,
				error: error instanceof Error ? error.message : "Download failed",
				downloadingFileId: null
			}));
		}
	}, []);

	const clearDownloadState = useCallback(() => {
		setDownloadState({
			isDownloading: false,
			progress: 0,
			error: null,
			downloadingFileId: null
		});
	}, []);

	return {
		downloadState,
		download,
		clearDownloadState
	};
}

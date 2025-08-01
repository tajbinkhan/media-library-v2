"use client";

import { useCallback, useRef } from "react";

import MediaGridView from "@/templates/Media/Components/MediaGridView";
import MediaUploaderBox from "@/templates/Media/Components/MediaUploaderBox";
import { useMedia } from "@/templates/Media/Contexts/MediaContext";

export default function MediaTemplate() {
	const { isUploaderOpen, openUploader, closeUploader, setRefreshCallback } = useMedia();

	// Create a ref to hold the refresh function
	const refreshRef = useRef<(() => void) | null>(null);

	// Stable callback that won't change on re-renders
	const handleRefreshRegistration = useCallback(
		(refreshFn: () => void) => {
			if (refreshRef.current !== refreshFn) {
				refreshRef.current = refreshFn;
				setRefreshCallback(refreshFn);
			}
		},
		[setRefreshCallback]
	);
	const handleItemSelect = (item: MediaItem) => {
		// Handle item selection - could open a preview modal, etc.
		console.log("Selected item:", item);
	};

	const handleItemDelete = (item: MediaItem) => {
		// Delete functionality is now handled within MediaSingleView component
		// This handler can be used for additional logic if needed
		console.log("Delete item:", item);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
			<div className="container mx-auto px-4 pt-8">
				{/* Media Grid View */}
				<div className="relative">
					<MediaGridView
						onItemSelect={handleItemSelect}
						onItemDelete={handleItemDelete}
						onUpload={openUploader}
						onRegisterRefresh={handleRefreshRegistration}
					/>
				</div>
			</div>

			{/* Upload Modal */}
			<MediaUploaderBox isOpen={isUploaderOpen} onClose={closeUploader} />
		</div>
	);
}

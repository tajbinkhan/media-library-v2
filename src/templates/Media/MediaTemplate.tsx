"use client";

import MediaGridView from "@/templates/Media/Components/MediaGridView";
import MediaUploaderBox from "@/templates/Media/Components/MediaUploaderBox";
import { useMedia } from "@/templates/Media/Contexts/MediaContext";

export default function MediaTemplate() {
	const { isUploaderOpen, openUploader, closeUploader } = useMedia();

	const handleItemSelect = (item: MediaItem) => {
		// Handle item selection - could open a preview modal, etc.
		console.log("Selected item:", item);
	};

	const handleItemDelete = (item: MediaItem) => {
		// Handle item deletion - could show confirmation dialog
		console.log("Delete item:", item);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
			<div className="container mx-auto px-4 py-8">
				{/* Media Grid View */}
				<div className="relative">
					<MediaGridView
						onItemSelect={handleItemSelect}
						onItemDelete={handleItemDelete}
						onUpload={openUploader}
					/>
				</div>
			</div>

			{/* Upload Modal */}
			<MediaUploaderBox isOpen={isUploaderOpen} onClose={closeUploader} />
		</div>
	);
}

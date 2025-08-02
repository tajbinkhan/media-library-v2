"use client";

import MediaGridView from "@/templates/Media/Components/MediaGridView";
import MediaUploaderBox from "@/templates/Media/Components/MediaUploaderBox";
import { useMedia } from "@/templates/Media/Contexts/MediaContext";

export default function MediaTemplate() {
	const { isUploaderOpen, openUploader, closeUploader } = useMedia();

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
			<div className="container mx-auto px-4 pt-8">
				{/* Media Grid View */}
				<div className="relative">
					<MediaGridView onUpload={openUploader} />
				</div>
			</div>

			{/* Upload Modal */}
			<MediaUploaderBox isOpen={isUploaderOpen} onClose={closeUploader} />
		</div>
	);
}

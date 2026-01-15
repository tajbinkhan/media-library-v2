"use client";

import MediaGridView from "@/templates/Media/Components/MediaGridView";
import MediaUploaderBox from "@/templates/Media/Components/MediaUploaderBox";
import { useMedia } from "@/templates/Media/Contexts/MediaContext";

export default function MediaTemplate() {
	const { isUploaderOpen, openUploader, closeUploader } = useMedia();

	return (
		<div className="min-h-screen">
			<div className="container mx-auto">
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

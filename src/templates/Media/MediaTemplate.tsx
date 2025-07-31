"use client";

import { Plus, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import MediaUploaderBox from "@/templates/Media/Components/MediaUploaderBox";
import { useMedia } from "@/templates/Media/Contexts/MediaContext";

export default function MediaTemplate() {
	const { isUploaderOpen, openUploader, closeUploader } = useMedia();

	return (
		<div className="space-y-6">
			<Card className="mx-auto w-full max-w-4xl">
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Upload className="h-5 w-5" />
						<span>Media Library</span>
					</CardTitle>
					<CardDescription>
						Manage your media files. Upload new images to get started.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center space-y-4 py-8">
						<div className="bg-muted text-muted-foreground rounded-full p-4">
							<Plus className="h-8 w-8" />
						</div>
						<div className="space-y-2 text-center">
							<h3 className="text-lg font-medium">Upload Media Files</h3>
							<p className="text-muted-foreground max-w-md text-sm">
								Click the button below to start uploading your images. Only JPEG and PNG files are
								supported.
							</p>
						</div>
						<Button onClick={openUploader} className="mt-4">
							<Upload className="mr-2 h-4 w-4" />
							Upload Files
						</Button>
					</div>
				</CardContent>
			</Card>

			<MediaUploaderBox isOpen={isUploaderOpen} onClose={closeUploader} />
		</div>
	);
}

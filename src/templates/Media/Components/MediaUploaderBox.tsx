"use client";

import { Upload } from "lucide-react";
import { useEffect } from "react";
import { useDropzone } from "react-dropzone";

import { cn } from "@/lib/utils";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";

import MediaUploadedItems from "./MediaUploadedItems";
import { useMedia } from "@/templates/Media/contexts/MediaContext";

interface MediaUploaderBoxProps {
	isOpen: boolean;
	onClose: () => void;
	onFilesAccepted?: (files: File[]) => void;
	onFilesRejected?: (rejectedFiles: any[]) => void;
}

export default function MediaUploaderBox({
	isOpen,
	onClose,
	onFilesAccepted,
	onFilesRejected
}: MediaUploaderBoxProps) {
	const {
		acceptedFiles,
		rejectedFiles,
		uploadComplete,
		addAcceptedFiles,
		addRejectedFiles,
		removeAcceptedFile,
		removeRejectedFile,
		clearAllFiles,
		uploadFiles,
		cancelUpload,
		retryUpload,
		clearUploadComplete,
		uploadConfig
	} = useMedia();

	// Auto-dismiss success message after 3 seconds
	useEffect(() => {
		if (uploadComplete) {
			const timer = setTimeout(() => {
				clearUploadComplete();
			}, 3000);

			return () => clearTimeout(timer);
		}
	}, [uploadComplete, clearUploadComplete]);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		accept: uploadConfig.acceptedFileTypes,
		multiple: uploadConfig.multiple,
		maxSize: uploadConfig.maxFileSize,
		onDropAccepted: acceptedFileList => {
			addAcceptedFiles(acceptedFileList);
			onFilesAccepted?.(acceptedFileList);
		},
		onDropRejected: rejectedFileList => {
			const rejectedFiles = rejectedFileList.map(rejection => ({
				file: rejection.file as any,
				errors: rejection.errors.map(error => ({
					code: error.code,
					message: error.message
				}))
			}));
			addRejectedFiles(rejectedFiles);
			onFilesRejected?.(rejectedFileList);
		}
	});

	const handleClose = () => {
		clearAllFiles();
		clearUploadComplete();
		onClose();
	};

	const handleUpload = async () => {
		const pendingFiles = acceptedFiles.filter(file => file.status === "pending");
		if (pendingFiles.length > 0) {
			await uploadFiles(pendingFiles);
		}
	};

	const acceptedCount = acceptedFiles.length;
	const pendingCount = acceptedFiles.filter(file => file.status === "pending").length;
	const uploadingCount = acceptedFiles.filter(file => file.status === "uploading").length;
	const completedCount = acceptedFiles.filter(file => file.status === "completed").length;

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden">
				<DialogHeader className="flex-shrink-0">
					<DialogTitle className="flex items-center space-x-2">
						<Upload className="h-5 w-5" />
						<span>Media Uploader</span>
					</DialogTitle>
					<DialogDescription>
						Upload your images to the media library. Only JPEG and PNG files are supported.
					</DialogDescription>
				</DialogHeader>

				<div className="min-h-0 flex-1 space-y-6 overflow-hidden">
					{/* Success Message */}
					{uploadComplete && (
						<Alert className="border-green-200 bg-green-50 text-green-800">
							<AlertDescription>
								Upload complete! {uploadComplete.successful} file
								{uploadComplete.successful !== 1 ? "s" : ""} uploaded successfully
								{uploadComplete.failed > 0 && `, ${uploadComplete.failed} failed`}.
							</AlertDescription>
						</Alert>
					)}

					{/* Upload Area */}
					<div
						{...getRootProps()}
						className={cn(
							"hover:border-primary/50 hover:bg-accent/50 cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200",
							isDragActive
								? "border-primary bg-primary/10 scale-[1.02]"
								: "border-muted-foreground/25"
						)}
					>
						<input {...getInputProps()} />
						<div className="flex flex-col items-center space-y-4">
							<div
								className={cn(
									"rounded-full p-4 transition-colors",
									isDragActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
								)}
							>
								<Upload className="h-8 w-8" />
							</div>
							<div className="space-y-2">
								<p className="text-lg font-medium">
									{isDragActive ? "Drop files here..." : "Drag & drop files here"}
								</p>
								<p className="text-muted-foreground text-sm">
									or{" "}
									<Button variant="link" className="h-auto p-0 text-sm">
										click to browse
									</Button>
								</p>
							</div>
							<Badge variant="outline" className="text-xs">
								JPEG, PNG up to 10MB (Max 20 files)
							</Badge>
						</div>
					</div>

					{/* Files List */}
					{(acceptedFiles.length > 0 || rejectedFiles.length > 0) && (
						<MediaUploadedItems
							acceptedFiles={acceptedFiles}
							rejectedFiles={rejectedFiles}
							onRemoveAcceptedFile={removeAcceptedFile}
							onRemoveRejectedFile={removeRejectedFile}
							onClearAll={clearAllFiles}
							cancelUpload={cancelUpload}
							retryUpload={retryUpload}
						/>
					)}
				</div>

				<DialogFooter className="flex-shrink-0">
					<Button variant="outline" onClick={handleClose}>
						Cancel
					</Button>
					{pendingCount > 0 && (
						<Button onClick={handleUpload}>
							Upload {pendingCount} {pendingCount === 1 ? "File" : "Files"}
						</Button>
					)}
					{uploadingCount > 0 && (
						<Button disabled>
							Uploading {uploadingCount} {uploadingCount === 1 ? "File" : "Files"}...
						</Button>
					)}
					{completedCount > 0 && pendingCount === 0 && uploadingCount === 0 && (
						<Button onClick={handleClose}>Done ({completedCount} uploaded)</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

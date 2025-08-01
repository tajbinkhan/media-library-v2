"use client";

import { ACCEPTED_FILE_TYPES, MIME_TO_EXTENSION } from "../Constants/Media.contant";
import { Loader2, Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";

import { cn } from "@/lib/utils";

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

import MediaUploadedItems from "@/templates/Media/Components/MediaUploadedItems";
import { useMedia } from "@/templates/Media/Contexts/MediaContext";

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

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		accept: uploadConfig.acceptedFileTypes,
		multiple: uploadConfig.multiple,
		maxSize: uploadConfig.maxFileSize,
		maxFiles: uploadConfig.maxFiles,
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

	const pendingCount = acceptedFiles.filter(file => file.status === "pending").length;
	const uploadingCount = acceptedFiles.filter(file => file.status === "uploading").length;
	const completedCount = acceptedFiles.filter(file => file.status === "completed").length;

	// Add this helper function to format file size
	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	// Add this helper function to get file type extensions
	const getFileTypeExtensions = (): string => {
		const extensions = Object.keys(ACCEPTED_FILE_TYPES)
			.map(mimeType => MIME_TO_EXTENSION[mimeType])
			.filter(Boolean);

		return extensions.join(", ");
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent
				className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden"
				onInteractOutside={e => e.preventDefault()}
			>
				<DialogHeader className="flex-shrink-0">
					<DialogTitle className="flex items-center space-x-2">
						<Upload className="h-5 w-5" />
						<span>Media Uploader</span>
					</DialogTitle>
					<DialogDescription>
						Upload your images to the media library. Only {getFileTypeExtensions()} are supported.
					</DialogDescription>
				</DialogHeader>

				<div className="min-h-0 flex-1 space-y-6 overflow-hidden">
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
								Max {formatFileSize(uploadConfig.maxFileSize)} • Up to {uploadConfig.maxFiles} files
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
					{/* Show upload button when there are pending files and no uploads in progress */}
					{pendingCount > 0 && uploadingCount === 0 && (
						<Button onClick={handleUpload} className="w-full">
							Upload {pendingCount} {pendingCount === 1 ? "File" : "Files"}
						</Button>
					)}

					{/* Show uploading status when files are being uploaded */}
					{uploadingCount > 0 && (
						<Button disabled className="w-full">
							<Loader2 className="mr-2 animate-spin" /> Uploading...
						</Button>
					)}

					{/* Show done button when all uploads are complete */}
					{completedCount > 0 && pendingCount === 0 && uploadingCount === 0 && (
						<Button onClick={handleClose} className="w-full">
							Done
						</Button>
					)}

					{/* Show disabled upload button when no files are selected to maintain layout */}
					{acceptedFiles.length === 0 && (
						<Button disabled className="w-full">
							Upload Files
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import axiosApi from "@/lib/axios-config";

import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { mediaApiRoutes } from "@/templates/Media/Routes/MediaRoutes";

// ============================================================================
// Component
// ============================================================================

export default function MediaDeleteAlert({ item, onClose, onSuccess }: MediaDeleteAlertProps) {
	const [isPending, startTransition] = useTransition();

	const handleDelete = () => {
		if (!item) return;

		startTransition(async () => {
			await axiosApi
				.delete(mediaApiRoutes.mediaId(item.id))
				.then(() => {
					toast.success("Media file deleted successfully");
					onSuccess?.();
					onClose();
				})
				.catch(error => {
					const errorMessage =
						error.response?.data?.message || error.message || "Failed to delete media file";
					toast.error(errorMessage);
				});
		});
	};

	if (!item) return null;

	return (
		<AlertDialog open={Boolean(item)} onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle className="flex items-center gap-2">
						<Trash2 className="h-5 w-5 text-red-500" />
						Delete Media File
					</AlertDialogTitle>
					<AlertDialogDescription className="space-y-2">
						<div>Are you sure you want to delete this media file?</div>
						<div className="rounded bg-gray-50 p-3 dark:bg-gray-800">
							<div className="font-medium text-gray-900 dark:text-gray-100">
								{item.originalFilename}
							</div>
							{item.altText && (
								<div className="text-sm text-gray-600 dark:text-gray-400">
									Alt text: {item.altText}
								</div>
							)}
						</div>
						<div className="text-sm text-red-600 dark:text-red-400">
							This action cannot be undone. The file will be permanently removed from your media
							library.
						</div>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
					<Button variant="destructive" onClick={handleDelete} disabled={isPending}>
						{isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Deleting...
							</>
						) : (
							<>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete
							</>
						)}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

// ============================================================================
// Export
// ============================================================================

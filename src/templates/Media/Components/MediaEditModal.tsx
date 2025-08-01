"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, X } from "lucide-react";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import axiosApi from "@/lib/axios-config";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { apiRoute } from "@/routes/routes";
import {
	MediaUpdateSchemaType,
	mediaUpdateSchema
} from "@/templates/Media/Validators/Media.schema";

// ============================================================================
// Component
// ============================================================================

export default function MediaEditModal({ item, onClose, onSave, onCancel }: MediaEditModalProps) {
	const [isPending, startTransition] = useTransition();

	const form = useForm<MediaUpdateSchemaType>({
		resolver: zodResolver(mediaUpdateSchema),
		defaultValues: {
			name: item?.originalFilename || "",
			altText: item?.altText || ""
		}
	});

	useEffect(() => {
		if (item) {
			form.reset({
				// split the extension from the filename
				name: item.originalFilename.split(".").slice(0, -1).join(".") || "",
				altText: item.altText || ""
			});
		}
	}, [item, form]);

	const onSubmit = (data: MediaUpdateSchemaType) => {
		startTransition(async () => {
			const payload = {
				...data,
				name: `${data.name}.${item?.originalFilename.split(".").pop() || ""}`
			};
			await axiosApi
				.put(apiRoute.mediaId(item?.id!), payload)
				.then(() => {
					toast.success("Media details updated successfully");
					onSave();
				})
				.catch(error => {
					toast.error("Failed to update media details: " + error.message);
				});
		});
	};

	if (!item) return null;

	return (
		<Dialog open={!!item} onOpenChange={onClose}>
			<DialogContent className="max-w-md" onInteractOutside={e => e.preventDefault()}>
				<DialogHeader>
					<DialogTitle>Edit Media Details</DialogTitle>
					<DialogDescription>Update the details for this media file.</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Filename</FormLabel>
									<FormControl>
										<Input placeholder="Enter file name" {...field} disabled={isPending} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="altText"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Alt Text</FormLabel>
									<FormControl>
										<Input placeholder="Enter alt text" {...field} disabled={isPending} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button variant="outline" onClick={onCancel} type="button" disabled={isPending}>
								<X className="mr-2 h-4 w-4" />
								Cancel
							</Button>
							<Button type="submit" disabled={isPending} className="ml-2">
								{isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Saving...
									</>
								) : (
									<>
										<Save className="mr-2 h-4 w-4" />
										Save Changes
									</>
								)}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

// ============================================================================
// Export
// ============================================================================

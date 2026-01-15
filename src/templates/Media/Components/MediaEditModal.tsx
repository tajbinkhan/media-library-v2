"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, X } from "lucide-react";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { useMediaUpdateMutation } from "@/templates/Media/Redux/MediaAPISlice";
import {
	MediaUpdateSchemaType,
	mediaUpdateSchema
} from "@/templates/Media/Validators/Media.schema";

// ============================================================================
// Component
// ============================================================================

export default function MediaEditModal({ item, onClose, onSave, onCancel }: MediaEditModalProps) {
	const [isPending, startTransition] = useTransition();
	const [updateMedia] = useMediaUpdateMutation();

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
			try {
				await updateMedia({
					publicId: item?.publicId!,
					data: payload as Partial<MediaItem>
				}).unwrap();
				toast.success("Media details updated successfully");
				onSave();
			} catch (error: any) {
				toast.error("Failed to update media details: " + (error?.data?.message || error.message));
			}
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

				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor="name">Filename</FieldLabel>
							<Input
								id="name"
								placeholder="Enter file name"
								{...form.register("name")}
								disabled={isPending}
							/>
							<FieldError errors={[form.formState.errors.name]} />
						</Field>
						<Field>
							<FieldLabel htmlFor="altText">Alt Text</FieldLabel>
							<Input
								id="altText"
								placeholder="Enter alt text"
								{...form.register("altText")}
								disabled={isPending}
							/>
							<FieldError errors={[form.formState.errors.altText]} />
						</Field>
					</FieldGroup>

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
			</DialogContent>
		</Dialog>
	);
}

// ============================================================================
// Export
// ============================================================================

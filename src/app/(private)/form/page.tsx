"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSet
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import MediaPicker from "@/templates/Media/MediaPicker";
import { validateMediaArray, validateMediaItem } from "@/templates/Media/Validators/Media.schema";
import { validateString } from "@/validators/commonRule";

const formSchema = z.object({
	name: validateString("Name"),
	avatar: validateMediaItem({
		name: "Avatar",
		required: false
	}), // Single media (optional)
	gallery: validateMediaArray({
		name: "Gallery",
		required: false,
		maxItems: 5
	}), // Multiple media (max 5, optional)
	featuredImage: validateMediaItem({
		name: "Featured Image",
		required: true
	}) // Single media (required)
});

type FormSchema = z.infer<typeof formSchema>;

export default function FormPage() {
	const [submittedData, setSubmittedData] = useState<FormSchema | null>(null);
	const submittedDataRef = useRef<HTMLDivElement>(null);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors }
	} = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			avatar: null,
			gallery: null,
			featuredImage: null
		}
	});

	const onSubmit = (data: FormSchema) => {
		console.log("Form submitted:", data);
		setSubmittedData(data);
	};

	useEffect(() => {
		if (submittedData && submittedDataRef.current) {
			submittedDataRef.current.scrollIntoView({
				behavior: "smooth",
				block: "start"
			});
		}
	}, [submittedData]);

	return (
		<div className="container mx-auto max-w-6xl px-4 py-8">
			<div className="mb-8 space-y-2">
				<h1 className="text-4xl font-bold tracking-tight">Media Library Form</h1>
				<p className="text-muted-foreground text-lg">
					A comprehensive form showcasing the media picker component with various configurations
				</p>
			</div>

			<Card className="p-8">
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
					<FieldSet>
						<FieldGroup>
							{/* Name Field */}
							<Controller
								control={control}
								name="name"
								render={({ field }) => (
									<Field data-invalid={!!errors.name}>
										<FieldLabel htmlFor="name">Full Name</FieldLabel>
										<Input
											id="name"
											placeholder="Enter your full name"
											{...field}
											aria-invalid={!!errors.name}
										/>
										<FieldDescription>This will be displayed as your public name</FieldDescription>
										<FieldError errors={[errors.name]} />
									</Field>
								)}
							/>

							<Separator className="my-6" />

							{/* Single Media Fields */}
							<div className="space-y-6">
								<div>
									<h2 className="text-xl font-semibold">Profile Media</h2>
									<p className="text-muted-foreground text-sm">
										Upload your avatar and featured image
									</p>
								</div>

								<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
									{/* Avatar Field */}
									<Controller
										control={control}
										name="avatar"
										render={({ field }) => (
											<Field data-invalid={!!errors.avatar}>
												<FieldLabel htmlFor="avatar">Avatar</FieldLabel>
												<MediaPicker
													value={field.value}
													onChange={field.onChange}
													multiple={false}
													min={0}
													max={1}
													placeholder="Select an avatar"
												/>
												<FieldDescription>
													Optional profile picture (recommended 1:1 aspect ratio)
												</FieldDescription>
												<FieldError errors={[errors.avatar]} />
											</Field>
										)}
									/>

									{/* Featured Image Field */}
									<Controller
										control={control}
										name="featuredImage"
										render={({ field }) => (
											<Field data-invalid={!!errors.featuredImage}>
												<FieldLabel htmlFor="featuredImage">
													Featured Image <span className="text-destructive">*</span>
												</FieldLabel>
												<MediaPicker
													value={field.value}
													onChange={field.onChange}
													multiple={false}
													min={1}
													max={1}
													placeholder="Select a featured image"
												/>
												<FieldDescription>
													This image will be displayed prominently (required)
												</FieldDescription>
												<FieldError errors={[errors.featuredImage]} />
											</Field>
										)}
									/>
								</div>
							</div>

							<Separator className="my-6" />

							{/* Gallery Field */}
							<div className="space-y-4">
								<div>
									<h2 className="text-xl font-semibold">Gallery</h2>
									<p className="text-muted-foreground text-sm">
										Upload multiple images for your gallery
									</p>
								</div>

								<Controller
									control={control}
									name="gallery"
									render={({ field }) => (
										<Field data-invalid={!!errors.gallery}>
											<FieldLabel htmlFor="gallery">Image Gallery</FieldLabel>
											<MediaPicker
												value={field.value}
												onChange={field.onChange}
												multiple={true}
												min={0}
												max={5}
												placeholder="Select up to 5 images for the gallery"
											/>
											<FieldDescription>
												Upload up to 5 images to showcase in your gallery (optional)
											</FieldDescription>
											<FieldError errors={[errors.gallery]} />
										</Field>
									)}
								/>
							</div>
						</FieldGroup>
					</FieldSet>

					<Separator />

					<div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
						<Button type="button" variant="outline" onClick={() => reset()} className="sm:w-auto">
							Reset Form
						</Button>
						<Button type="submit" className="sm:w-auto">
							Submit Form
						</Button>
					</div>
				</form>
			</Card>

			{/* Display Submitted Data */}
			{submittedData && (
				<Card ref={submittedDataRef} className="mt-6 p-6">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h2 className="text-2xl font-semibold">Submitted Data</h2>
							<Button variant="outline" size="sm" onClick={() => setSubmittedData(null)}>
								Clear
							</Button>
						</div>
						<Separator />
						<pre className="bg-muted overflow-auto rounded-lg p-4 text-sm">
							<code>{JSON.stringify(submittedData, null, 2)}</code>
						</pre>
					</div>
				</Card>
			)}
		</div>
	);
}

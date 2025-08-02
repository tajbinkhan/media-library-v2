"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import MediaPicker from "@/templates/Media/MediaPicker";
import { validateMediaArray, validateMediaItem } from "@/templates/Media/Validators/Media.schema";
import { validateString } from "@/validators/commonRules";

const formSchema = z.object({
	name: validateString("Name"),
	avatar: validateMediaItem("Avatar", false), // Single media (optional)
	gallery: validateMediaArray("Gallery", true, 5, 5), // Multiple media (max 5, optional)
	featuredImage: validateMediaItem("Featured Image", true) // Single media (required)
});

type FormSchema = z.infer<typeof formSchema>;

export default function FormPage() {
	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			avatar: null,
			gallery: null,
			featuredImage: null
		}
	});

	return (
		<div className="mx-auto mt-8 max-w-4xl rounded-lg bg-white p-8 shadow-md">
			<h1 className="mb-8 text-3xl font-bold">Sample Form with Media Picker</h1>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(data => console.log(data))}>
					<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
						<div className="space-y-6">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input placeholder="Name" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="avatar"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Avatar (Single Selection)</FormLabel>
										<FormControl>
											<MediaPicker
												value={field.value}
												onChange={field.onChange}
												multiple={false}
												min={0}
												max={1}
												placeholder="Select an avatar"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="featuredImage"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Featured Image (Required)</FormLabel>
										<FormControl>
											<MediaPicker
												value={field.value}
												onChange={field.onChange}
												multiple={false}
												min={1}
												max={1}
												placeholder="Select a featured image"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="space-y-6">
							<FormField
								control={form.control}
								name="gallery"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Gallery (Multiple Selection - Max 5)</FormLabel>
										<FormControl>
											<MediaPicker
												value={field.value}
												onChange={field.onChange}
												multiple={true}
												min={0}
												max={5}
												placeholder="Select up to 5 images for the gallery"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>

					<div className="mt-8 flex justify-end gap-4">
						<Button type="button" variant="outline" onClick={() => form.reset()}>
							Reset Form
						</Button>
						<Button type="submit">Submit Form</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

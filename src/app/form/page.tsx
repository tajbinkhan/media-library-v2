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

import { validateMediaArray, validateMediaItem } from "@/templates/Media/Validators/Media.schema";
import { validateString } from "@/validators/commonRules";

const formSchema = z.object({
	name: validateString("Name"),
	avatar: validateMediaItem("Avatar", false), // Single media (optional)
	gallery: validateMediaArray("Gallery", false, undefined, 5), // Multiple media (max 5, optional)
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
		<div className="mx-auto mt-8 max-w-md rounded-lg bg-white p-6 shadow-md">
			<h1 className="mb-6 text-2xl font-bold">Sample Form with Media Picker</h1>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(data => console.log(data))}>
					<div className="flex flex-col gap-4">
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
					</div>
					<Button type="submit" className="mt-4">
						Submit
					</Button>
				</form>
			</Form>
		</div>
	);
}

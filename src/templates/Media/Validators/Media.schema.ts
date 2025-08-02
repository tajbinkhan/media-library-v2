import { z } from "zod";

import { zodMessages } from "@/core/messages";
import { validatePositiveNumber, validateString } from "@/validators/commonRules";

export const mediaUpdateSchema = z.object({
	name: validateString("Name"),
	altText: validateString("Alt Text").optional()
});

/**
 * Validation for single media item
 */
export const validateMediaItem = (name: string, required: boolean = false) => {
	const schema = z.object(
		{
			id: validatePositiveNumber("ID"),
			originalFilename: validateString("Original Filename"),
			mimeType: validateString("MIME Type"),
			secureUrl: validateString("Secure URL"),
			fileSize: validatePositiveNumber("File Size"),
			width: validatePositiveNumber("Width").optional(),
			height: validatePositiveNumber("Height").optional(),
			altText: validateString("Alt Text").optional().nullable(),
			createdAt: validateString("Created At")
		},
		{
			error: issue =>
				issue.input === undefined || issue.input === null
					? zodMessages.error.required.fieldIsRequired(name)
					: zodMessages.error.invalid.invalidFile(name)
		}
	);

	if (required) {
		return schema.refine(data => data !== null && data !== undefined, {
			message: zodMessages.error.required.fieldIsRequired(name)
		});
	}

	return schema.optional().nullable();
};

/**
 * Validation for multiple media items
 */
export const validateMediaArray = (
	name: string,
	required: boolean = false,
	minItems?: number,
	maxItems?: number
) => {
	let schema = z.array(
		z.object(
			{
				id: validatePositiveNumber("ID"),
				filename: validateString("Filename"),
				originalFilename: validateString("Original Filename"),
				mimeType: validateString("MIME Type"),
				fileExtension: validateString("File Extension"),
				secureUrl: validateString("Secure URL"),
				fileSize: validatePositiveNumber("File Size"),
				width: validatePositiveNumber("Width").optional(),
				height: validatePositiveNumber("Height").optional(),
				duration: validatePositiveNumber("Duration").optional().nullable(),
				storageKey: validateString("Storage Key"),
				mediaType: validateString("Media Type"),
				altText: validateString("Alt Text").optional().nullable(),
				caption: validateString("Caption").optional().nullable(),
				description: validateString("Description").optional().nullable(),
				tags: validateString("Tags").optional().nullable(),
				createdAt: validateString("Created At"),
				updatedAt: validateString("Updated At")
			},
			{
				error: issue =>
					issue.input === undefined || issue.input === null
						? zodMessages.error.required.fieldIsRequired(name)
						: zodMessages.error.invalid.invalidFile(name)
			}
		),
		{
			error: issue =>
				issue.input === undefined || issue.input === null
					? zodMessages.error.required.fieldIsRequired(name)
					: zodMessages.error.invalid.invalidFile(name)
		}
	);

	if (minItems !== undefined) {
		schema = schema.min(
			minItems,
			`${name} must have at least ${minItems} item${minItems !== 1 ? "s" : ""}`
		);
	}

	if (maxItems !== undefined) {
		schema = schema.max(
			maxItems,
			`${name} cannot have more than ${maxItems} item${maxItems !== 1 ? "s" : ""}`
		);
	}

	if (required && minItems === undefined) {
		schema = schema.min(1, zodMessages.error.required.fieldIsRequired(name));
	}

	if (!required) {
		return schema.optional().nullable();
	}

	return schema;
};

export type MediaUpdateSchemaType = z.infer<typeof mediaUpdateSchema>;

import { z } from "zod";

import { zodMessages } from "@/core/messages";
import { validateString } from "@/validators/commonRule";

interface ValidateMediaItemOptions {
	name: string;
	required: boolean;
}

interface ValidateMediaArrayItemOptions {
	name: string;
	required: boolean;
	minItems?: number;
	maxItems?: number;
}

export const mediaUpdateSchema = z.object({
	name: validateString("Name"),
	altText: validateString("Alt Text").optional()
});

/**
 * Validation for single media item
 */
export const validateMediaItem = ({ name, required = false }: ValidateMediaItemOptions) => {
	const schema = z.object(
		{
			filename: validateString("Original Filename"),
			secureUrl: validateString("Secure URL"),
			altText: validateString("Alt Text").optional().nullable(),
			mimeType: validateString("MIME Type")
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
export const validateMediaArray = ({
	name,
	required = false,
	minItems,
	maxItems
}: ValidateMediaArrayItemOptions) => {
	let schema = z.array(
		z.object(
			{
				filename: validateString("Original Filename"),
				secureUrl: validateString("Secure URL"),
				altText: validateString("Alt Text").optional().nullable(),
				mimeType: validateString("MIME Type")
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

export const validateMenuArray = ({
	name,
	required = false,
	minItems,
	maxItems
}: ValidateMediaArrayItemOptions) => {
	let schema = z.array(
		z.object(
			{
				title: validateString("Title", { min: 1, max: 100 }),
				link: validateString("Link", { min: 1, max: 255 })
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

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
	const schema = z.object({
		id: validatePositiveNumber("ID"),
		originalFilename: validateString("Original Filename"),
		secureUrl: validateString("Secure URL"),
		altText: validateString("Alt Text").optional().nullable()
	});

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
		z.object({
			id: validatePositiveNumber("ID"),
			originalFilename: validateString("Original Filename"),
			secureUrl: validateString("Secure URL"),
			altText: validateString("Alt Text").optional().nullable()
		})
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

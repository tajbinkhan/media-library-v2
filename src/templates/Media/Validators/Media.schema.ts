import { z } from "zod";

import { validateString } from "@/validators/commonRules";

export const mediaUpdateSchema = z.object({
	name: validateString("Name"),
	altText: validateString("Alt Text").optional()
});

export type MediaUpdateSchemaType = z.infer<typeof mediaUpdateSchema>;

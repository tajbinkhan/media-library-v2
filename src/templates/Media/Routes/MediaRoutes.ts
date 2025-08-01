import { apiRoute } from "@/routes/routes";

export const mediaApiRoutes = {
	media: apiRoute.media,
	mediaId: (id: string | number) => apiRoute.mediaId(id),
	mediaUpload: apiRoute.mediaUpload
};

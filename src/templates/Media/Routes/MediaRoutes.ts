export const mediaApiRoutes = {
	media: "/media",
	mediaPublicId: (publicId: string) => `/media/${publicId}`,
	mediaUpload: "/media",
	mediaDownload: (publicId: string) => `/media/${publicId}/download`
};

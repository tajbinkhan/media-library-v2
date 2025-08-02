export const apiRoute = {
	csrfToken: "/csrf-token",
	media: "/media",
	mediaId: (id: string | number) => `/media/${id}`,
	mediaUpload: "/media/upload",
	mediaDownload: (id: string | number) => `/media/${id}/download`
};

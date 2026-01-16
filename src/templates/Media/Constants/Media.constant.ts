export const MEDIA_API_URL = process.env.NEXT_PUBLIC_MEDIA_API_URL || "http://localhost:5000";
export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 10MB
export const MAX_FILES = 20;
export const MAX_CONCURRENT_UPLOADS = 3;
export const ACCEPTED_FILE_TYPES = {
	// Images
	"image/jpeg": [],
	"image/jpg": [],
	"image/png": [],
	"image/gif": [],
	"image/webp": [],
	// "image/svg+xml": [],
	// Videos
	"video/mp4": [],
	"video/webm": [],
	// Audio
	// "audio/mp3": [],
	// Documents
	"application/pdf": []
	// "application/msword": [],
	// "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [],
	// "application/vnd.ms-excel": [],
	// "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
	// "text/plain": []
};

export const MIME_TO_EXTENSION: Record<string, string> = {
	"image/jpeg": "JPEG",
	"image/jpg": "JPG",
	"image/png": "PNG",
	"image/gif": "GIF",
	"image/webp": "WebP",
	// "image/svg+xml": "SVG",
	"video/mp4": "MP4",
	"video/webm": "WebM",
	// "audio/mp3": "MP3",
	"application/pdf": "PDF"
	// "application/msword": "DOC",
	// "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
	// "application/vnd.ms-excel": "XLS",
	// "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
	// "text/plain": "TXT"
};

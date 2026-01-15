import { createApi } from "@reduxjs/toolkit/query/react";

import { createBaseQueryWithCSRF } from "@/lib/rtk-base-query";

import { MEDIA_API_URL } from "@/templates/Media/Constants/Media.constant";
import { mediaApiRoutes } from "@/templates/Media/Routes/MediaRoutes";

export const mediaApiSlice = createApi({
	reducerPath: "mediaApiReducer",
	keepUnusedDataFor: 0,
	baseQuery: createBaseQueryWithCSRF({ baseUrl: MEDIA_API_URL }),
	tagTypes: ["Media"],
	endpoints: builder => ({
		mediaList: builder.query<ApiResponse<MediaItem[]>, void>({
			query: () => ({
				url: mediaApiRoutes.media,
				method: "GET"
			}),
			providesTags: ["Media"]
		}),
		mediaUpload: builder.mutation<ApiResponse<MediaItem>, FormData>({
			query: formData => ({
				url: mediaApiRoutes.mediaUpload,
				method: "POST",
				body: formData
			}),
			invalidatesTags: ["Media"]
		}),
		mediaUpdate: builder.mutation<
			ApiResponse<MediaItem>,
			{ publicId: string; data: Partial<MediaItem> }
		>({
			query: ({ publicId, data }) => ({
				url: mediaApiRoutes.mediaPublicId(publicId),
				method: "PUT",
				body: data
			}),
			invalidatesTags: ["Media"]
		}),
		mediaDelete: builder.mutation<ApiResponse<void>, string>({
			query: publicId => ({
				url: mediaApiRoutes.mediaPublicId(publicId),
				method: "DELETE"
			}),
			invalidatesTags: ["Media"]
		}),
		mediaDownload: builder.query<Blob, string>({
			query: publicId => ({
				url: mediaApiRoutes.mediaDownload(publicId),
				method: "GET",
				responseHandler: response => response.blob()
			})
		})
	})
});

// Export hooks
export const {
	useMediaListQuery,
	useMediaUploadMutation,
	useMediaUpdateMutation,
	useMediaDeleteMutation,
	useMediaDownloadQuery
} = mediaApiSlice;

export const mediaApiReducer = mediaApiSlice.reducer;

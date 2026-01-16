import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithCSRF } from "@/lib/rtk-base-query";

import { apiRoute } from "@/routes/routes";

export const authenticationApiSlice = createApi({
	reducerPath: "authenticationApiReducer",
	keepUnusedDataFor: 0,
	baseQuery: baseQueryWithCSRF,
	tagTypes: ["User"],
	endpoints: builder => ({
		me: builder.query<ApiResponse<User>, void>({
			query: () => apiRoute.me,
			providesTags: ["User"]
		}),

		logout: builder.mutation<ApiResponse<null>, void>({
			query: () => ({
				url: apiRoute.logout,
				method: "POST"
			}),
			invalidatesTags: ["User"]
		})
	})
});

// Export hooks
export const { useMeQuery, useLogoutMutation } = authenticationApiSlice;

export const authenticationApiReducer = authenticationApiSlice.reducer;

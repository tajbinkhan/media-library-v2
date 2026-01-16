import { configureStore } from "@reduxjs/toolkit";

import {
	authenticationApiReducer,
	authenticationApiSlice
} from "@/templates/Authentication/Login/Redux/AuthenticationAPISlice";
import { authReducer } from "@/templates/Authentication/Login/Redux/AuthenticationSlice";
import { mediaApiReducer, mediaApiSlice } from "@/templates/Media/Redux/MediaAPISlice";

export const makeStore = () => {
	return configureStore({
		reducer: {
			authReducer,
			authenticationApiReducer,
			mediaApiReducer
		},
		middleware: getDefaultMiddleware =>
			getDefaultMiddleware({
				serializableCheck: false
			}).concat([authenticationApiSlice.middleware, mediaApiSlice.middleware])
	});
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

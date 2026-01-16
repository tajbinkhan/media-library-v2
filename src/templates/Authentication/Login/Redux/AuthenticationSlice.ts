import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	isLoggingOut: boolean;
}

const initialState: AuthState = {
	user: null,
	isAuthenticated: false,
	isLoading: true,
	isLoggingOut: false
};

export const authSlice = createSlice({
	name: "authReducer",
	initialState,
	reducers: {
		setUser: (state, action: PayloadAction<User>) => {
			state.user = action.payload;
			state.isAuthenticated = true;
			state.isLoading = false;
		},
		setAuthLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},
		setLoggingOut: (state, action: PayloadAction<boolean>) => {
			state.isLoggingOut = action.payload;
		},
		setAuthCheckComplete: state => {
			state.isLoading = false;
		},
		logout: state => {
			state.user = null;
			state.isAuthenticated = false;
			state.isLoading = false;
			state.isLoggingOut = false;
		}
	}
});

export const { setUser, setAuthLoading, setLoggingOut, setAuthCheckComplete, logout } =
	authSlice.actions;
export const authReducer = authSlice.reducer;

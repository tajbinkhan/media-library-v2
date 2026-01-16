import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useLogoutMutation } from "@/templates/Authentication/Login/Redux/AuthenticationAPISlice";
import { logout, setLoggingOut } from "@/templates/Authentication/Login/Redux/AuthenticationSlice";

export default function useAuth() {
	const dispatch = useAppDispatch();
	const { user, isAuthenticated, isLoading, isLoggingOut } = useAppSelector(
		state => state.authReducer
	);

	const [logoutMutation] = useLogoutMutation();

	const handleLogout = async () => {
		dispatch(setLoggingOut(true));

		// Call logout API
		await logoutMutation()
			.unwrap()
			.then(() => {
				// Clear auth state but keep isLoggingOut true
				// The UnifiedAuthProvider will handle the redirect
				dispatch(logout());
			})
			.catch(() => {
				// Still clear local state even if API fails
				dispatch(logout());
			});
	};

	return {
		user,
		isAuthenticated,
		isLoading,
		isLoggingOut,
		handleLogout
	};
}

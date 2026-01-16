"use client";

import { redirect, usePathname } from "next/navigation";
import { useEffect } from "react";

import Loader from "@/components/ui/loader";

import useRedirect from "@/hooks/use-redirect";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { route } from "@/routes/routes";
import { useMeQuery } from "@/templates/Authentication/Login/Redux/AuthenticationAPISlice";
import {
	setAuthCheckComplete,
	setUser
} from "@/templates/Authentication/Login/Redux/AuthenticationSlice";

interface UnifiedAuthProviderProps {
	children: React.ReactNode;
	requireAuth: boolean; // true for private routes, false for public routes
}

export default function UnifiedAuthProvider({ children, requireAuth }: UnifiedAuthProviderProps) {
	const dispatch = useAppDispatch();
	const { data: userData, isLoading, isSuccess, isError } = useMeQuery();

	const { redirectUrl } = useRedirect();
	const { isLoggingOut, isAuthenticated } = useAppSelector(state => state.authReducer);

	const pathname = usePathname();
	const currentUrl = process.env.NEXT_PUBLIC_FRONTEND_URL + pathname;
	const loginRedirect = route.protected.login + `?redirect=${encodeURIComponent(currentUrl)}`;

	useEffect(() => {
		// Only process auth state changes after query completes
		if (!isSuccess && !isError) return;

		if (isSuccess) {
			if (userData?.data) {
				// User is authenticated
				dispatch(setUser(userData.data));

				if (!requireAuth) {
					// Public route but user is authenticated, redirect to dashboard
					redirect(redirectUrl || route.private.dashboard);
				}
				// For private routes, just set user and continue
			} else {
				// No user data (unauthenticated)
				dispatch(setAuthCheckComplete());

				if (requireAuth) {
					// Private route but user is not authenticated, redirect to login
					redirect(loginRedirect);
				}
				// For public routes, just continue
			}
		} else if (isError) {
			// Auth check failed
			dispatch(setAuthCheckComplete());

			if (requireAuth) {
				// Private route, redirect to login
				redirect(loginRedirect);
			}
			// For public routes, just continue
		}
	}, [isSuccess, userData, isError, dispatch, requireAuth, redirectUrl, loginRedirect]);

	// Show loader during auth check or logout
	if (isLoading || isLoggingOut) {
		return <Loader text="Checking authentication..." />;
	}

	// Don't render children if we're on a private route and not authenticated
	// This prevents flash of content before redirect
	if (requireAuth && !isAuthenticated) {
		return <Loader text="Redirecting..." />;
	}

	return children;
}

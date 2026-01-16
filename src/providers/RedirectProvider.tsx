"use client";

import { useSearchParams } from "next/navigation";
import { createContext } from "react";

interface RedirectContextType {
	redirectUrl: string | null;
	getRedirectUrl: (baseUrl: string) => string;
}

export const RedirectContext = createContext<RedirectContextType | undefined>(undefined);

export function RedirectProvider({ children }: { children: React.ReactNode }) {
	const searchParams = useSearchParams();
	const redirectUrl = searchParams.get("redirect");

	// Helper function to append redirect to any auth-related URL
	const getRedirectUrl = (baseUrl: string): string => {
		if (!redirectUrl) return baseUrl;

		// Check if baseUrl already has query parameters
		const hasQueryParams = baseUrl.includes("?");
		const separator = hasQueryParams ? "&" : "?";
		return `${baseUrl}${separator}redirect=${encodeURIComponent(redirectUrl)}`;
	};

	return (
		<RedirectContext.Provider value={{ redirectUrl, getRedirectUrl }}>
			{children}
		</RedirectContext.Provider>
	);
}

import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Suspense } from "react";

import Loader from "@/components/ui/loader";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";
import { RedirectProvider } from "@/providers/RedirectProvider";
import ReduxProvider from "@/providers/ReduxProvider";

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
	variable: "--font-poppins"
});

export const metadata: Metadata = {
	title: "Media Library",
	description: "A simple media library built with Next.js, TypeScript and Tailwind CSS."
};

export default function RootLayout({ children }: Readonly<GlobalLayoutProps>) {
	return (
		<html lang="en" className={poppins.className} suppressHydrationWarning>
			<body className="antialiased" suppressHydrationWarning>
				<Suspense fallback={<Loader />}>
					<ReduxProvider>
						<RedirectProvider>
							{children}
							<Toaster position="top-right" richColors closeButton />
						</RedirectProvider>
					</ReduxProvider>
				</Suspense>
			</body>
		</html>
	);
}

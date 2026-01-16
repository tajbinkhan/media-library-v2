"use client";

import { useTransition } from "react";
import { FaGoogle, FaHandHoldingDollar } from "react-icons/fa6";

import { LoadingButton } from "@/components/ui/loading-button";

import useRedirect from "@/hooks/use-redirect";
import { apiRoute, route } from "@/routes/routes";

export default function LoginTemplate() {
	const [isPending, startTransition] = useTransition();
	const { redirectUrl } = useRedirect();

	const googleOauthRedirectUrl = redirectUrl
		? redirectUrl
		: encodeURIComponent(process.env.NEXT_PUBLIC_FRONTEND_URL + route.private.dashboard);

	const handleGoogleLogin = () => {
		startTransition(() => {
			window.location.href = `${process.env.NEXT_PUBLIC_API_URL + apiRoute.googleLogin}?redirect=${googleOauthRedirectUrl}`;
		});
	};

	return (
		<main className="from-background via-background to-muted/20 relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-linear-to-br p-4">
			{/* Decorative background elements */}
			<div className="absolute inset-0 -z-10">
				<div className="bg-primary/5 absolute top-1/4 left-1/4 h-64 w-64 rounded-full blur-3xl" />
				<div className="bg-primary/5 absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full blur-3xl" />
			</div>

			<div className="w-full max-w-md">
				{/* Card */}
				<div className="border-border/50 bg-background/80 hover:border-border space-y-10 rounded-3xl border p-10 shadow-2xl shadow-black/5 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-black/10">
					{/* Header */}
					<div className="flex flex-col items-center space-y-3 text-center">
						<div className="mb-4 flex items-center gap-3">
							<div className="from-primary/10 to-primary/5 ring-primary/10 flex size-10 items-center justify-center rounded-lg bg-linear-to-br ring-1">
								<FaHandHoldingDollar className="text-primary h-5 w-5" />
							</div>
							<span className="text-foreground text-2xl font-bold">Webphics Media Library</span>
						</div>
						<h1 className="text-foreground text-4xl font-bold tracking-tight">Welcome back</h1>
						<p className="text-muted-foreground text-base font-medium">
							Sign in to your account to continue
						</p>
					</div>

					{/* Divider */}
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="bg-border w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background text-muted-foreground px-3 font-medium">
								Continue with
							</span>
						</div>
					</div>

					{/* Button */}
					<div className="space-y-4">
						<LoadingButton
							type="button"
							className="group hover:shadow-primary/20 h-auto w-full gap-3 py-3.5 transition-all duration-200 hover:shadow-lg"
							size="lg"
							isLoading={isPending}
							loadingText="Redirecting..."
							onClick={handleGoogleLogin}
						>
							<FaGoogle className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
							<span className="font-semibold">Continue with Google</span>
						</LoadingButton>
						<p className="text-muted-foreground text-center text-xs">
							Secure authentication powered by Google
						</p>
					</div>
				</div>
			</div>
		</main>
	);
}

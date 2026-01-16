import Navigation from "@/components/navigation";

import UnifiedAuthProvider from "@/providers/UnifiedAuthProvider";

export default function PrivateLayout({ children }: Readonly<GlobalLayoutProps>) {
	return (
		<UnifiedAuthProvider requireAuth>
			<Navigation />
			{children}
		</UnifiedAuthProvider>
	);
}

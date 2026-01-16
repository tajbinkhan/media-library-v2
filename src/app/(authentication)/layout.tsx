import UnifiedAuthProvider from "@/providers/UnifiedAuthProvider";

export default function AuthenticationLayout({ children }: Readonly<GlobalLayoutProps>) {
	return <UnifiedAuthProvider requireAuth={false}>{children}</UnifiedAuthProvider>;
}

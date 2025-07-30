interface User {
	id: number;
	name: string;
	username: string;
	email: string;
	emailVerified: string;
	image: string | null;
	role: "ADMIN" | "SUPERVISOR" | "AGENT";
	createdAt: string;
	updatedAt: string;
}

interface User {
	id: string;
	name: string | null;
	email: string;
	password: string | null;
	emailVerified: boolean;
	image: string | null;
	is2faEnabled: boolean | null;
	createdAt: string;
	updatedAt: string;
}

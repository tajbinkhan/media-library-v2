export const route = {
	public: {},
	private: {
		dashboard: "/"
	},
	protected: {
		login: "/login"
	}
};

export const apiRoute = {
	csrf: "/csrf",
	me: "/auth/me",
	logout: "/auth/logout",
	googleLogin: "/auth/google"
} as const;

const appRoutePrefix = process.env.NEXT_PUBLIC_FRONTEND_URL;

export { appRoutePrefix };

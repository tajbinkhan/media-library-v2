export const route = {
	public: {},
	private: {},
	protected: {}
};

export const apiRoute = {
	csrf: "/csrf"
} as const;

const appRoutePrefix = process.env.NEXT_PUBLIC_FRONTEND_URL;

export { appRoutePrefix };

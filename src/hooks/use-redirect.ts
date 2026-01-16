import { useContext } from "react";

import { RedirectContext } from "@/providers/RedirectProvider";

export default function useRedirect() {
	const context = useContext(RedirectContext);
	if (context === undefined) {
		throw new Error("useRedirect must be used within a RedirectProvider");
	}
	return context;
}

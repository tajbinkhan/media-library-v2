"use client";

import { useMemo } from "react";
import { Provider } from "react-redux";

import { type AppStore, makeStore } from "@/redux/store";

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
	const store = useMemo<AppStore>(() => makeStore(), []);

	return <Provider store={store}>{children}</Provider>;
}

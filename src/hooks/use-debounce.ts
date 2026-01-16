import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number) {
	// State to store the debounced value
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		// Set a timer to update the debounced value after the specified delay
		const timer = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		// Cleanup function: clears the timeout if the value or delay changes
		// before the timer fires. This is crucial for performance and preventing
		// memory leaks.
		return () => {
			clearTimeout(timer);
		};
	}, [value, delay]); // Only re-run the effect if value or delay changes

	return debouncedValue;
}

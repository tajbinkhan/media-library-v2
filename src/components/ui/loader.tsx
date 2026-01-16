import { Spinner } from "@/components/ui/spinner";

interface LoaderProps {
	/**
	 * Optional height for the loader component.
	 * Puts the loader in a container with the specified height in rem units.
	 * If not provided, defaults to 48rem.
	 */
	height?: number;
	text?: string;
}

export default function Loader({ height, text = "Loading..." }: LoaderProps) {
	return (
		<div
			className="flex h-96 w-full items-center justify-center gap-2"
			style={{
				height: height ? `${height}rem` : "48rem"
			}}
		>
			<Spinner className="animate-spin" />
			<span>{text}</span>
		</div>
	);
}

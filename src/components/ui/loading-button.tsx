import type { VariantProps } from "class-variance-authority";
import { Loader } from "lucide-react";
import React from "react";

import { Button, buttonVariants } from "@/components/ui/button";

interface LoadingButtonProps
	extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
	isLoading: boolean;
	loadingText: string;
	children: React.ReactNode;
	disabled?: boolean;
	className?: string;
	asChild?: boolean;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
	isLoading,
	children,
	loadingText,
	disabled = isLoading,
	className,
	...props
}) => {
	return (
		<Button type="submit" className={className} disabled={disabled} {...props}>
			{isLoading ? (
				<>
					<Loader className="size-4 animate-spin" aria-hidden="true" />
					{loadingText}
				</>
			) : (
				children
			)}
		</Button>
	);
};

export { LoadingButton };

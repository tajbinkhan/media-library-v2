"use client";

import { FileEdit, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
	const pathname = usePathname();

	const navItems = [
		{
			href: "/",
			label: "Library",
			icon: LayoutGrid,
			description: "View and manage media"
		},
		{
			href: "/form",
			label: "Form",
			icon: FileEdit,
			description: "Select media in forms"
		}
	];

	return (
		<nav className="mb-4 border-b bg-white shadow-xs dark:bg-gray-950">
			<div className="container mx-auto px-4">
				<div className="flex h-16 items-center justify-end">
					<div className="flex items-center gap-2">
						{navItems.map(item => {
							const isActive = pathname === item.href;
							const Icon = item.icon;

							return (
								<Link
									key={item.href}
									href={item.href}
									className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
										isActive
											? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
											: "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
									}`}
									title={item.description}
								>
									<Icon className="h-4 w-4" />
									{item.label}
								</Link>
							);
						})}
					</div>
				</div>
			</div>
		</nav>
	);
}

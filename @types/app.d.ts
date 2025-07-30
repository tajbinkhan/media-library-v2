interface GlobalLayoutProps {
	children: React.ReactNode;
}

interface GlobalValues {
	[key: string]: string | string[] | undefined;
}

interface GlobalCommonValues {
	label: string;
	value: string;
}

interface ApiSearchParams {
	page: number;
	limit: number;
	sortingMethod: string;
	sortBy: "asc" | "desc";
	search?: string;
	from?: Date;
	to?: Date;
}

interface TableSelectData {
	from: Date;
	to: Date;
}

interface Pagination {
	totalItems: number;
	limit: number;
	offset: number;
	currentPage: number;
	totalPages: number;
	hasPrevPage: boolean;
	hasNextPage: boolean;
	prevPage: number | null;
	nextPage: number | null;
}

interface ServiceApiResponse<T> {
	data: T;
	pagination?: Pagination;
	status: number;
	message: string;
}

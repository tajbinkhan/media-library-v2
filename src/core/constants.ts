export const siteTitle = "OneDesk Pro.";
export const initialPagination: Pagination = {
	currentPage: 1,
	limit: 10,
	offset: 0,
	totalItems: 0,
	totalPages: 0,
	hasNextPage: false,
	hasPrevPage: false,
	nextPage: 0,
	prevPage: 0
};
export const apiRoutePrefix = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';

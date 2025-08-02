"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { Plus, RefreshCcw, Search, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import MediaUploaderBox from "@/templates/Media/Components/MediaUploaderBox";
import { useMedia } from "@/templates/Media/Contexts/MediaContext";
import useCustomSWR from "@/templates/Media/Hooks/useCustomSWR";
import MediaPickerSingleView from "@/templates/Media/Picker/MediaPickerSingleView";
import { mediaApiRoutes } from "@/templates/Media/Routes/MediaRoutes";

interface MediaPickerGridViewProps {
	selectedValue?: MediaItem | MediaItem[] | null;
	onSelect?: (value: MediaItem | MediaItem[] | null) => void;
	multiple?: boolean;
	min?: number;
	max?: number;
	placeholder?: string;
}

export default function MediaPickerGridView({
	selectedValue,
	onSelect,
	multiple = false,
	min = 0,
	max = 1,
	placeholder = "Select media"
}: MediaPickerGridViewProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedItems, setSelectedItems] = useState<MediaItem[]>([]);

	// Initialize selected items based on props
	useEffect(() => {
		if (multiple) {
			// For multiple selection, selectedValue should be an array
			if (Array.isArray(selectedValue)) {
				setSelectedItems(selectedValue);
			} else if (selectedValue) {
				setSelectedItems([selectedValue]);
			} else {
				setSelectedItems([]);
			}
		} else {
			// For single selection, convert to array for consistent handling
			if (Array.isArray(selectedValue)) {
				setSelectedItems(selectedValue.slice(0, 1)); // Take only first item
			} else if (selectedValue) {
				setSelectedItems([selectedValue]);
			} else {
				setSelectedItems([]);
			}
		}
	}, [selectedValue, multiple]);

	// ========================================================================
	// Selection Logic
	// ========================================================================

	const handleItemSelect = (item: MediaItem) => {
		if (multiple) {
			const isAlreadySelected = selectedItems.some(selected => selected.id === item.id);

			if (isAlreadySelected) {
				// Remove item from selection
				const newSelection = selectedItems.filter(selected => selected.id !== item.id);
				// Check minimum constraint
				if (newSelection.length >= min) {
					setSelectedItems(newSelection);
					onSelect?.(newSelection);
				}
			} else {
				// Add item to selection
				if (selectedItems.length < max) {
					const newSelection = [...selectedItems, item];
					setSelectedItems(newSelection);
					onSelect?.(newSelection);
				}
			}
		} else {
			// Single selection
			const newSelection =
				selectedItems.length > 0 && selectedItems[0].id === item.id ? [] : [item];
			setSelectedItems(newSelection);
			onSelect?.(newSelection.length > 0 ? newSelection[0] : null);
		}
	};

	const isItemSelected = (item: MediaItem): boolean => {
		return selectedItems.some(selected => selected.id === item.id);
	};

	const isItemDisabled = (item: MediaItem): boolean => {
		if (multiple) {
			// For multiple selection, disable if max is reached and item is not already selected
			return selectedItems.length >= max && !isItemSelected(item);
		}
		return false;
	};

	const { isUploaderOpen, openUploader, closeUploader } = useMedia();

	const {
		data: response,
		error,
		isLoading,
		refresh
	} = useCustomSWR<MediaListResponse>(mediaApiRoutes.media);

	// ========================================================================
	// Data Processing
	// ========================================================================

	const mediaItems = useMemo(() => response?.data || [], [response?.data]);
	const filteredItems = useMemo(() => {
		return mediaItems.filter(
			item =>
				!searchQuery || item.originalFilename?.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}, [mediaItems, searchQuery]);

	// Ref for virtualization container
	const parentRef = useRef<HTMLDivElement>(null);

	// Calculate columns based on screen size
	const getColumnsCount = useCallback(() => {
		if (typeof window === "undefined") return 6;
		const width = window.innerWidth;
		if (width < 640) return 2; // sm
		if (width < 768) return 3; // md
		if (width < 1024) return 4; // lg
		if (width < 1280) return 5; // xl
		return 6; // 2xl and above
	}, []);

	const [columnsCount, setColumnsCount] = useState(6);

	// Update columns on window resize
	useEffect(() => {
		const updateColumns = () => {
			setColumnsCount(getColumnsCount());
		};

		updateColumns(); // Initial setup
		window.addEventListener("resize", updateColumns);
		return () => window.removeEventListener("resize", updateColumns);
	}, [getColumnsCount]);

	// Group items into rows for virtualization
	const virtualRows = useMemo(() => {
		const rows = [];
		for (let i = 0; i < filteredItems.length; i += columnsCount) {
			rows.push(filteredItems.slice(i, i + columnsCount));
		}
		return rows;
	}, [filteredItems, columnsCount]);

	// Use virtualization only for large lists
	const shouldUseVirtualization = filteredItems.length > 30;

	// Virtualization setup (only for large lists)
	const rowVirtualizer = useVirtualizer({
		count: virtualRows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 280, // Better estimated row height
		overscan: 3,
		enabled: shouldUseVirtualization
	});

	return (
		<>
			{/* Upload Modal */}
			<MediaUploaderBox isOpen={isUploaderOpen} onClose={closeUploader} />
			<Dialog>
				<DialogTrigger asChild>
					<Button variant="outline" className="flex min-h-12 items-center gap-2 p-3">
						<Plus size={20} />
						<span className="text-sm">
							{selectedItems.length > 0
								? multiple
									? `Add more (${selectedItems.length}/${max} selected)`
									: "Change selection"
								: placeholder}
						</span>
					</Button>
				</DialogTrigger>
				<DialogContent className="w-full lg:max-w-[80rem]" style={{ maxHeight: "90vh" }}>
					<DialogHeader>
						<DialogTitle>Media Library</DialogTitle>
						<DialogDescription>
							{multiple
								? `Select between ${min} and ${max} media items. Currently selected: ${selectedItems.length}`
								: "Select a media item to add to your form."}
						</DialogDescription>
					</DialogHeader>

					<div>
						<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<Badge className="mt-1 text-sm">
									{isLoading ? (
										<span className="flex items-center">
											<span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-b-2 border-blue-500"></span>
											Loading media files...
										</span>
									) : (
										`${filteredItems.length} of ${mediaItems.length} media ${mediaItems.length === 1 ? "file" : "files"}`
									)}
								</Badge>
							</div>

							<div className="flex items-center gap-3">
								{/* Search */}
								<div className="relative">
									<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
									<Input
										placeholder="Search files..."
										value={searchQuery}
										onChange={e => setSearchQuery(e.target.value)}
										className="w-64 border-gray-200 bg-white pl-10 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:focus:border-blue-400"
									/>
								</div>

								{/* Upload Button */}
								<Button
									onClick={openUploader}
									variant="default"
									size="sm"
									className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
									title="Upload new media files"
								>
									<Upload className="h-4 w-4" />
								</Button>

								{/* Refresh Button */}
								{filteredItems.length > 0 && (
									<Button
										onClick={refresh}
										variant="outline"
										size="sm"
										disabled={isLoading}
										title="Refresh media library"
									>
										<RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
									</Button>
								)}
							</div>
						</div>
					</div>
					<ScrollArea className="h-[70vh]" ref={parentRef}>
						<div className="pr-4">
							{shouldUseVirtualization ? (
								// Virtualized rendering for large lists
								<div
									style={{
										height: `${rowVirtualizer.getTotalSize()}px`,
										width: "100%",
										position: "relative"
									}}
								>
									{rowVirtualizer.getVirtualItems().map(virtualRow => (
										<div
											key={virtualRow.index}
											style={{
												position: "absolute",
												top: 0,
												left: 0,
												width: "100%",
												height: `${virtualRow.size}px`,
												transform: `translateY(${virtualRow.start}px)`
											}}
										>
											<div className="grid grid-cols-2 gap-6 p-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
												{virtualRows[virtualRow.index]?.map(item => (
													<MediaPickerSingleView
														key={item.id}
														item={item}
														refresh={refresh}
														isSelected={isItemSelected(item)}
														onSelect={() => handleItemSelect(item)}
														disabled={isItemDisabled(item)}
													/>
												))}
											</div>
										</div>
									))}
								</div>
							) : (
								// Simple rendering for smaller lists
								<div className="grid grid-cols-2 gap-6 p-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
									{filteredItems.map(item => (
										<MediaPickerSingleView
											key={item.id}
											item={item}
											refresh={refresh}
											isSelected={isItemSelected(item)}
											onSelect={() => handleItemSelect(item)}
											disabled={isItemDisabled(item)}
										/>
									))}
								</div>
							)}
						</div>
					</ScrollArea>
				</DialogContent>
			</Dialog>
		</>
	);
}

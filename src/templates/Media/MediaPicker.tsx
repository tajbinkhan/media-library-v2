import MediaPreview from "@/templates/Media/Components/MediaPreview";
import { MediaProvider } from "@/templates/Media/Contexts/MediaContext";
import MediaPickerGridView from "@/templates/Media/Picker/MediaPickerGridView";

// MediaItem is defined globally in Types/Media.d.ts

export interface MediaPickerProps {
	value?: MediaItem | MediaItem[] | null;
	onChange?: (value: MediaItem | MediaItem[] | null) => void;
	multiple?: boolean;
	min?: number;
	max?: number;
	placeholder?: string;
}

export default function MediaPicker({
	value,
	onChange,
	multiple = false,
	min = 0,
	max = 1,
	placeholder = "Select media"
}: MediaPickerProps) {
	const handleMediaSelect = (selectedMedia: MediaItem | MediaItem[] | null) => {
		if (onChange) {
			onChange(selectedMedia);
		}
	};

	const handleRemoveItem = (itemToRemove: MediaItem) => {
		if (multiple && Array.isArray(value)) {
			const newValue = value.filter(item => item.id !== itemToRemove.id);
			onChange?.(newValue.length > 0 ? newValue : null);
		} else {
			onChange?.(null);
		}
	};

	// Convert value to array for consistent handling
	const selectedItems: MediaItem[] = multiple
		? Array.isArray(value)
			? value
			: value
				? [value]
				: []
		: value
			? [value as MediaItem]
			: [];

	return (
		<div className="space-y-4">
			{/* Selected Media Preview */}
			{selectedItems.length > 0 && (
				<div className="space-y-3">
					<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
						Selected Media ({selectedItems.length})
					</label>
					<div
						className={`grid gap-4 ${
							multiple
								? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
								: "max-w-[120px] grid-cols-1"
						}`}
					>
						{selectedItems.map(item => (
							<MediaPreview
								key={item.id}
								item={item}
								onRemove={() => handleRemoveItem(item)}
								className="w-full"
							/>
						))}
					</div>
				</div>
			)}

			{/* Media Picker */}
			<MediaProvider>
				<MediaPickerGridView
					selectedValue={value}
					onSelect={handleMediaSelect}
					multiple={multiple}
					min={min}
					max={max}
					placeholder={placeholder}
				/>
			</MediaProvider>
		</div>
	);
}

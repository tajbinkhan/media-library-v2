import { MediaProvider } from "@/templates/Media/Contexts/MediaContext";
import MediaTemplate from "@/templates/Media/MediaTemplate";

export default function Page() {
	return (
		<div className="px-5">
			<MediaProvider>
				<MediaTemplate />
			</MediaProvider>
		</div>
	);
}

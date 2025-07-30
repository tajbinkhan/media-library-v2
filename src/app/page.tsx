import MediaTemplate from "@/templates/Media/MediaTemplate";
import { MediaProvider } from "@/templates/Media/contexts/MediaContext";

export default function Media() {
	return (
		<MediaProvider>
			<MediaTemplate />
		</MediaProvider>
	);
}

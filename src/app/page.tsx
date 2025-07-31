import { MediaProvider } from "@/templates/Media/Contexts/MediaContext";
import MediaTemplate from "@/templates/Media/MediaTemplate";

export default function Media() {
	return (
		<MediaProvider>
			<MediaTemplate />
		</MediaProvider>
	);
}

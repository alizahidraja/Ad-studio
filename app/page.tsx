import StudioWorkspace from "@/components/studio/StudioWorkspace";
import { Providers } from "./providers";

export default function Home() {
  return (
    <Providers>
      <StudioWorkspace />
    </Providers>
  );
}

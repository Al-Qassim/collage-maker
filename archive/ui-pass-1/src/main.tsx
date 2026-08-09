import { createRoot } from "react-dom/client";
import { CollageProvider, useCollageCommands, useCollageState } from "./ui/features/collage/CollageProvider";
import { CollageMakerScreen } from "./ui/features/collage/ui/CollageMakerScreen";
import "./styles.css";

function CollageFeature() {
  return <CollageMakerScreen state={useCollageState()} commands={useCollageCommands()} />;
}

createRoot(document.getElementById("root")!).render(<CollageProvider><CollageFeature /></CollageProvider>);

import { createRoot } from "react-dom/client";
import { createBrowserDataServices } from "./data-service";
import { CollageApp } from "./ui/CollageApp";
import { CollageScreenProvider } from "./ui/logic/CollageScreenProvider";
import "./styles.css";

const services = createBrowserDataServices();

createRoot(document.getElementById("root")!).render(
  <CollageScreenProvider services={services}>
    <CollageApp services={services} />
  </CollageScreenProvider>,
);

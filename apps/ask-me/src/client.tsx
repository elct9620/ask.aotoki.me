import { render } from "hono/jsx/dom";
import "virtual:uno.css";

const app = document.getElementById("app");
if (!app) {
  throw new Error("No app element found");
}
render(<p class="font-bold">Working in progress...</p>, app);

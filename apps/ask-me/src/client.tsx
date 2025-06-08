import { App } from "@/view/App";
import { render } from "hono/jsx/dom";

const app = document.getElementById("app");
if (!app) {
  throw new Error("No app element found");
}
render(<App />, app);

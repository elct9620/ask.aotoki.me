import { render } from "hono/jsx/dom";

const app = document.getElementById("app");
if (!app) {
  throw new Error("No app element found");
}
render(<p class="px-8 py-4">Working in progress...</p>, app);

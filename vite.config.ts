import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
	plugins: [preact()],
	base: command === "serve" ? "/" : "/amphioxi",
}));

import { $ } from "bun";
import { zip } from "zip-a-folder";
import Manifest from "./src/manifest.json";

await $`mkdir -p build`;
await zip(
    "dist",
    `build/${Manifest["name"]}-${Manifest["version"]}-${new Date().toDateString()}.zip`,
);

console.log("packaged extension");

process.exit(0);

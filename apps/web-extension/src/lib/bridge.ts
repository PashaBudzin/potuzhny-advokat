import browser from "webextension-polyfill";
window.addEventListener("message", (e) => {
    console.log("bridge received message:", e.data?.type);
    if (e.data?.type === "BLOB_SOURCE") {
        browser.runtime.sendMessage({ type: "BLOB_SOURCE", content: e.data.content });
    }
});

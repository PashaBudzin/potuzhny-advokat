import browser from "webextension-polyfill";

browser.runtime.onMessage.addListener((msg) => {
    if (msg.type === "BLOB_SOURCE") {
        browser.storage.session.set({ blobSource: msg.content });
    }
});

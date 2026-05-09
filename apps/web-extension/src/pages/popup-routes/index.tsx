import { useEffect, useState } from "react";
import browser from "webextension-polyfill";

export default function MainPage() {
    const [source, setSource] = useState("");

    useEffect(() => {
        browser.storage.session.get("blobSource").then((result) => {
            setSource(result.blobSource ?? "nothing captured yet");
        });

        const listener = (changes: Record<string, browser.Storage.StorageChange>) => {
            if (changes.blobSource) {
                setSource(changes.blobSource.newValue ?? "");
            }
        };
        browser.storage.session.onChanged.addListener(listener);
        return () => browser.storage.session.onChanged.removeListener(listener);
    }, []);

    return (
        <textarea
            value={source}
            readOnly
            rows={20}
            style={{ width: "100%", fontFamily: "monospace" }}
        />
    );
}

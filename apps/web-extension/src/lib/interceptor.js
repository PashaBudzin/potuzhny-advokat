const originalCreateObjectURL = URL.createObjectURL.bind(URL);

URL.createObjectURL = function (blob) {
    const url = originalCreateObjectURL(blob);
    blob.text().then((text) => {
        window.postMessage({ type: "BLOB_SOURCE", content: text }, "*");
    });
    return url;
};

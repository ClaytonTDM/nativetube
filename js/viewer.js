const viewer = document.getElementById("viewer"); // this is a webview element
let currentVideo;
let lastVideo;
let lastUrl = document.location.search.split("?call=")[1];

if (lastUrl == undefined || lastUrl == "") {
    lastUrl = "https://youtube.com";
}

// go to callback url if it exists
if (document.location.hash !== "" && document.location.hash !== "#") {
    // wait for dom to load (outside viewer)
    viewer.addEventListener("dom-ready", () => {
        viewer.loadURL(
            decodeURIComponent(document.location.hash.split("#")[1]).replace(
                "&vp9=true",
                ""
            )
        );
        document.location.hash = "";
        viewer.removeEventListener("dom-ready", () => {});
    });
}

// viewer.setAudioMuted(true);

viewer.addEventListener("console-message", (e) => {
    if (e.level == 0) {
        console.log(e.message);
    } else if (e.level == 1) {
        console.info(e.message);
    } else if (e.level == 2) {
        console.warn(e.message);
    } else if (e.level == 3) {
        console.error(e.message);
    }
});

// watch for changes to the url, and alert if it includes /watch?v=
viewer.addEventListener("did-navigate-in-page", (e) => {
    let currentUrl = viewer.getURL();
    if (currentUrl.includes("/watch?v=") || currentUrl.includes("/shorts/")) {
        currentVideo = currentUrl;
        if (currentVideo !== lastVideo) {
            lastVideo = currentVideo;
            if (currentUrl.includes("/shorts/")) {
                viewer.loadURL(lastUrl);
                alert("Shorts are not supported in this app.");
            } else {
                document.location.replace(
                    `download.html?callback=${encodeURIComponent(lastUrl)}#${
                        currentUrl.split("/watch?v=")[1].split("&")[0]
                    }`
                );
            }
        }
    }
    lastUrl = currentUrl;
});

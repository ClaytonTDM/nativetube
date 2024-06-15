const fs = require("fs");
const path = require("path");
const stream = require("stream");
const { promisify } = require("util");
const pipeline = promisify(stream.pipeline);
const { shell } = require("electron");
const id = document.location.hash.split("#")[1];
const urlParams = new URLSearchParams(window.location.search);
const vp9 = urlParams.get("vp9") === "true";
let filePath;

document.querySelector("#title").innerText = `Getting video ${id}...`;

fetch("https://api.cobalt.tools/api/json", {
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        url: `https://youtube.com/watch?v=${id}`,
        vCodec: vp9 ? "vp9" : "av1",
        vQuality: "max",
    }),
    method: "POST",
})
    .then((res) => res.json())
    .then(async (data) => {
        if (data.error) {
            document.querySelector("#title").innerText = `Error: ${data.error}`;
        } else {
            document.querySelector(
                "#title"
            ).innerText = `Downloading video ${id}...`;
            // download into ../downloads
            filePath = path.join(
                __dirname,
                "..",
                "downloads",
                `${id}.${vp9 ? "webm" : "mp4"}`
            );
            const response = await fetch(data.url).catch((err) => {
                // reload but add "&vp9=true" to the url behind the hash
                document.location.replace(
                    document.location.href.split("#")[0] + "&vp9=true#" + document.location.href.split("#")[1]
                );
            });
            await pipeline(response.body, fs.createWriteStream(filePath));
            document.querySelector(
                "#title"
            ).innerText = `Attempting to open video ${id}...`;
            shell.openPath(filePath);

            // detect when the video is closed and delete the file
            const checkIfFileIsClosed = setInterval(() => {
                fs.open(filePath, "r+", (err, fd) => {
                    if (!err) {
                        fs.close(fd, () => {});
                        clearInterval(checkIfFileIsClosed);
                        // add hidden class to the title and remove it from #download
                        document.querySelector("#title").classList.add("hidden");
                        document.querySelector("#download").classList.remove("hidden");
                    }
                });
            }, 1000);
        }
    });

function callback() {
    // delete the file
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(err);
        }
    });
    // redirect to the callback url (from query string)
    const callback = document.location.search.split("?callback=")[1];

    if (callback) {
        document.location.replace("app.html#" + callback);
    } else {
        window.close();
    }
}

(function () {
    "use strict";
    function loadFileInfo() {
        let img = document.querySelector("#main-media");
        let fileInfoId = img.dataset.fileinfoid;
        if (!fileInfoId) return;

        fetch(`/api/media/${fileInfoId}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new TypeError("Oops, we haven't got JSON!");
                }
                return response.json();
            })
            .then((data) => {
                img.alt = data["Name"];
                img.src = data["FileURL"];
                img.parentElement.href = img.src;

                renderMetadataSection(data);

                document.title = data["Name"] + " " + document.title;
            })
            .catch((error) => {
                document.querySelector(".metadata-container").innerHTML = `
                    <div class="alert alert-warning w-100">
                        <strong>Sorry!</strong> We have problems finding the requested media details.
                    </div>`;
                document.title = "Oops! " + document.title;
                console.error(error);
            });
    }
    function renderMetadataSection(data) {
        let template = document.querySelector("#metadata-section");
        let clone = template.content.cloneNode(true);
        let h4 = clone.querySelector("h4");
        h4.textContent = data["Name"];

        let geo = clone.querySelector(".metadata-geo span");
        geo.textContent = formatLatLng(data["Location"].coordinates);

        let taken = clone.querySelector(".metadata-taken span");
        let uploaded = clone.querySelector(".metadata-uploaded span");
        taken.textContent += formatDate(data["DateTaken"]);
        uploaded.textContent += formatDate(data["UploadDate"]);

        let details = clone.querySelector(".metadata-details dl");
        details.appendChild(renderMediaDetails(data));

        let tags = clone.querySelector(".metadata-tags div");
        tags.appendChild(renderTagList(data["Tag"]));

        let target = document.querySelector(".metadata-container");
        let targetClone = target.cloneNode(false);
        targetClone.appendChild(clone);
        target.parentNode.replaceChild(targetClone, target);
    }
    function formatLatLng(coords) {
        let decimalPlaces = 5;
        return (
            coords[1].toFixed(decimalPlaces) +
            ", " +
            coords[0].toFixed(decimalPlaces)
        );
    }
    function formatDate(date) {
        let options = { year: "numeric", month: "short", day: "2-digit" };
        return new Intl.DateTimeFormat("en-GB", options).format(new Date(date));
    }
    function renderMediaDetails(data) {
        let fragment = new DocumentFragment();
        let template = document.querySelector("#details-row");
        let attribs = new Map();
        attribs.set("Project", "Project");
        attribs.set("Event", "Event");
        attribs.set("LocationName", "Location");
        attribs.set("Copyright", "Copyright");
        for (let [key, label] of attribs) {
            let clone = template.content.cloneNode(true);
            let dt = clone.querySelector("dt");
            let dd = clone.querySelector("dd");
            dt.textContent = label;
            dd.textContent = data[key];
            fragment.appendChild(clone);
        }
        return fragment;
    }
    function renderTagList(tags) {
        let fragment = new DocumentFragment();
        let template = document.querySelector("#tags-btn");
        tags.forEach(function (tag) {
            let btn = template.content.firstElementChild.cloneNode(true);
            btn.textContent = tag;
            fragment.appendChild(btn);
        });
        return fragment;
    }

    loadFileInfo();
})();

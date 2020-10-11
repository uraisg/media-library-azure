(function () {
    "use strict";
    function initFilters() {
        let filterInputs = document.querySelectorAll(
            ".filter-sidebar input, .filter-sidebar select"
        );
        let applyButton = document.querySelector(".filter-sidebar button");
        if (!filterInputs.length || !applyButton) return;
        // Enable apply button only when selected filters have changed
        applyButton.classList.add("disabled");
        Array.prototype.forEach.call(filterInputs, (element) => {
            element.addEventListener("change", () => {
                applyButton.classList.remove("disabled");
            });
        });
    }

    initFilters();
    $('[data-toggle="tooltip"]').tooltip();
    $("#gallery").justifiedGallery({
        lastRow: "nojustify",
        margins: 5,
    });
})();

(function () {
    "use strict";
    function initFilters() {
        let filterInputs = document.querySelectorAll(
            ".filter-sidebar input, .filter-sidebar select"
        );
        let applyButton = document.querySelector(".filter-sidebar button");
        if (!filterInputs.length || !applyButton) return;

        setInitialDate("#filter-date-from", "#MinDateTaken");
        setInitialDate("#filter-date-to", "#MaxDateTaken");

        // Enable apply button only when selected filters have changed
        applyButton.classList.add("disabled");
        Array.prototype.forEach.call(filterInputs, (element) => {
            element.addEventListener("change", () => {
                applyButton.classList.remove("disabled");
            });
        });
    }
    function setInitialDate(controlSelector, formInputSelector) {
        let formInput = document.querySelector(formInputSelector);
        let control = document.querySelector(controlSelector);
        let initialValue = parseInt(formInput.value, 10) * 1000;
        if (!Number.isNaN(initialValue)) control.valueAsNumber = initialValue;
        control.addEventListener("change", () => {
            formInput.value = control.valueAsNumber / 1000;
        });
    }

    initFilters();
    $('[data-toggle="tooltip"]').tooltip();
    $("#gallery").justifiedGallery({
        lastRow: "nojustify",
        margins: 5,
    });
})();

(function () {

    function show() {
        const loader = document.getElementById("global-loader");
        if (!loader) return;

        loader.classList.add("active");
        document.body.classList.add("loader-active");
    }

    function hide() {
        const loader = document.getElementById("global-loader");
        if (!loader) return;

        loader.classList.remove("active");
        document.body.classList.remove("loader-active");
    }

    window.LoaderUtils = {
        show,
        hide
    };

})();
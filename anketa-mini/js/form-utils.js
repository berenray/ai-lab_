(function () {
    function insertHidden(form, name, value) {
        if (!form || !value) return;

        let input = form.querySelector(`input[name="${name}"]`);
        if (!input) {
            input = document.createElement("input");
            input.type = "hidden";
            input.name = name;
            form.appendChild(input);
        }
        input.value = value;
    }

    // робимо глобально доступною
    window.FormUtils = {
        insertHidden
    };
})();

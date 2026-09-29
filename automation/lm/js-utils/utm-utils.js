(function () {
    const UTM_KEYS = ["utm_source","utm_campaign","utm_content","utm_term","utm_medium"];

    function captureUTMs() {
        const params = new URLSearchParams(location.search);
        UTM_KEYS.forEach(k => {
            if (params.get(k)) localStorage.setItem(k, params.get(k));
        });
    }

    function applyUTMs(form) {
        UTM_KEYS.forEach(k => {
            const input = form.querySelector(`input[name="${k}"]`);
            if (input) input.value = localStorage.getItem(k) || "";
        });
    }

    function getUTM(key) {
        return encodeURIComponent(localStorage.getItem(key) || "");
    }

    window.UTMUtils = { captureUTMs, applyUTMs, getUTM };
})();

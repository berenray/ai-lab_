document.addEventListener("DOMContentLoaded", () => {

    const PARAM_KEYS = [
        "utm_source",
        "utm_campaign",
        "utm_content",
        "utm_term",
        "utm_medium"
    ];

    const params = new URLSearchParams(window.location.search);

    PARAM_KEYS.forEach(key => {
        const value = params.get(key);
        if (value) {
            localStorage.setItem(key, value);
        }
    });

    const links = document.querySelectorAll("a[href]");

    links.forEach(link => {

        try {

            const url = new URL(link.href, window.location.origin);

            PARAM_KEYS.forEach(key => {
                const storedValue = localStorage.getItem(key);
                if (storedValue) {
                    url.searchParams.set(key, storedValue);
                }
            });
            link.href = url.toString();

        } catch(e) {}

    });

});
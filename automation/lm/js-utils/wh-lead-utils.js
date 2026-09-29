(function () {

    const WEBHOOK_URL =
        "https://gapi.onlizer.com/api/webhook/olikatkadi-hub.com-9e7d14a5d8124542b60548088bb0980d/8f216caf7d9241ed8c36376d8731b6b7/webhook";

    const FIELD_MAP = {
        "Телефон": "phone",
        "Телеграм": "telegram",
        "Ім'я": "name"
    };

    function getUTM(key) {
        return localStorage.getItem(key) || "";
    }

    function normalizeFields(fields) {
        const normalized = {};

        Object.keys(fields).forEach(key => {
            const mappedKey = FIELD_MAP[key] || key;
            normalized[mappedKey] = fields[key];
        });

        return normalized;
    }

    function send(form, extraPayload = {}) {
        if (!form) return;

        const formData = new FormData(form);
        const rawFields = Object.fromEntries(formData.entries());

        const fields = normalizeFields(rawFields);

        const urlParams = Object.fromEntries(
            new URLSearchParams(window.location.search)
        );

        const payload = {
            title: "lead",
            request_type: "лід-магніт",
            stage: 64,
            source: 9,

            page_source: window.location.origin + window.location.pathname,
            eid: extraPayload.eid || Date.now(),

            ...fields,

            utm_source: getUTM("utm_source"),
            utm_medium: getUTM("utm_medium"),
            utm_campaign: getUTM("utm_campaign"),
            utm_term: getUTM("utm_term"),
            utm_content: getUTM("utm_content"),

            ...urlParams
        };

        fetch(WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        }).catch(err => console.warn("Webhook error:", err));
    }

    window.OnlizerWebhook = { send };

})();
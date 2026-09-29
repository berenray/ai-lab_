function getStrimixAvid(retries = 5) {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            const value = document.cookie
                .split('; ')
                .find(row => row.startsWith('strimix_avid='))
                ?.split('=')[1];

            if (value || retries <= 0) {
                clearInterval(interval);
                resolve(value || '');
            }

            retries--;
        }, 100);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form");
    if (!form) return;

    UTMUtils.captureUTMs();
    UTMUtils.applyUTMs(form);

    FormUtils.insertHidden(
        form,
        "page_source",
        window.location.origin + window.location.pathname
    );
    FormUtils.insertHidden(form, "Час", new Date().toLocaleTimeString("uk-UA"));

    const phoneInput = form.querySelector('input[name="Телефон"]');
    const userName = form.querySelector(`input[name="Email"]`);
    const phoneError = document.getElementById("phone-error");
    const submitBtn = document.getElementById("submit-btn-1");

    function clearErrors() {
        form.querySelectorAll('.field-error, .quiz-error, .checkbox-error, .error-animate')
            .forEach(el => el.classList.remove('field-error', 'quiz-error', 'checkbox-error', 'error-animate'));
    }

    function showPhoneError() {
        phoneError.style.opacity = "1";
        phoneInput.classList.add("input-error");

        const wrapper = phoneInput.closest('.field-group');
        if (wrapper) {
            wrapper.classList.add('field-error', 'error-animate');
            wrapper.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        form.dataset.submitted = "false";
    }

    function validateForm(form) {
        let firstInvalid = null;

        clearErrors();

        const textFields = form.querySelectorAll(
            'input[required]:not([type="radio"]):not([type="checkbox"]):not([name="Телефон"]), textarea[required]'
        );

        textFields.forEach(input => {
            if (!input.value.trim()) {
                const wrapper = input.closest('.field-group') || input.parentElement;

                if (wrapper) {
                    wrapper.classList.add('field-error', 'error-animate');
                    if (!firstInvalid) firstInvalid = wrapper;
                }
            }
        });

        const radioNames = [...new Set(
            [...form.querySelectorAll('input[type="radio"]')].map(r => r.name)
        )];

        radioNames.forEach(name => {
            const radios = form.querySelectorAll(`input[type="radio"][name="${name}"]`);
            const checked = [...radios].some(r => r.checked);

            if (!checked && radios.length) {
                const block = radios[0].closest('.quiz-block');

                if (block) {
                    block.classList.add('quiz-error', 'error-animate');
                    if (!firstInvalid) firstInvalid = block;
                }
            }
        });

        const checkboxes = form.querySelectorAll('input[type="checkbox"][required]');
        checkboxes.forEach(cb => {
            if (!cb.checked) {
                const wrapper = cb.closest('.checkbox-item');

                if (wrapper) {
                    wrapper.classList.add('checkbox-error', 'error-animate');
                    if (!firstInvalid) firstInvalid = wrapper;
                }
            }
        });

        if (firstInvalid) {
            firstInvalid.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
            return false;
        }

        return true;
    }

    form.addEventListener('input', (e) => {
        const field = e.target;

        if (field.matches('input:not([type="radio"]):not([type="checkbox"]), textarea')) {
            const wrapper = field.closest('.field-group');
            if (wrapper) {
                wrapper.classList.remove('field-error', 'error-animate');
            }
        }
    });

    form.addEventListener('change', (e) => {
        const field = e.target;

        if (field.type === 'radio') {
            const block = field.closest('.quiz-block');
            if (block) {
                block.classList.remove('quiz-error', 'error-animate');
            }
        }

        if (field.type === 'checkbox') {
            const wrapper = field.closest('.checkbox-item');
            if (wrapper) {
                wrapper.classList.remove('checkbox-error', 'error-animate');
            }
        }
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const strimixAvid = await getStrimixAvid();

        if (!validateForm(form)) return;

        if (form.dataset.submitted === "true") return;
        form.dataset.submitted = "true";

        const rawPhone = phoneInput.value.trim();

        if (!rawPhone) {
            showPhoneError();
            return;
        }

        const phoneObj = PhoneUtils.validatePhone(rawPhone);
        const digits = rawPhone.replace(/\D/g, "");

        if (!phoneObj || PhoneUtils.isObviouslyFakeNumber(digits)) {
            showPhoneError();
            return;
        }
        LoaderUtils.show();

        phoneError.style.opacity = "0";
        phoneInput.classList.remove("input-error");

        const phoneWrapper = phoneInput.closest('.field-group');
        if (phoneWrapper) {
            phoneWrapper.classList.remove('field-error', 'error-animate');
        }

        const normalizedPhone = phoneObj.number;
        phoneInput.value = normalizedPhone;

        const eid = Date.now();
        FormUtils.insertHidden(form, "eid", eid);
        FormUtils.insertHidden(form, "strimix_avid", strimixAvid);

        submitBtn.disabled = true;

        try {
            await fetch(
                "https://script.google.com/macros/s/AKfycbz4ZqNEYkrCjpUABrxqJy0LqLoQevnBuUJ1J4ZkIXKQjFYxzczQdiacUWy5pZIDQxvLrQ/exec",
                {
                    method: "POST",
                    body: new FormData(form)
                }
            );
        } catch (err) {
            console.error("Google Sheets error:", err);
        }

        const webhookUrl =
            "https://gapi.onlizer.com/api/webhook/olikatkadi-hub.com-9e7d14a5d8124542b60548088bb0980d/b5351313a94b4de2b9a0297bd05bd8fc/webhook";

        const formData = new FormData(form);
        const rawFields = Object.fromEntries(formData.entries());

        const FIELD_MAP = {
            "Телефон": "phone",
            "Email": "email"
        };

        const normalizedFields = {};

        Object.keys(rawFields).forEach(key => {
            const mappedKey = FIELD_MAP[key] || key;
            normalizedFields[mappedKey] = rawFields[key];
        });

        const payload = {
            title: "Заявки ЛМ",
            request_type: "",
            stage: 64,
            source: 11,
            page_source: window.location.origin + window.location.pathname,
            eid: eid,
            strimix_avid: strimixAvid || '',

            ...normalizedFields,

            utm_source: localStorage.getItem("utm_source") || "",
            utm_medium: localStorage.getItem("utm_medium") || "",
            utm_campaign: localStorage.getItem("utm_campaign") || "",
            utm_term: localStorage.getItem("utm_term") || "",
            utm_content: localStorage.getItem("utm_content") || "",
        };

        try {
            await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        } catch (err) {
            console.warn("Webhook error:", err);
        }

        if (typeof fbq === "function") {
            fbq("track", "Lead", {}, { eventID: eid });
        }

        const knowledgeEl = form.querySelector('input[name="Рівень знань"]:checked');
        const incomeEl = form.querySelector('input[name="Місячний дохід"]:checked');

        const segment = knowledgeEl?.dataset.segment;
        const income = incomeEl?.dataset.income;

        const isEven = eid % 2 === 0;

        let baseUrl = "https://ai-expert.space/anketalm/thanks1";

        // beginner + low
        if (segment === "beginner" && income === "low") {
            baseUrl = isEven
                ? "https://ai-expert.space/anketalm/thanks1"
                : "https://ai-expert.space/anketalm/thanks3";
        }

        // advanced + high
        else if (segment === "advanced" && income === "high") {
            baseUrl = isEven
                ? "https://ai-expert.space/anketalm/thanks2"
                : "https://ai-expert.space/anketalm/thanks4";
        }
        
        const urlWithUtms = `${baseUrl}` +
            `?utm_source=${UTMUtils.getUTM("utm_source")}` +
            `&utm_campaign=${UTMUtils.getUTM("utm_campaign")}` +
            `&utm_content=${UTMUtils.getUTM("utm_content")}` +
            `&utm_term=${UTMUtils.getUTM("utm_term")}` +
            `&utm_medium=${UTMUtils.getUTM("utm_medium")}` +
            `&strimix_avid=${encodeURIComponent(strimixAvid || '')}`;

        setTimeout(() => {
            window.location.href = urlWithUtms;
        }, 50);
    });
});
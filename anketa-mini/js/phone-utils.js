(function () {

    function normalizeInput(raw) {
        return raw.replace(/[^\d+]/g, "").trim();
    }

    function isObviouslyFakeNumber(num) {
        const digits = num.replace(/\D/g, "");

        // Length sanity (MAIN protection)
        if (digits.length < 10 || digits.length > 13) return true;

        // Same digit spam (0000000000, 1111111111)
        if (/^(\d)\1{6,}$/.test(digits)) return true;

        // Low entropy (e.g. 1212121212)
        if (new Set(digits.split("")).size <= 3) return true;

        // Sequential patterns
        if (/(012345|123456|234567|345678|456789|567890|678901|987654|876543)/.test(digits)) return true;

        // Too many trailing zeros
        if (/0{4,}$/.test(digits)) return true;

        return false;
    }

    function validatePhone(rawPhone) {
        if (!rawPhone) return null;

        rawPhone = normalizeInput(rawPhone);
        let digits = rawPhone.replace(/\D/g, "");

        // 🔥 HARD LENGTH FILTER (fixes your main issue)
        if (digits.length < 10 || digits.length > 13) return null;

        let phone;

        try {
            // ✅ CASE 1: Full international (+380...)
            if (rawPhone.startsWith("+")) {
                phone = libphonenumber.parsePhoneNumberFromString(rawPhone);
            }

            // ✅ CASE 2: Ukrainian local (093...)
            else if (digits.length === 10 && digits.startsWith("0")) {
                phone = libphonenumber.parsePhoneNumberFromString(digits, "UA");
            }

            // ✅ CASE 3: UA without + (380...)
            else if (digits.length === 12 && digits.startsWith("380")) {
                phone = libphonenumber.parsePhoneNumberFromString("+" + digits);
            }

            // ❌ Everything else → reject (prevents country mis-detection)
            else {
                return null;
            }

        } catch {
            return null;
        }

        if (!phone || !phone.isValid()) return null;

        const e164 = phone.number; // normalized format (+380...)
        const e164Digits = e164.replace(/\D/g, "");

        // 🔥 FINAL LENGTH CHECK
        if (e164Digits.length < 10 || e164Digits.length > 13) return null;

        // 🔥 FAKE NUMBER FILTER
        if (isObviouslyFakeNumber(e164Digits)) return null;

        return phone;
    }

    window.PhoneUtils = {
        validatePhone,
        isObviouslyFakeNumber
    };

})();
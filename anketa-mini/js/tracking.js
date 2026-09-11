/* Meta Pixel + Clarity + Strimix — ID беруться з config.js */
(function () {
    const cfg = window.ANKETA_CONFIG || {};

    if (cfg.fbPixelId) {
        !function (f, b, e, v, n, t, s) {
            if (f.fbq) return; n = f.fbq = function () {
                n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
            };
            if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
            n.queue = []; t = b.createElement(e); t.async = !0;
            t.src = v; s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s)
        }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', cfg.fbPixelId);
        fbq('track', 'PageView');
    }

    if (cfg.clarityId) {
        (function (c, l, a, r, i, t, y) {
            c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
            t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
            y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
        })(window, document, "clarity", "script", cfg.clarityId);
    }

    if (cfg.strimixId) {
        (function (w, d, t, s, i, f, j) {
            w[s] = w[s] || [];
            if (typeof strimixClient === "undefined" || strimixClient === null) {
                f = d.getElementsByTagName(t)[0];
                j = d.createElement(t);
                j.async = true;
                j.src = "https://cdn.strimix.io/strimix-1.0.0.js";
                f.parentNode.insertBefore(j, f);
                j.onload = function () { strimixClient.init(i); };
            }
        })(window, document, 'script', 'strimix', cfg.strimixId);
        strimix.push({ event: "page_view" });
    }
})();

/* ============================================================
   Анкета мінікурсу — всі зовнішні інтеграції в одному місці.
   Міняєш тут — міняється і на анкеті, і на сторінці подяки.
   ============================================================ */

window.ANKETA_CONFIG = {

    /* --- Google Sheets -------------------------------------
       URL веб-застосунку Apps Script (Deploy → Web app → URL
       виду https://script.google.com/macros/s/.../exec).
       Код самого скрипта: backend/google-apps-script.gs
       ------------------------------------------------------ */
    sheetsEndpoint: "https://script.google.com/macros/s/AKfycbyAquoVa2ldTNOVvXeXqeFlcEO69F7CM9LltSOk8ldm7nlwrl2th1kwUQFSWONV2Y7B/exec",

    /* Назва аркуша в таблиці, куди падають заявки.
       Має збігатися з hidden-полем SheetName у index.html */
    sheetName: "Мінікурс",

    /* --- CRM (Onlizer webhook) -----------------------------
       Поки що той самий вебхук, що в анкет ЛМ. Заявки лягають у
       ту саму воронку (stage 64, source 11) і відрізняються
       тільки заголовком «Заявки Мінікурс» та page_source
       (/anketa-mini/).

       Коли під мінікурс заведуть свою стадію/джерело або окремий
       сценарій в Onlizer — досить поміняти ці чотири значення.
       crmWebhook: null повністю вимикає відправку в CRM.
       ------------------------------------------------------ */
    crmWebhook: "https://gapi.onlizer.com/api/webhook/olikatkadi-hub.com-9e7d14a5d8124542b60548088bb0980d/b5351313a94b4de2b9a0297bd05bd8fc/webhook",
    crmTitle: "Заявки Мінікурс",
    crmStage: 64,
    crmSource: 11,

    /* --- Куди ведемо після відправки ----------------------- */
    thanksUrl: "/anketa-mini/thanks/",

    /* Посилання на Telegram-бот зі сторінки подяки */
    telegramBotUrl: "https://tg.pulse.is/vladushakovai_bot?start=6aa3ec3d7922779b07007d8f&username=value1&telegram_id=value2",

    /* --- Аналітика ----------------------------------------
       Постав null, щоб вимкнути окремий трекер.
       ------------------------------------------------------ */
    fbPixelId: "945388568373672",
    clarityId: "tiay55o0wz",
    strimixId: "S-XAQG4SHP98"
};

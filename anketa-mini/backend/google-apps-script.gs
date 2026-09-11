/**
 * Приймач заявок з анкети мінікурсу → Google Sheets.
 *
 * ВАЖЛИВО: створюй скрипт ОКРЕМИМ проєктом у своєму акаунті, а не
 * всередині таблиці. Таблиця LEADS AI LAB належить іншій людині
 * (nikichuk2008@gmail.com), і розгорток, зроблений зсередини неї,
 * не стає публічним — анкета отримує 403.
 *
 * Як підключити:
 *  1. Відкрий https://script.google.com → New project (у своєму акаунті).
 *  2. Встав цей код замість того, що там є. Збережи.
 *  3. SPREADSHEET_ID уже заповнений — це ID таблиці LEADS AI LAB.
 *  4. Натисни Run (функція doGet) один раз і дай дозволи:
 *     «Google hasn't verified this app» → Advanced → Go to project → Allow.
 *     Без цього кроку скрипт не має права писати в таблицю.
 *  5. Deploy → New deployment → шестерня → Web app:
 *       Execute as: Me
 *       Who has access: Anyone
 *     Deploy → скопіюй URL з блоку «Web app» (закінчується на /exec).
 *  6. Встав цей URL у config.js → sheetsEndpoint.
 *
 * Аркуш створюється сам за значенням поля SheetName з форми
 * (зараз — «Мінікурс»). Заголовки колонок пишуться при першій заявці,
 * нові поля форми автоматично додаються новою колонкою справа.
 * Аркуш «Мінікурс» у таблиці має бути порожнім: жодних формул у A1.
 */

var SPREADSHEET_ID = '11zXUF1hEjMqM_Z0sWAyzZq_VVy9tqrx7BXrL2wIY5sk'; // LEADS AI LAB
var DEFAULT_SHEET = 'Мінікурс'; // якщо форма не передала SheetName

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    var params = (e && e.parameter) ? e.parameter : {};

    var sheetName = params.SheetName || DEFAULT_SHEET;
    delete params.SheetName;

    var ss = SPREADSHEET_ID
      ? SpreadsheetApp.openById(SPREADSHEET_ID)
      : SpreadsheetApp.getActiveSpreadsheet();

    var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);

    var headers = sheet.getLastRow() > 0
      ? sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0]
      : [];

    // Перша колонка завжди дата заявки
    if (headers.length === 0 || !headers[0]) {
      headers = ['Дата'];
      sheet.getRange(1, 1).setValue('Дата');
      sheet.getRange(1, 1, 1, 1).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    // Додаємо колонки під нові поля форми
    Object.keys(params).forEach(function (key) {
      if (headers.indexOf(key) === -1) {
        headers.push(key);
        sheet.getRange(1, headers.length).setValue(key).setFontWeight('bold');
      }
    });

    var row = headers.map(function (header) {
      if (header === 'Дата') {
        return Utilities.formatDate(new Date(), 'Europe/Kyiv', 'dd.MM.yyyy');
      }
      return params[header] !== undefined ? params[header] : '';
    });

    // Пишемо рядок як текст, інакше Sheets з'їдає "+" у телефоні
    var targetRow = sheet.getLastRow() + 1;
    var range = sheet.getRange(targetRow, 1, 1, row.length);
    range.setNumberFormat('@');
    range.setValues([row]);

    return json({ status: 'ok', sheet: sheetName });

  } catch (err) {
    return json({ status: 'error', message: String(err) });

  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json({ status: 'ok', message: 'anketa-mini endpoint alive' });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * AI4DigiT — Newsletter subscription backend (single opt-in).
 *
 * Stores every subscriber in a Google Sheet that acts as your database TABLE.
 * Table "subscribers" columns:  Email | Data | Gjuha | Pëlqimi | Burimi
 *
 * ── HOW TO SET IT UP (≈5 min) ──────────────────────────────────────────
 * 1. Create a Google Sheet, e.g. named "AI4DigiT_Subscribers".
 * 2. In the Sheet: Extensions → Apps Script. Delete the default code and
 *    paste THIS file. (The script is bound to the sheet, so it writes to it.)
 * 3. Deploy → New deployment → type "Web app":
 *       - Description: AI4DigiT subscribe
 *       - Execute as: Me
 *       - Who has access: Anyone
 *    Click Deploy, authorise, and COPY the Web app URL (ends with /exec).
 * 4. In website/script.js set:  const SUBSCRIBE_ENDPOINT = "<that URL>";
 * 5. Done. Each "Abonohu" click adds a row to the "subscribers" tab.
 *
 * The emails live in YOUR Google Drive, in that Sheet → tab "subscribers".
 * Export any time to CSV/Excel; it is your GDPR record of subscriptions.
 */

var SHEET_NAME = 'subscribers';

/**
 * Verification endpoint. Open the /exec URL in a browser (GET) to see
 * which spreadsheet the data lands in and how many subscribers are stored.
 */
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss ? ss.getSheetByName(SHEET_NAME) : null;
  var count = sheet ? Math.max(sheet.getLastRow() - 1, 0) : 0;
  return json({
    ok: true,
    spreadsheet: ss ? ss.getName() : null,
    spreadsheetUrl: ss ? ss.getUrl() : null,
    sheet: SHEET_NAME,
    exists: !!sheet,
    count: count
  });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(15000);
  try {
    // Parse the JSON body sent by the website form.
    var data = {};
    try { data = JSON.parse(e.postData.contents); }
    catch (err) { data = (e && e.parameter) ? e.parameter : {}; }

    var email = String(data.email || '').trim().toLowerCase();
    if (!isValidEmail(email)) {
      return json({ ok: false, error: 'invalid email' });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(['Email', 'Data', 'Gjuha', 'Pëlqimi', 'Burimi']);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Email', 'Data', 'Gjuha', 'Pëlqimi', 'Burimi']);
    }

    // De-duplicate: skip if the email is already subscribed.
    // Guard: only read existing rows when there is at least one data row,
    // otherwise getRange(..., 0, ...) throws "number of rows must be at least 1".
    var last = sheet.getLastRow();
    var existing = [];
    if (last >= 2) {
      existing = sheet.getRange(2, 1, last - 1, 1)
                      .getValues().map(function (r) { return String(r[0]).toLowerCase(); });
    }
    if (existing.indexOf(email) === -1) {
      sheet.appendRow([
        email,
        data.ts || new Date(),
        data.language || '',
        data.consent || 'single opt-in',
        data.source || 'website'
      ]);
    }
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

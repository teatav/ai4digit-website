/**
 * AI4DigiT — Newsletter subscription backend (single opt-in).
 *
 * Stores every subscriber in a Google Sheet that acts as your database TABLE.
 * Table "subscribers" columns:  Email | Data | Gjuha | Pëlqimi | Burimi | Emri | Mbiemri | Lloji | Sektori
 *
 * UPDATE (Nov 2026): the website popup now also sends first name, last name,
 * organisation type (SME / PSO) and sector. After pasting this version:
 * Deploy → Manage deployments → (pencil) Edit → Version: New version → Deploy.
 * The /exec URL stays the same, so the website needs no change. Existing rows
 * are kept; the four new columns are added to the header automatically.
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
var HEADER = ['Email', 'Data', 'Gjuha', 'Pëlqimi', 'Burimi', 'Emri', 'Mbiemri', 'Lloji', 'Sektori'];

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
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    // Header: create it, or extend an older 5-column header with the new columns.
    var width = Math.max(sheet.getLastColumn(), 1);
    var head = sheet.getLastRow() >= 1 ? sheet.getRange(1, 1, 1, width).getValues()[0] : [];
    if (head.length < HEADER.length || head[0] !== 'Email') {
      sheet.getRange(1, 1, 1, HEADER.length).setValues([HEADER]);
    }

    var clean = function (v, n) { return String(v || '').trim().slice(0, n); };
    var row = [
      email,
      data.ts || new Date(),
      clean(data.language, 5),
      clean(data.consent, 40) || 'single opt-in',
      clean(data.source, 40) || 'website',
      clean(data.first_name, 80),
      clean(data.last_name, 80),
      ['SME', 'PSO'].indexOf(data.org_type) >= 0 ? data.org_type : '',
      clean(data.sector, 120)
    ];

    // One row per e-mail: a new subscription from a known address updates its row.
    var last = sheet.getLastRow();
    var emails = last >= 2 ? sheet.getRange(2, 1, last - 1, 1).getValues()
                               .map(function (r) { return String(r[0]).toLowerCase(); }) : [];
    var at = emails.indexOf(email);
    if (at === -1) {
      sheet.appendRow(row);
    } else {
      sheet.getRange(at + 2, 1, 1, HEADER.length).setValues([row]);
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

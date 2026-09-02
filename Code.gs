const CONFIG = {
  SHEET_ID: '1ReDt0jxBLUe_sBBdC4YVUQt-dhDAxJveEYFgf4z-00Y',
  SHEET_NAME: 'Orders',
  SCHOOLS_SHEET_NAME: 'Schools',

  // Захиалга ирэхэд мэдэгдэл авах Gmail
  ADMIN_EMAIL: 'enkh2834@gmail.com',

  // ШИНЭ admin key — өмнөх key ил болсон тул сольсон.
  // Энэ key-г GitHub дээр бүү байршуул.
  ADMIN_KEY: 'MYD-Admin-2026-c8JQSZ8DJNU9CS12qCjt',

  // Editor login. Gmail-ийн ЖИНХЭНЭ password-оо энд ХЭЗЭЭ Ч бүү ашигла.
  // Энэ нь зөвхөн MY ДЭВТЭР editor-ийн тусдаа password байна.
  EDITOR_EMAIL: 'enkh2834@gmail.com',
  EDITOR_PASSWORD: 'CHANGE-THIS-EDITOR-PASSWORD',

  // Захиалагчид очих төлбөрийн мэдээлэл
  BANK_NAME: 'Хасбанк (XacBank)',
  BANK_ACCOUNT: 'MN530032005002379658',
  BANK_HOLDER: 'Ж.Энхсайхан',
  CONTACT_PHONE_1: '80080371',
  CONTACT_PHONE_2: '80620171',

  SITE_URL: 'https://mydewter.mn'
};

const ORDER_HEADERS = [
  'Order ID',
  'Created At',
  'Name',
  'Phone',
  'Email',
  'Province',
  'District/Soum',
  'School',
  '1-р анги',
  '2-р анги',
  '3-р анги',
  '4-р анги',
  '5-р анги',
  'Total Qty',
  'Total Amount',
  'Status',
  'Customer Note',
  'Admin Note',
  'Latitude',
  'Longitude',
  'Location Source',
  'Last Updated'
];


/* =========================================================
   WEB APP ENTRY POINTS
========================================================= */

function doPost(e) {
  try {
    const data = JSON.parse((e.postData && e.postData.contents) || '{}');

    if (data.action === 'editorLogin') {
      return json_(editorLogin_(data));
    }

    if (data.action === 'saveSiteData') {
      return json_(saveSiteData_(data));
    }

    if (data.action === 'editorLogout') {
      return json_(editorLogout_(data));
    }

    if (data.action === 'createOrder') {
      return json_(createOrder_(data));
    }

    if (data.action === 'updateOrder') {
      if (data.adminKey !== CONFIG.ADMIN_KEY) {
        return json_({ ok: false, error: 'Unauthorized' });
      }
      return json_(updateOrder_(data));
    }

    return json_({ ok: false, error: 'Unknown action' });

  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}


function doGet(e) {
  try {
    const p = e.parameter || {};

    if (p.action === 'getSiteData') {
      return json_({ ok: true, data: getPublishedSiteData_() });
    }

    if (p.action === 'listOrders') {
      if (p.adminKey !== CONFIG.ADMIN_KEY) {
        return json_({ ok: false, error: 'Unauthorized' });
      }

      return json_({
        ok: true,
        orders: listOrders_()
      });
    }

    if (p.action === 'listSchools') {
      return json_({
        ok: true,
        schools: listSchools_(p.province || '', p.district || '')
      });
    }

    return json_({
      ok: true,
      service: 'MY Dewter Orders v10'
    });

  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}


/* =========================================================
   ORDERS SHEET
========================================================= */

function sheet_() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);

  let sh = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(CONFIG.SHEET_NAME);
  }

  ensureOrdersLatest_(ss, sh);
  return sh;
}


function ensureOrdersLatest_(ss, sh) {
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, ORDER_HEADERS.length).setValues([ORDER_HEADERS]);
    formatOrdersSheet_(sh);
    return;
  }

  const lastCol = Math.max(sh.getLastColumn(), 1);
  const currentHeaders = sh
    .getRange(1, 1, 1, lastCol)
    .getDisplayValues()[0]
    .map(String);

  if (currentHeaders.join('|') === ORDER_HEADERS.join('|')) {
    formatOrdersSheet_(sh);
    return;
  }

  // Ямар ч хуучин хувилбарыг backup хийгээд шинэ бүтэц рүү аюулгүй шилжүүлнэ.
  const stamp = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyyMMdd_HHmmss'
  );

  let backupName = 'Orders_backup_' + stamp;
  let n = 2;
  while (ss.getSheetByName(backupName)) {
    backupName = 'Orders_backup_' + stamp + '_' + n++;
  }
  sh.copyTo(ss).setName(backupName);

  const values = sh.getDataRange().getValues();
  const oldHeaders = values[0].map(String);

  const colIndex = (...names) => {
    for (const name of names) {
      const i = oldHeaders.indexOf(name);
      if (i >= 0) return i;
    }
    return -1;
  };

  const getVal = (row, ...names) => {
    const i = colIndex(...names);
    return i >= 0 ? row[i] : '';
  };

  const migrated = [ORDER_HEADERS];

  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    if (row.every(v => v === '')) continue;

    let items = [];
    const itemIdx = colIndex('Items JSON');

    if (itemIdx >= 0) {
      try {
        items = JSON.parse(row[itemIdx] || '[]');
        if (!Array.isArray(items)) items = [];
      } catch (e) {
        items = [];
      }
    }

    const gradeQty = n => {
      const direct = Number(
        getVal(row, n + '-р анги', 'Grade ' + n)
      ) || 0;

      if (direct > 0) return direct;

      const x = items.find(v => Number(v.grade) === n);
      return x ? Number(x.qty) || 0 : 0;
    };

    const grades = [1, 2, 3, 4, 5].map(gradeQty);

    const totalQty =
      Number(getVal(row, 'Total Qty')) ||
      grades.reduce((sum, qty) => sum + qty, 0);

    const totalAmount =
      Number(getVal(row, 'Total Amount')) ||
      items.reduce(
        (sum, x) =>
          sum +
          (Number(x.qty) || 0) *
          (Number(x.price) || 0),
        0
      );

    const province = getVal(row, 'Province');
    const district = getVal(row, 'District/Soum', 'District');
    const school = getVal(row, 'School');

    let lat = Number(getVal(row, 'Latitude')) || null;
    let lng = Number(getVal(row, 'Longitude')) || null;
    let source = getVal(row, 'Location Source');

    // Хуучин мөрөнд координат байхгүй бол нэг удаа сургууль хайж үзнэ.
    if (school && (!lat || !lng)) {
      const g = geocodeSchool_(school, district, province);

      if (g.lat && g.lng) {
        lat = g.lat;
        lng = g.lng;
        source = g.source;
      }
    }

    migrated.push([
      getVal(row, 'Order ID'),
      getVal(row, 'Created At', 'Date'),
      getVal(row, 'Name'),
      getVal(row, 'Phone'),
      getVal(row, 'Email'),
      province,
      district,
      school,
      grades[0],
      grades[1],
      grades[2],
      grades[3],
      grades[4],
      totalQty,
      totalAmount,
      getVal(row, 'Status') || 'Шинэ',
      getVal(row, 'Customer Note'),
      getVal(row, 'Admin Note'),
      lat || '',
      lng || '',
      source || '',
      getVal(row, 'Last Updated') || new Date()
    ]);
  }

  sh.clear();

  sh.getRange(
    1,
    1,
    migrated.length,
    ORDER_HEADERS.length
  ).setValues(migrated);

  formatOrdersSheet_(sh);
}


function formatOrdersSheet_(sh) {
  sh.setFrozenRows(1);

  sh
    .getRange(1, 1, 1, ORDER_HEADERS.length)
    .setFontWeight('bold')
    .setFontColor('#ffffff')
    .setBackground('#234f9b')
    .setVerticalAlignment('middle')
    .setWrap(true);

  sh.setRowHeight(1, 36);

  const widths = [
    150, 150, 135, 110, 190, 125, 145, 180,
    75, 75, 75, 75, 75, 90, 120, 115,
    190, 190, 105, 105, 125, 150
  ];

  widths.forEach((w, i) => sh.setColumnWidth(i + 1, w));

  const dataRows = Math.max(sh.getMaxRows() - 1, 1);

  // Ангиуд + нийт тоо + нийт дүн
  sh
    .getRange(2, 9, dataRows, 7)
    .setHorizontalAlignment('center');

  sh
    .getRange(2, 15, dataRows, 1)
    .setNumberFormat('#,##0"₮"');

  sh
    .getRange(2, 2, dataRows, 1)
    .setNumberFormat('yyyy-mm-dd hh:mm');

  sh
    .getRange(
      1,
      1,
      Math.max(sh.getLastRow(), 1),
      ORDER_HEADERS.length
    )
    .setWrap(true);

  // Зөөлөн alternating row color
  if (sh.getLastRow() > 1) {
    for (let r = 2; r <= sh.getLastRow(); r++) {
      sh
        .getRange(r, 1, 1, ORDER_HEADERS.length)
        .setBackground(r % 2 === 0 ? '#f7f9fc' : '#ffffff');
    }
  }
}


/* =========================================================
   SCHOOLS SHEET
========================================================= */

function schoolsSheet_() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);

  let sh = ss.getSheetByName(CONFIG.SCHOOLS_SHEET_NAME);

  if (!sh) {
    sh = ss.insertSheet(CONFIG.SCHOOLS_SHEET_NAME);
  }

  if (sh.getLastRow() === 0) {
    sh.appendRow([
      'Province',
      'District/Soum',
      'School',
      'Latitude',
      'Longitude',
      'Active',
      'Source'
    ]);

    sh.setFrozenRows(1);

    sh
      .getRange(1, 1, 1, 7)
      .setFontWeight('bold')
      .setBackground('#eaf4ff');
  }

  return sh;
}


function listSchools_(province, district) {
  const sh = schoolsSheet_();
  const values = sh.getDataRange().getValues();

  if (values.length < 2) return [];

  return values
    .slice(1)
    .filter(r =>
      String(r[0]) === String(province) &&
      String(r[1]) === String(district) &&
      String(r[5]).toLowerCase() !== 'false'
    )
    .map(r => ({
      school: r[2],
      lat: Number(r[3]) || null,
      lng: Number(r[4]) || null,
      source: r[6] || 'Schools sheet'
    }));
}


function upsertSchool_(
  province,
  district,
  school,
  lat,
  lng,
  source
) {
  if (!school) return;

  const sh = schoolsSheet_();
  const values = sh.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    const same =
      String(values[i][0]) === String(province) &&
      String(values[i][1]) === String(district) &&
      String(values[i][2]).trim().toLowerCase() ===
        String(school).trim().toLowerCase();

    if (same) {
      if (lat && lng) {
        sh
          .getRange(i + 1, 4, 1, 2)
          .setValues([[lat, lng]]);
      }

      sh.getRange(i + 1, 6).setValue(true);

      if (source) {
        sh.getRange(i + 1, 7).setValue(source);
      }

      return;
    }
  }

  sh.appendRow([
    province,
    district,
    school,
    lat || '',
    lng || '',
    true,
    source || 'Order'
  ]);
}


/* =========================================================
   CREATE ORDER
========================================================= */

function createOrder_(d) {
  if (
    !d.name ||
    !d.phone ||
    !d.email ||
    !d.province ||
    !d.district ||
    !d.school
  ) {
    return {
      ok: false,
      error: 'Required fields are missing'
    };
  }

  const items = Array.isArray(d.items) ? d.items : [];

  if (!items.some(x => Number(x.qty) > 0)) {
    return {
      ok: false,
      error: 'No items'
    };
  }

  const invalidMin = items.find(x => Number(x.qty) > 0 && Number(x.qty) < 10);
  if (invalidMin) {
    return {
      ok: false,
      error: invalidMin.grade + '-р ангийн хамгийн бага захиалга 10 ширхэг байна.'
    };
  }

  const sh = sheet_();

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const now = new Date();

    // Мөрийн тооноос хамаарахгүй, давтагдах магадлал маш бага ID.
    const orderId =
      'MYD-' +
      Utilities.formatDate(
        now,
        Session.getScriptTimeZone(),
        'yyyyMMdd-HHmmss'
      ) +
      '-' +
      Utilities
        .getUuid()
        .replace(/-/g, '')
        .slice(0, 4)
        .toUpperCase();

    const q = n => {
      const x = items.find(v => Number(v.grade) === n);
      return x ? Number(x.qty) || 0 : 0;
    };

    const totalQty = [1, 2, 3, 4, 5]
      .reduce((sum, n) => sum + q(n), 0);

    const totalAmount = items.reduce(
      (sum, x) =>
        sum +
        (Number(x.qty) || 0) *
        (Number(x.price) || 0),
      0
    );

    let lat = Number(d.schoolLat) || null;
    let lng = Number(d.schoolLng) || null;
    let source = d.locationSource || '';

    if (!lat || !lng) {
      const g = geocodeSchool_(
        d.school,
        d.district,
        d.province
      );

      lat =
        g.lat ||
        Number(d.districtLat) ||
        null;

      lng =
        g.lng ||
        Number(d.districtLng) ||
        null;

      source =
        g.source ||
        (lat && lng ? 'District center' : '');
    }

    upsertSchool_(
      d.province,
      d.district,
      d.school,
      lat,
      lng,
      source
    );

    sh.appendRow([
      orderId,
      now,
      d.name,
      d.phone,
      d.email,
      d.province,
      d.district,
      d.school,
      q(1),
      q(2),
      q(3),
      q(4),
      q(5),
      totalQty,
      totalAmount,
      'Шинэ',
      d.note || '',
      '',
      lat || '',
      lng || '',
      source || '',
      now
    ]);

    formatOrdersSheet_(sh);

    // ADMIN EMAIL
    MailApp.sendEmail({
      to: CONFIG.ADMIN_EMAIL,

      subject:
        'Шинэ захиалга — ' +
        orderId +
        ' — ' +
        d.school,

      htmlBody: `
        <h2>🎵 MY ДЭВТЭР — Шинэ захиалга</h2>

        <p>
          <b>Захиалгын дугаар:</b> ${orderId}
        </p>

        <p>
          <b>Нэр:</b> ${d.name}<br>
          <b>Утас:</b> ${d.phone}<br>
          <b>Имэйл:</b> ${d.email}
        </p>

        <p>
          <b>Аймаг / хот:</b> ${d.province}<br>
          <b>Дүүрэг / сум:</b> ${d.district}<br>
          <b>Сургууль:</b> ${d.school}
        </p>

        <p>
          1-р анги: ${q(1)}<br>
          2-р анги: ${q(2)}<br>
          3-р анги: ${q(3)}<br>
          4-р анги: ${q(4)}<br>
          5-р анги: ${q(5)}
        </p>

        <p>
          <b>Нийт: ${totalQty} дэвтэр</b><br>
          <b>Нийт төлбөр:
          ${totalAmount.toLocaleString('mn-MN')}₮</b>
        </p>

        ${
          d.note
            ? `<p><b>Тайлбар:</b> ${d.note}</p>`
            : ''
        }
      `
    });

    // CUSTOMER EMAIL
    MailApp.sendEmail({
      to: d.email,

      subject:
        'Таны захиалга бүртгэгдлээ — ' +
        orderId,

      htmlBody: `
        <div style="font-family:Arial,sans-serif;line-height:1.65;color:#17213a;max-width:620px">
          <h2 style="margin-bottom:18px">✅ Захиалга амжилттай бүртгэгдлээ</h2>

          <p>
            Сайн байна уу, <b>${d.name}</b>.
          </p>

          <p>
            Захиалгын дугаар:
            <b>${orderId}</b>
          </p>

          <p>
            <b>Сургууль:</b> ${d.school}<br>
            <b>Аймаг / хот:</b> ${d.province}<br>
            <b>Дүүрэг / сум:</b> ${d.district}
          </p>

          <div style="margin:20px 0;padding:16px 18px;background:#f6f9ff;border:1px solid #dfe9f8;border-radius:14px">
            <b>Захиалсан дэвтэр:</b><br>
            1-р анги: <b>${q(1)}</b><br>
            2-р анги: <b>${q(2)}</b><br>
            3-р анги: <b>${q(3)}</b><br>
            4-р анги: <b>${q(4)}</b><br>
            5-р анги: <b>${q(5)}</b><br><br>

            <b>Нийт: ${totalQty} дэвтэр</b><br>
            <b>Нийт төлбөр: ${totalAmount.toLocaleString('mn-MN')}₮</b>
          </div>

          <div style="margin:20px 0;padding:16px 18px;background:#fff8e9;border:1px solid #efdfbd;border-radius:14px">
            <b>💳 Төлбөр хүлээн авах данс</b><br>
            ${CONFIG.BANK_NAME}<br>
            Данс: <b>${CONFIG.BANK_ACCOUNT}</b><br>
            Данс эзэмшигч: <b>${CONFIG.BANK_HOLDER}</b>
          </div>

          <p>
            <b>☎ Холбоо барих:</b><br>
            ${CONFIG.CONTACT_PHONE_1}<br>
            ${CONFIG.CONTACT_PHONE_2}
          </p>

          <p>
            Төлбөр болон хүргэлтийн мэдээллийг баталгаажуулах шаардлагатай тохиолдолд
            бид тантай холбогдоно.
          </p>

          <p>
            <a href="${CONFIG.SITE_URL}">${CONFIG.SITE_URL}</a>
          </p>

          <p style="margin-top:24px">
            Баярлалаа.<br>
            <b>MY ДЭВТЭР</b>
          </p>
        </div>
      `
    });

    return {
      ok: true,
      orderId: orderId,
      totalQty: totalQty,
      totalAmount: totalAmount
    };

  } finally {
    lock.releaseLock();
  }
}


/* =========================================================
   SCHOOL GEOCODING
========================================================= */

function geocodeSchool_(
  school,
  district,
  province
) {
  try {
    const geocoder = Maps
      .newGeocoder()
      .setLanguage('mn')
      .setRegion('mn');

    const queries = [
      `${school}, ${district}, ${province}, Монгол`,
      `${school}, ${province}, Монгол`
    ];

    for (const q of queries) {
      const res = geocoder.geocode(q);

      if (
        res &&
        res.status === 'OK' &&
        res.results &&
        res.results.length
      ) {
        const loc =
          res.results[0]
            .geometry
            .location;

        return {
          lat: Number(loc.lat),
          lng: Number(loc.lng),
          source: 'Google geocoder'
        };
      }
    }

  } catch (e) {
    console.log(
      'Geocode failed: ' + e
    );
  }

  return {
    lat: null,
    lng: null,
    source: ''
  };
}


/* =========================================================
   ADMIN — LIST ORDERS
========================================================= */

function listOrders_() {
  const sh = sheet_();
  const values = sh.getDataRange().getValues();

  if (values.length < 2) return [];

  return values
    .slice(1)
    .reverse()
    .filter(r => r.some(v => v !== ''))
    .map(r => ({
      orderId: r[0],
      createdAt: dateIso_(r[1]),

      name: r[2],
      phone: r[3],
      email: r[4],

      province: r[5],
      district: r[6],
      school: r[7],

      grade1: Number(r[8]) || 0,
      grade2: Number(r[9]) || 0,
      grade3: Number(r[10]) || 0,
      grade4: Number(r[11]) || 0,
      grade5: Number(r[12]) || 0,

      totalQty: Number(r[13]) || 0,
      totalAmount: Number(r[14]) || 0,

      status: r[15] || 'Шинэ',

      note: r[16] || '',
      adminNote: r[17] || '',

      lat: Number(r[18]) || null,
      lng: Number(r[19]) || null,

      locationSource: r[20] || '',
      updatedAt: dateIso_(r[21]),

      items: [
        { grade: 1, qty: Number(r[8]) || 0 },
        { grade: 2, qty: Number(r[9]) || 0 },
        { grade: 3, qty: Number(r[10]) || 0 },
        { grade: 4, qty: Number(r[11]) || 0 },
        { grade: 5, qty: Number(r[12]) || 0 }
      ].filter(x => x.qty > 0)
    }));
}


/* =========================================================
   ADMIN — UPDATE ORDER
========================================================= */

function updateOrder_(d) {
  const sh = sheet_();
  const values = sh.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (
      String(values[i][0]) ===
      String(d.orderId)
    ) {
      if (d.status !== undefined) {
        sh
          .getRange(i + 1, 16)
          .setValue(d.status);
      }

      if (d.adminNote !== undefined) {
        sh
          .getRange(i + 1, 18)
          .setValue(d.adminNote);
      }

      sh
        .getRange(i + 1, 22)
        .setValue(new Date());

      return {
        ok: true
      };
    }
  }

  return {
    ok: false,
    error: 'Order not found'
  };
}


/* =========================================================
   OPTIONAL MAINTENANCE FUNCTIONS
========================================================= */

// Хуучин Orders sheet-ийг шинэ бүтэц рүү нэг удаа шилжүүлнэ.
// Backup sheet автоматаар үүснэ.
function upgradeOrdersSheetNow() {
  const sh = sheet_();

  return (
    'Orders sheet upgraded. Rows: ' +
    sh.getLastRow()
  );
}


// Координатгүй мөрүүдийг дахин хайх.
// Нэг удаад хамгийн ихдээ 40 мөр.
function refreshMissingCoordinates() {
  const sh = sheet_();
  const values = sh.getDataRange().getValues();

  let done = 0;

  for (
    let i = 1;
    i < values.length && done < 40;
    i++
  ) {
    const school = values[i][7];
    const lat = values[i][18];
    const lng = values[i][19];

    if (
      school &&
      (!lat || !lng)
    ) {
      const g = geocodeSchool_(
        school,
        values[i][6],
        values[i][5]
      );

      if (g.lat && g.lng) {
        sh
          .getRange(i + 1, 19, 1, 3)
          .setValues([
            [
              g.lat,
              g.lng,
              g.source
            ]
          ]);

        upsertSchool_(
          values[i][5],
          values[i][6],
          values[i][7],
          g.lat,
          g.lng,
          g.source
        );

        done++;
      }
    }
  }

  return done;
}


// Apps Script setup хурдан шалгах.
function testSetup() {
  const sh = sheet_();

  return {
    ok: true,
    sheetName: sh.getName(),
    rows: sh.getLastRow(),
    headers: sh
      .getRange(1, 1, 1, ORDER_HEADERS.length)
      .getDisplayValues()[0]
  };
}



/* =========================================================
   PRIVATE EDITOR AUTH + PUBLISHED SITE DATA
========================================================= */

function editorLogin_(d) {
  const email = String(d.email || '').trim().toLowerCase();
  const password = String(d.password || '');
  const allowed = String(CONFIG.EDITOR_EMAIL || '').trim().toLowerCase();

  if (!allowed || CONFIG.EDITOR_PASSWORD === 'CHANGE-THIS-EDITOR-PASSWORD') {
    return { ok:false, error:'Apps Script CONFIG дээр EDITOR_EMAIL / EDITOR_PASSWORD тохируулна уу.' };
  }

  if (email !== allowed || password !== String(CONFIG.EDITOR_PASSWORD)) {
    Utilities.sleep(450);
    return { ok:false, error:'Имэйл эсвэл editor password буруу байна.' };
  }

  const token = Utilities.getUuid().replace(/-/g,'');
  CacheService.getScriptCache().put('editor_session_' + token, email, 21600); // 6 hours

  return {
    ok:true,
    token:token,
    email:email,
    data:getPublishedSiteData_()
  };
}

function editorSessionValid_(token) {
  if (!token) return false;
  return !!CacheService.getScriptCache().get('editor_session_' + String(token));
}

function editorLogout_(d) {
  if (d.token) CacheService.getScriptCache().remove('editor_session_' + String(d.token));
  return {ok:true};
}

function siteDataFile_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('MYDEWTER_SITE_DATA_FILE_ID');
  if (id) {
    try { return DriveApp.getFileById(id); } catch(e) {}
  }
  const file = DriveApp.createFile('mydewter-site-data.json', '{}', MimeType.PLAIN_TEXT);
  props.setProperty('MYDEWTER_SITE_DATA_FILE_ID', file.getId());
  return file;
}

function getPublishedSiteData_() {
  try {
    const file = siteDataFile_();
    const text = file.getBlob().getDataAsString('UTF-8');
    const data = JSON.parse(text || '{}');
    return data && Object.keys(data).length ? data : null;
  } catch(e) {
    console.log('getPublishedSiteData_: ' + e);
    return null;
  }
}

function saveSiteData_(d) {
  if (!editorSessionValid_(d.token)) {
    return {ok:false,error:'Editor session дууссан. Дахин нэвтэрнэ үү.'};
  }

  const data = d.siteData;
  if (!data || typeof data !== 'object') return {ok:false,error:'Site data хоосон байна.'};
  if (!Array.isArray(data.grades) || data.grades.length < 5) return {ok:false,error:'1–5-р ангийн мэдээлэл дутуу байна.'};

  // API URL-г editor санамсаргүй хоосолсон ч website эвдрэхгүй.
  if (!data.orderApiUrl && d.orderApiUrl) data.orderApiUrl = d.orderApiUrl;

  const json = JSON.stringify(data);
  // Oversized accidental uploads-аас хамгаална (ойролцоогоор 12 MB text).
  if (json.length > 12000000) {
    return {ok:false,error:'Зургууд хэт том байна. Editor зураг сонгох үед автоматаар шахагдах ёстой.'};
  }

  siteDataFile_().setContent(json);
  PropertiesService.getScriptProperties().setProperty('MYDEWTER_SITE_DATA_UPDATED_AT', new Date().toISOString());

  return {ok:true,updatedAt:new Date().toISOString()};
}

/* =========================================================
   HELPERS
========================================================= */

function dateIso_(v) {
  if (!v) return '';

  try {
    return new Date(v).toISOString();
  } catch (e) {
    return String(v);
  }
}


function json_(obj) {
  return ContentService
    .createTextOutput(
      JSON.stringify(obj)
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );
}

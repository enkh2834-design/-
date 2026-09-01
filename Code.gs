const CONFIG = {
  SHEET_ID: '1ReDt0jxBLUe_sBBdC4YVUQt-dhDAxJveEYFgf4z-00Y',
  SHEET_NAME: 'Orders',
  SCHOOLS_SHEET_NAME: 'Schools',

  // ЭНЭ 2 УТГЫГ ОДООГИЙН CODE.GS-Д БАЙГАА ӨӨРИЙН УТГААР СОЛИНО.
  ADMIN_EMAIL: 'KEEP_YOUR_CURRENT_ADMIN_EMAIL_HERE',
  ADMIN_KEY: 'KEEP_YOUR_CURRENT_ADMIN_KEY_HERE',

  SITE_URL: 'https://mydewter.mn'
};

const ORDER_HEADERS = [
  'Order ID','Created At','Name','Phone','Email','Province','District/Soum','School',
  '1-р анги','2-р анги','3-р анги','4-р анги','5-р анги','Total Qty','Total Amount','Status',
  'Customer Note','Admin Note','Latitude','Longitude','Location Source','Last Updated'
];

function doPost(e) {
  try {
    const data = JSON.parse((e.postData && e.postData.contents) || '{}');
    if (data.action === 'createOrder') return json_(createOrder_(data));
    if (data.action === 'updateOrder') {
      if (data.adminKey !== CONFIG.ADMIN_KEY) return json_({ok:false,error:'Unauthorized'});
      return json_(updateOrder_(data));
    }
    return json_({ok:false,error:'Unknown action'});
  } catch (err) {
    return json_({ok:false,error:String(err)});
  }
}

function doGet(e) {
  try {
    const p = e.parameter || {};
    if (p.action === 'listOrders') {
      if (p.adminKey !== CONFIG.ADMIN_KEY) return json_({ok:false,error:'Unauthorized'});
      return json_({ok:true,orders:listOrders_()});
    }
    if (p.action === 'listSchools') {
      return json_({ok:true,schools:listSchools_(p.province||'',p.district||'')});
    }
    return json_({ok:true,service:'MY Dewter Orders v3'});
  } catch (err) {
    return json_({ok:false,error:String(err)});
  }
}

function sheet_() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sh = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sh) sh = ss.insertSheet(CONFIG.SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.getRange(1,1,1,ORDER_HEADERS.length).setValues([ORDER_HEADERS]);
    sh.setFrozenRows(1);
    formatOrdersSheet_(sh);
  } else {
    ensureOrdersV3_(ss,sh);
  }
  return sh;
}

function ensureOrdersV3_(ss,sh) {
  const lastCol=Math.max(sh.getLastColumn(),1);
  const headers=sh.getRange(1,1,1,lastCol).getDisplayValues()[0];
  if (headers.join('|') === ORDER_HEADERS.join('|')) return;
  // If it is already a v3-ish sheet, only normalize headers.
  if (headers.includes('1-р анги') && headers.includes('Latitude')) {
    sh.getRange(1,1,1,ORDER_HEADERS.length).setValues([ORDER_HEADERS]);
    formatOrdersSheet_(sh); return;
  }

  // One-time safe migration: first make a backup copy.
  const stamp=Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyyyMMdd_HHmmss');
  let backupName='Orders_backup_'+stamp;
  if(!ss.getSheetByName(backupName)) sh.copyTo(ss).setName(backupName);

  const values=sh.getDataRange().getValues();
  const oldH=values[0].map(String);
  const ix=name=>oldH.indexOf(name);
  const migrated=[ORDER_HEADERS];
  for(let r=1;r<values.length;r++){
    const row=values[r]; if(row.every(v=>v==='')) continue;
    let items=[];
    const itemIdx=ix('Items JSON');
    if(itemIdx>=0){try{items=JSON.parse(row[itemIdx]||'[]')}catch(e){items=[]}}
    const qty=n=>{const x=items.find(v=>Number(v.grade)===n);return x?Number(x.qty)||0:0};
    const province=val_(row,oldH,'Province'),district=val_(row,oldH,'District')||val_(row,oldH,'District/Soum'),school=val_(row,oldH,'School');
    let lat='',lng='',source='';
    // Existing old rows: try to geocode school once during migration.
    if(school){const g=geocodeSchool_(school,district,province);lat=g.lat||'';lng=g.lng||'';source=g.source||''}
    const total=items.length?items.reduce((s,x)=>s+(Number(x.qty)||0),0):(Number(val_(row,oldH,'Total Qty'))||0);
    const totalAmount=items.length
      ? items.reduce((sum,x)=>sum+(Number(x.qty)||0)*(Number(x.price)||0),0)
      : (Number(val_(row,oldH,'Total Amount'))||0);
    migrated.push([
      val_(row,oldH,'Order ID'),val_(row,oldH,'Created At'),val_(row,oldH,'Name'),val_(row,oldH,'Phone'),val_(row,oldH,'Email'),
      province,district,school,qty(1),qty(2),qty(3),qty(4),qty(5),total,totalAmount,val_(row,oldH,'Status')||'Шинэ',
      val_(row,oldH,'Customer Note'),val_(row,oldH,'Admin Note'),lat,lng,source,val_(row,oldH,'Last Updated')||new Date()
    ]);
  }
  sh.clear();
  sh.getRange(1,1,migrated.length,ORDER_HEADERS.length).setValues(migrated);
  sh.setFrozenRows(1);formatOrdersSheet_(sh);
}

function val_(row,headers,name){const i=headers.indexOf(name);return i>=0?row[i]:''}

function formatOrdersSheet_(sh){
  sh.getRange(1,1,1,ORDER_HEADERS.length).setFontWeight('bold').setBackground('#eee8ff');
  sh.autoResizeColumns(1,ORDER_HEADERS.length);
  [9,10,11,12,13,14,15].forEach(c=>sh.getRange(2,c,Math.max(sh.getMaxRows()-1,1),1).setHorizontalAlignment('center'));
}

function schoolsSheet_(){
  const ss=SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sh=ss.getSheetByName(CONFIG.SCHOOLS_SHEET_NAME);
  if(!sh) sh=ss.insertSheet(CONFIG.SCHOOLS_SHEET_NAME);
  if(sh.getLastRow()===0){
    sh.appendRow(['Province','District/Soum','School','Latitude','Longitude','Active','Source']);
    sh.setFrozenRows(1);sh.getRange(1,1,1,7).setFontWeight('bold').setBackground('#eaf4ff');
  }
  return sh;
}

function listSchools_(province,district){
  const sh=schoolsSheet_(),v=sh.getDataRange().getValues();if(v.length<2)return[];
  return v.slice(1).filter(r=>String(r[0])===String(province)&&String(r[1])===String(district)&&String(r[5]).toLowerCase()!=='false')
    .map(r=>({school:r[2],lat:Number(r[3])||null,lng:Number(r[4])||null,source:r[6]||'Schools sheet'}));
}

function upsertSchool_(province,district,school,lat,lng,source){
  if(!school)return;const sh=schoolsSheet_(),v=sh.getDataRange().getValues();
  for(let i=1;i<v.length;i++){
    if(String(v[i][0])===String(province)&&String(v[i][1])===String(district)&&String(v[i][2]).trim().toLowerCase()===String(school).trim().toLowerCase()){
      if(lat&&lng){sh.getRange(i+1,4,1,2).setValues([[lat,lng]])}sh.getRange(i+1,6).setValue(true);if(source)sh.getRange(i+1,7).setValue(source);return;
    }
  }
  sh.appendRow([province,district,school,lat||'',lng||'',true,source||'Order']);
}

function createOrder_(d) {
  if (!d.name || !d.phone || !d.email || !d.province || !d.district || !d.school) return {ok:false,error:'Required fields are missing'};
  const items = Array.isArray(d.items) ? d.items : [];
  if (!items.some(x => Number(x.qty) > 0)) return {ok:false,error:'No items'};
  const sh = sheet_();
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const now = new Date();
    const seq = Math.max(1, sh.getLastRow());
    const orderId = 'MYD-' + Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyyMMdd') + '-' + String(seq).padStart(4,'0');
    const q=n=>{const x=items.find(v=>Number(v.grade)===n);return x?Number(x.qty)||0:0};
    const totalQty=[1,2,3,4,5].reduce((s,n)=>s+q(n),0);
    const totalAmount=items.reduce((sum,x)=>sum+(Number(x.qty)||0)*(Number(x.price)||0),0);

    let lat=Number(d.schoolLat)||null,lng=Number(d.schoolLng)||null,source=d.locationSource||'';
    if(!lat||!lng){
      const g=geocodeSchool_(d.school,d.district,d.province);
      lat=g.lat||Number(d.districtLat)||null;lng=g.lng||Number(d.districtLng)||null;source=g.source||(lat&&lng?'District center':'');
    }
    upsertSchool_(d.province,d.district,d.school,lat,lng,source);

    sh.appendRow([orderId,now,d.name,d.phone,d.email,d.province,d.district,d.school,q(1),q(2),q(3),q(4),q(5),totalQty,totalAmount,'Шинэ',d.note||'','',lat||'',lng||'',source||'',now]);
    formatOrdersSheet_(sh);

    MailApp.sendEmail({
      to: CONFIG.ADMIN_EMAIL,
      subject: 'Шинэ захиалга — '+orderId+' — '+d.school,
      htmlBody:`<h2>🎵 MY ДЭВТЭР — Шинэ захиалга</h2><p><b>${orderId}</b></p><p>${d.name} · ${d.phone}<br>${d.email}<br>${d.province} · ${d.district}<br><b>${d.school}</b></p><p>1-р анги: ${q(1)}<br>2-р анги: ${q(2)}<br>3-р анги: ${q(3)}<br>4-р анги: ${q(4)}<br>5-р анги: ${q(5)}</p><p><b>Нийт: ${totalQty} дэвтэр</b><br><b>Захиалгын нийт дүн: ${totalAmount.toLocaleString('mn-MN')}₮</b></p>`
    });
    MailApp.sendEmail({
      to:d.email,subject:'Таны захиалга бүртгэгдлээ — '+orderId,
      htmlBody:`<h2>✅ Захиалга амжилттай бүртгэгдлээ</h2><p>Сайн байна уу, <b>${d.name}</b>.</p><p>Захиалгын дугаар: <b>${orderId}</b></p><p>Сургууль: <b>${d.school}</b><br>Нийт: <b>${totalQty} дэвтэр</b><br>Захиалгын нийт дүн: <b>${totalAmount.toLocaleString('mn-MN')}₮</b></p><p>Бид таны <b>${d.phone}</b> утсаар холбогдож төлбөр болон хүргэлтийг баталгаажуулна.</p><p>${CONFIG.SITE_URL}</p>`
    });
    return {ok:true,orderId};
  } finally { lock.releaseLock(); }
}

function geocodeSchool_(school,district,province){
  try{
    const geocoder=Maps.newGeocoder().setLanguage('mn').setRegion('mn');
    const queries=[`${school}, ${district}, ${province}, Монгол`,`${school}, ${province}, Монгол`];
    for(const q of queries){
      const res=geocoder.geocode(q);if(res&&res.status==='OK'&&res.results&&res.results.length){
        const loc=res.results[0].geometry.location;return{lat:Number(loc.lat),lng:Number(loc.lng),source:'Google geocoder'};
      }
    }
  }catch(e){console.log('Geocode failed: '+e)}
  return{lat:null,lng:null,source:''};
}

function listOrders_() {
  const sh=sheet_(),values=sh.getDataRange().getValues();if(values.length<2)return[];
  return values.slice(1).reverse().map(r=>({
    orderId:r[0],createdAt:dateIso_(r[1]),name:r[2],phone:r[3],email:r[4],province:r[5],district:r[6],school:r[7],
    grade1:Number(r[8])||0,grade2:Number(r[9])||0,grade3:Number(r[10])||0,grade4:Number(r[11])||0,grade5:Number(r[12])||0,totalQty:Number(r[13])||0,totalAmount:Number(r[14])||0,
    status:r[15]||'Шинэ',note:r[16]||'',adminNote:r[17]||'',lat:Number(r[18])||null,lng:Number(r[19])||null,locationSource:r[20]||'',updatedAt:dateIso_(r[21]),
    items:[1,2,3,4,5].map((n,i)=>({grade:n,qty:Number(r[8+i])||0})).filter(x=>x.qty>0)
  }));
}

function updateOrder_(d) {
  const sh=sheet_(),values=sh.getDataRange().getValues();
  for(let i=1;i<values.length;i++){
    if(String(values[i][0])===String(d.orderId)){
      if(d.status!==undefined)sh.getRange(i+1,16).setValue(d.status);
      if(d.adminNote!==undefined)sh.getRange(i+1,18).setValue(d.adminNote);
      sh.getRange(i+1,22).setValue(new Date());return{ok:true};
    }
  }
  return{ok:false,error:'Order not found'};
}

// Optional: Run manually if you want to re-geocode rows with no coordinates.
function refreshMissingCoordinates(){
  const sh=sheet_(),v=sh.getDataRange().getValues();let done=0;
  for(let i=1;i<v.length&&done<40;i++){
    if(v[i][7]&&(!v[i][18]||!v[i][19])){
      const g=geocodeSchool_(v[i][7],v[i][6],v[i][5]);
      if(g.lat&&g.lng){sh.getRange(i+1,19,1,3).setValues([[g.lat,g.lng,g.source]]);upsertSchool_(v[i][5],v[i][6],v[i][7],g.lat,g.lng,g.source);done++}
    }
  }
  return done;
}

function dateIso_(v){if(!v)return'';try{return new Date(v).toISOString()}catch(e){return String(v)}}
// Нэг удаа гараар Run хийж хуучин Orders хүснэгтийг шинэ ойлгомжтой бүтэц рүү шилжүүлж болно.
function upgradeOrdersSheetNow(){
  const sh = sheet_();
  return 'Orders sheet upgraded. Rows: ' + sh.getLastRow();
}

function json_(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)}

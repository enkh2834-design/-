const CONFIG = {
  SHEET_ID: '1ReDt0jxBLUe_sBBdC4YVUQt-dhDAxJveEYFgf4z-00Y',
  SHEET_NAME: 'Orders',
  SCHOOLS_SHEET_NAME: 'Schools',

  // ӨӨРИЙН ОДООГИЙН УТГУУДАА ЭНД ТАВИНА.
  ADMIN_EMAIL: 'KEEP_YOUR_CURRENT_ADMIN_EMAIL_HERE',
  ADMIN_KEY: 'KEEP_YOUR_CURRENT_ADMIN_KEY_HERE',

  SITE_URL: 'https://mydewter.mn'
};

const ORDER_HEADERS = [
  'Order ID','Date','Name','Phone','Email','Province','District/Soum','School',
  'Grade 1','Grade 2','Grade 3','Grade 4','Grade 5',
  'Total Qty','Total Amount','Status','Customer Note','Admin Note','Latitude','Longitude'
];

function doGet(e){
  try{
    const p=e.parameter||{};
    if(p.action==='listOrders'){
      if(p.adminKey!==CONFIG.ADMIN_KEY)return json_({ok:false,error:'Unauthorized'});
      return json_({ok:true,orders:listOrders_()});
    }
    if(p.action==='listSchools'){
      return json_({ok:true,schools:listSchools_(p.province||'',p.district||'')});
    }
    return json_({ok:true,service:'MY Dewter Orders V8'});
  }catch(err){return json_({ok:false,error:String(err)})}
}

function doPost(e){
  try{
    const d=JSON.parse((e.postData&&e.postData.contents)||'{}');
    if(d.action==='createOrder')return json_(createOrder_(d));
    if(d.action==='updateOrder'){
      if(d.adminKey!==CONFIG.ADMIN_KEY)return json_({ok:false,error:'Unauthorized'});
      return json_(updateOrder_(d));
    }
    return json_({ok:false,error:'Unknown action'});
  }catch(err){return json_({ok:false,error:String(err)})}
}

function sheet_(){
  const ss=SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sh=ss.getSheetByName(CONFIG.SHEET_NAME);
  if(!sh)sh=ss.insertSheet(CONFIG.SHEET_NAME);
  ensureOrdersFormat_(ss,sh);
  return sh;
}

function ensureOrdersFormat_(ss,sh){
  if(sh.getLastRow()===0){
    sh.getRange(1,1,1,ORDER_HEADERS.length).setValues([ORDER_HEADERS]);
    formatOrdersSheet_(sh);
    return;
  }
  const oldHeaders=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0];
  if(oldHeaders.join('|')===ORDER_HEADERS.join('|')){
    formatOrdersSheet_(sh);return;
  }

  const stamp=Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyyyMMdd_HHmmss');
  sh.copyTo(ss).setName('Orders_backup_'+stamp);

  const values=sh.getDataRange().getValues();
  const h=values[0].map(String);
  const find=(name)=>h.indexOf(name);
  const val=(row,...names)=>{
    for(const n of names){const i=find(n);if(i>=0&&row[i]!==''&&row[i]!=null)return row[i]}
    return '';
  };

  const rows=[ORDER_HEADERS];
  for(let r=1;r<values.length;r++){
    const row=values[r];
    if(row.every(v=>v===''))continue;

    let items=[];
    const itemIdx=find('Items JSON');
    if(itemIdx>=0){try{items=JSON.parse(row[itemIdx]||'[]')}catch(e){items=[]}}

    const grade=n=>{
      const direct=Number(val(row,'Grade '+n,n+'-р анги'))||0;
      if(direct)return direct;
      const x=items.find(x=>Number(x.grade)===n);
      return x?Number(x.qty)||0:0;
    };
    const grades=[1,2,3,4,5].map(grade);
    const totalQty=Number(val(row,'Total Qty'))||grades.reduce((a,b)=>a+b,0);
    const totalAmount=Number(val(row,'Total Amount'))||
      items.reduce((sum,x)=>sum+(Number(x.qty)||0)*(Number(x.price)||0),0);

    rows.push([
      val(row,'Order ID'),
      val(row,'Date','Created At'),
      val(row,'Name'),
      val(row,'Phone'),
      val(row,'Email'),
      val(row,'Province'),
      val(row,'District/Soum','District'),
      val(row,'School'),
      grades[0],grades[1],grades[2],grades[3],grades[4],
      totalQty,totalAmount,
      val(row,'Status')||'Шинэ',
      val(row,'Customer Note'),
      val(row,'Admin Note'),
      val(row,'Latitude'),
      val(row,'Longitude')
    ]);
  }

  sh.clear();
  sh.getRange(1,1,rows.length,ORDER_HEADERS.length).setValues(rows);
  formatOrdersSheet_(sh);
}

function formatOrdersSheet_(sh){
  sh.setFrozenRows(1);
  sh.getRange(1,1,1,ORDER_HEADERS.length)
    .setFontWeight('bold')
    .setFontColor('#ffffff')
    .setBackground('#234f9b')
    .setVerticalAlignment('middle');

  sh.setRowHeight(1,34);
  const widths=[145,150,130,105,190,120,145,170,72,72,72,72,72,85,110,115,190,190,100,100];
  widths.forEach((w,i)=>sh.setColumnWidth(i+1,w));

  const rows=Math.max(sh.getMaxRows()-1,1);
  sh.getRange(2,9,rows,7).setHorizontalAlignment('center');
  sh.getRange(2,15,rows,1).setNumberFormat('#,##0"₮"');
  sh.getRange(2,2,rows,1).setNumberFormat('yyyy-mm-dd hh:mm');
  sh.getRange(1,1,Math.max(sh.getLastRow(),1),ORDER_HEADERS.length).setWrap(true);

  // Alternate soft row shading for easy reading.
  if(sh.getLastRow()>1){
    for(let r=2;r<=sh.getLastRow();r++){
      sh.getRange(r,1,1,ORDER_HEADERS.length).setBackground(r%2===0?'#f7f9fc':'#ffffff');
    }
  }
}

function schoolsSheet_(){
  const ss=SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sh=ss.getSheetByName(CONFIG.SCHOOLS_SHEET_NAME);
  if(!sh)sh=ss.insertSheet(CONFIG.SCHOOLS_SHEET_NAME);
  if(sh.getLastRow()===0){
    sh.appendRow(['Province','District/Soum','School','Latitude','Longitude','Active','Source']);
    sh.setFrozenRows(1);
    sh.getRange(1,1,1,7).setFontWeight('bold').setBackground('#dceaff');
  }
  return sh;
}

function listSchools_(province,district){
  const sh=schoolsSheet_(),v=sh.getDataRange().getValues();
  if(v.length<2)return[];
  return v.slice(1)
    .filter(r=>String(r[0])===String(province)&&String(r[1])===String(district)&&String(r[5]).toLowerCase()!=='false')
    .map(r=>({school:r[2],lat:Number(r[3])||null,lng:Number(r[4])||null,source:r[6]||'Schools sheet'}));
}

function upsertSchool_(province,district,school,lat,lng,source){
  if(!school)return;
  const sh=schoolsSheet_(),v=sh.getDataRange().getValues();
  for(let i=1;i<v.length;i++){
    if(String(v[i][0])===String(province)&&String(v[i][1])===String(district)&&
       String(v[i][2]).trim().toLowerCase()===String(school).trim().toLowerCase()){
      if(lat&&lng)sh.getRange(i+1,4,1,2).setValues([[lat,lng]]);
      sh.getRange(i+1,6).setValue(true);
      if(source)sh.getRange(i+1,7).setValue(source);
      return;
    }
  }
  sh.appendRow([province,district,school,lat||'',lng||'',true,source||'Order']);
}

function createOrder_(d){
  if(!d.name||!d.phone||!d.email||!d.province||!d.district||!d.school)
    return{ok:false,error:'Required fields are missing'};

  const items=Array.isArray(d.items)?d.items:[];
  if(!items.some(x=>Number(x.qty)>0))return{ok:false,error:'No items'};

  const sh=sheet_();
  const lock=LockService.getScriptLock();lock.waitLock(10000);
  try{
    const now=new Date();
    const seq=Math.max(1,sh.getLastRow());
    const orderId='MYD-'+Utilities.formatDate(now,Session.getScriptTimeZone(),'yyyyMMdd')+'-'+String(seq).padStart(4,'0');
    const q=n=>{const x=items.find(v=>Number(v.grade)===n);return x?Number(x.qty)||0:0};
    const totalQty=[1,2,3,4,5].reduce((s,n)=>s+q(n),0);
    const totalAmount=items.reduce((s,x)=>s+(Number(x.qty)||0)*(Number(x.price)||0),0);

    let lat=Number(d.schoolLat)||null,lng=Number(d.schoolLng)||null,source=d.locationSource||'';
    if(!lat||!lng){
      const g=geocodeSchool_(d.school,d.district,d.province);
      lat=g.lat||Number(d.districtLat)||null;
      lng=g.lng||Number(d.districtLng)||null;
      source=g.source||(lat&&lng?'District center':'');
    }
    upsertSchool_(d.province,d.district,d.school,lat,lng,source);

    sh.appendRow([
      orderId,now,d.name,d.phone,d.email,d.province,d.district,d.school,
      q(1),q(2),q(3),q(4),q(5),totalQty,totalAmount,'Шинэ',
      d.note||'','',lat||'',lng||''
    ]);
    formatOrdersSheet_(sh);

    MailApp.sendEmail({
      to:CONFIG.ADMIN_EMAIL,
      subject:'Шинэ захиалга — '+orderId+' — '+d.school,
      htmlBody:`<h2>MY ДЭВТЭР — Шинэ захиалга</h2>
      <p><b>${orderId}</b></p>
      <p>${d.name} · ${d.phone}<br>${d.email}<br>${d.province} · ${d.district}<br><b>${d.school}</b></p>
      <p>1-р анги: ${q(1)}<br>2-р анги: ${q(2)}<br>3-р анги: ${q(3)}<br>4-р анги: ${q(4)}<br>5-р анги: ${q(5)}</p>
      <p><b>Нийт: ${totalQty} дэвтэр</b><br><b>Нийт төлбөр: ${totalAmount.toLocaleString('mn-MN')}₮</b></p>`
    });

    MailApp.sendEmail({
      to:d.email,
      subject:'Таны захиалга бүртгэгдлээ — '+orderId,
      htmlBody:`<h2>Захиалга амжилттай бүртгэгдлээ</h2>
      <p>Сайн байна уу, <b>${d.name}</b>.</p>
      <p>Захиалгын дугаар: <b>${orderId}</b></p>
      <p>Нийт: <b>${totalQty} дэвтэр</b><br>Нийт төлбөр: <b>${totalAmount.toLocaleString('mn-MN')}₮</b></p>
      <p>Бид таны ${d.phone} дугаараар холбогдож төлбөр, хүргэлтийг баталгаажуулна.</p>`
    });
    return{ok:true,orderId};
  }finally{lock.releaseLock()}
}

function listOrders_(){
  const sh=sheet_(),v=sh.getDataRange().getValues();
  if(v.length<2)return[];
  return v.slice(1).reverse().map(r=>({
    orderId:r[0],createdAt:dateIso_(r[1]),name:r[2],phone:r[3],email:r[4],
    province:r[5],district:r[6],school:r[7],
    grade1:Number(r[8])||0,grade2:Number(r[9])||0,grade3:Number(r[10])||0,grade4:Number(r[11])||0,grade5:Number(r[12])||0,
    totalQty:Number(r[13])||0,totalAmount:Number(r[14])||0,status:r[15]||'Шинэ',
    note:r[16]||'',adminNote:r[17]||'',lat:Number(r[18])||null,lng:Number(r[19])||null,
    items:[1,2,3,4,5].map((n,i)=>({grade:n,qty:Number(r[8+i])||0})).filter(x=>x.qty>0)
  }));
}

function updateOrder_(d){
  const sh=sheet_(),v=sh.getDataRange().getValues();
  for(let i=1;i<v.length;i++){
    if(String(v[i][0])===String(d.orderId)){
      if(d.status!==undefined)sh.getRange(i+1,16).setValue(d.status);
      if(d.adminNote!==undefined)sh.getRange(i+1,18).setValue(d.adminNote);
      return{ok:true};
    }
  }
  return{ok:false,error:'Order not found'};
}

function geocodeSchool_(school,district,province){
  try{
    const geocoder=Maps.newGeocoder().setLanguage('mn').setRegion('mn');
    const queries=[`${school}, ${district}, ${province}, Монгол`,`${school}, ${province}, Монгол`];
    for(const q of queries){
      const res=geocoder.geocode(q);
      if(res&&res.status==='OK'&&res.results&&res.results.length){
        const loc=res.results[0].geometry.location;
        return{lat:Number(loc.lat),lng:Number(loc.lng),source:'Google geocoder'};
      }
    }
  }catch(e){console.log('Geocode failed: '+e)}
  return{lat:null,lng:null,source:''};
}

// Хуучин Orders sheet-ээ CSV шиг ойлгомжтой бүтэц рүү нэг удаа шинэчлэх.
function upgradeOrdersSheetNow(){
  const sh=sheet_();
  return 'Orders upgraded. Rows: '+sh.getLastRow();
}

function dateIso_(v){if(!v)return'';try{return new Date(v).toISOString()}catch(e){return String(v)}}
function json_(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)}

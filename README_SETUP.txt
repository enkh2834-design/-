MY ДЭВТЭР — DOMAIN SITE PACKAGE
================================

Файлууд:
- index.html      : нийтэд харагдах сайт
- admin.html      : захиалгын админ dashboard
- editor.html     : зураг, тайлбар, үнэ, зохиогчийн мэдээлэл засах editor
- site-data.js    : сайтын бүх editable мэдээлэл
- Code.gs         : Google Apps Script backend
- README_SETUP.txt

1. GITHUB PAGES ДЭЭР БАЙРШУУЛАХ
--------------------------------
Repository root руу:
index.html
admin.html
editor.html
site-data.js
файлуудаа upload хийнэ.

Custom domain: mydewter.mn
DNS check successful болсон бол GitHub Pages автоматаар энэ index.html-г харуулна.

2. ЗУРАГ / ТАЙЛБАР ӨӨРЧЛӨХ
--------------------------
editor.html-г browser-оор нээнэ.
1–5-р анги тус бүрийн нүүр зураг, тайлбар, үнэ, зохиогчийн зураг, гэрчилгээг оруулна.
“Шинэ site-data.js татах” дарна.
Татагдсан site-data.js-г GitHub дээрх хуучин site-data.js-ээр солино.

АНХААР:
editor.html нь өөрөө GitHub руу publish хийхгүй. Энэ нь GitHub token-оо HTML дотор ил гаргахгүй, аюулгүй байлгахын тулд зориуд ингэж хийгдсэн.

3. ЗАХИАЛГА ХАДГАЛАХ BACKEND
----------------------------
Google Sheet шинээр үүсгэнэ.
URL доторх Sheet ID-г хуулна.
Extensions → Apps Script.
Code.gs-г paste хийнэ.

CONFIG хэсэгт:
SHEET_ID
ADMIN_EMAIL
ADMIN_KEY
SITE_URL
утгуудаа өөрчилнө.

ADMIN_KEY-г урт, бусад хүн таах боломжгүй утга болгоно. Жишээ:
Ariuka-MyDewter-2026-8F3x-OnlyMe

Deploy → New deployment → Web app
Execute as: Me
Who has access: Anyone
Deploy.

Гарсан Web App URL-г editor.html → Google Apps Script URL хэсэгт оруулж,
шинэ site-data.js татаж GitHub дээр солино.

4. ADMIN
--------
https://mydewter.mn/admin.html
руу орно.
Code.gs дээр тохируулсан ADMIN_KEY-г бичээд нэвтэрнэ.

Admin дээр:
- нийт захиалга
- шинэ / холбогдоогүй
- нийт дэвтэр
- сургуулийн тоо
- Монголын газрын зураг
- нэр / утас / сургууль хайх
- аймаг / төлөв filter
- статус өөрчлөх
- админ тэмдэглэл
- CSV export
- ангиар / сургуулиар / төлөвөөр статистик
харагдана.

5. ТӨЛБӨР
----------
Энэ хувилбарт QPay БАЙХГҮЙ.
Захиалагч:
нэр + утас + имэйл + аймаг/хот + дүүрэг/сум + сургууль + анги бүрийн тоо
өгнө.
Захиалга бүр MYD-YYYYMMDD-#### дугаартай бүртгэгдэнэ.
Танд шинэ захиалгын email ирнэ.
Захиалагчид баталгаажуулах email автоматаар явна.
Та өөрөө холбогдож төлбөр, хүргэлтээ тохирно.

6. НУУЦЛАЛ
----------
admin.html нь public URL боловч захиалгын дата авахын тулд ADMIN_KEY шаарддаг.
ADMIN_KEY-г site-data.js болон GitHub-д БҮҮ оруул.
Зөвхөн Apps Script Code.gs болон өөрийн admin login үед ашиглана.

Энэ нь жижиг бизнесийн lightweight хамгаалалт. Илүү өндөр түвшний authentication хүсвэл дараагийн шатанд Google Sign-In/Firebase Auth ашиглах нь зөв.


BACKEND CONNECTED
-----------------
Google Apps Script Web App URL has already been inserted into site-data.js:

https://script.google.com/macros/s/AKfycby2BMU-GVtvCd6PGMLTkmo32ld3jMt9kdYo3T6AcCP2f2n2JhAqHiddJLv77sCb6LsY/exec

Upload the updated site-data.js to GitHub together with index.html/admin.html/editor.html.

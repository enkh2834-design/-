MY ДЭВТЭР V8 — CLEAN EDITOR + CLEAR GOOGLE SHEET
===================================================

ШИНЭЧЛЭЛТ:
1. Editor.html бүрэн шинэ, цэгцтэй загвартай болсон.
2. Анги тус бүр:
   - нүүр зураг
   - нэр
   - тайлбар
   - үнэ
   - онцлох мэдээлэл
   тусдаа ойлгомжтой card дээр байна.
3. Зохиогчийн нэр:
   Жамсранжавын Энхсайхан
4. Public site нь site-data.js-ээ гаднаас уншдаг болсон.
   Өмнөх шиг index.html дотор давхар site-data байхгүй.
5. 5 жинхэнэ нүүр зураг grade1.png ... grade5.png хэлбэрээр орсон.
6. Google Sheet CSV шиг тусдаа баганатай:
   Order ID
   Date
   Name
   Phone
   Email
   Province
   District/Soum
   School
   Grade 1
   Grade 2
   Grade 3
   Grade 4
   Grade 5
   Total Qty
   Total Amount
   Status
   Customer Note
   Admin Note
   Latitude
   Longitude

AUTHOR ЗУРАГ:
Таны явуулсан attachment нь Author.jpg зураг өөрөө биш, File Explorer дээр Author гэдэг
файл харагдаж байгаа screenshot байсан.
Тиймээс бодит author photo-г ZIP дотор оруулах боломжгүй байлаа.

Бодит зураг оруулахдаа:
- actual зургийг author.jpg гэж нэрлэнэ
- GitHub repository root руу upload хийнэ
- site-data.js дотор authorImage: "author.jpg" аль хэдийн тохирсон

GITHUB:
index.html
admin.html
editor.html
site-data.js
grade1.png
grade2.png
grade3.png
grade4.png
grade5.png
CNAME
файлуудаа ижил нэрээр upload хийж replace хийнэ.

GOOGLE APPS SCRIPT:
Code.gs-ийг шинэ кодоор бүтнээр солино.
ADMIN_EMAIL болон ADMIN_KEY дээр одоогийн өөрийн утгаа заавал тавина.
Save.
Deploy > Manage deployments > Edit > New version > Deploy.
Дараа нь function dropdown-оос upgradeOrdersSheetNow сонгоод Run НЭГ УДАА.
Ингэснээр одоогийн Google Sheet backup үүсгээд шинэ ойлгомжтой баганууд руу шилжинэ.

АНХААР:
Code.gs дотор ADMIN_KEY placeholder байгаа. Өөрийн нууц key-г GitHub руу бүү upload.

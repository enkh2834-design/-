MY ДЭВТЭР V9 — AUTHOR CV + ADMIN TOTAL
========================================

ШИНЭ:
1. Admin:
   - Нийт дүн 0₮ байсан хуучин захиалгад fallback тооцоо хийж харагдуулна.
   - Эхлээд API totalAmount ашиглана.
   - Байхгүй бол items JSON доторх price ашиглана.
   - Тэр ч байхгүй бол site-data.js дээрх тухайн ангийн одоогийн үнийг ашиглана.
   - Dashboard дээр “Нийт захиалгын дүн” гэсэн metric нэмэгдсэн.

2. Нийтийн сайт:
   - Захиалгын баруун талын хоосон зайд зохиогчийн quick profile card орсон.
   - Доод талд зохиогчийн маш том CV-style profile section орсон.
   - Боловсрол
   - Ажлын туршлага
   - Амжилт, шагнал
   - Бүтээл, нийтлэл
   - Чиглэл / мэргэшил
   - Оюуны өмчийн гэрчилгээ
   гэсэн хэсгүүдтэй.

3. Editor:
   - Зохиогчийн бүх CV мэдээллийг editor-оос мөр мөрөөр оруулна.
   - Жинхэнэ зураг Choose File-ээр оруулж болно.
   - site-data.js татаж GitHub дээр replace хийнэ.

GITHUB REPLACE:
- index.html
- admin.html
- editor.html
- site-data.js
- grade1.png ... grade5.png
- CNAME

CODE.GS:
Энэ UI өөрчлөлтөд Code.gs заавал солих шаардлагагүй.
Шинэ захиалгуудын totalAmount backend дээр зөв хадгалагдаж байвал admin шууд ашиглана.

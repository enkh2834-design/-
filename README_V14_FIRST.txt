MY ДЭВТЭР V14 — FINAL EDITOR ARCHITECTURE
===========================================

ТАНЫ ҮНДСЭН ЗОРИЛГОД ЗОРИУЛСАН ШИНЭ БҮТЭЦ:

PUBLIC SITE
- 1–5-р ангийн дэвтэрийн танилцуулга
- Захиалга
- Аймаг/хот -> дүүрэг/сум -> сургууль
- Утас, имэйл
- Админ dashboard
- Сонсох хөгжмийн static QR link

MOBILE ORDER FLOW
Утаснаас:
1. Захиалга өгөх form
2. Захиалах дэвтэр + Нийт төлбөр
3. Холбоо барих
4. Зохиогч + Оюуны өмч
гэсэн дарааллаар харагдана.

EDITOR
- Canva-like 2-column Studio
- Зүүн талд засварууд
- Баруун талд яг public index.html live preview
- Desktop / Mobile preview toggle
- Зураг, тайлбар, үнэ, CV, холбоо, сонсох хөгжмийг засна
- “Хадгалах & Нийтлэх” дарна
- GitHub руу site-data.js дахин upload хийх ШААРДЛАГАГҮЙ
- Apps Script Drive JSON file-д content хадгалагдана
- Public site refresh хийхэд шинэ content автоматаар авна

EDITOR SECURITY
Google/Gmail-ийн ЖИНХЭНЭ password-оо mydewter.mn дээр ХЭЗЭЭ Ч ашиглахгүй.
Apps Script CONFIG дээр:
  EDITOR_EMAIL: 'your-admin@gmail.com'
  EDITOR_PASSWORD: 'YOUR-SEPARATE-MYDEWTER-PASSWORD'
гэж MY ДЭВТЭР editor-ийн тусдаа password тохируулна.

Хэрэв яг Google account-ийн “Sign in with Google” OAuth login хүсвэл Google Cloud OAuth Client ID тохируулах нэмэлт алхам шаардлагатай. Энэ V14 нь илүү хялбар боловч backend-ээр хамгаалагдсан email + тусдаа password login ашиглана.

APPS SCRIPT INSTALL
1. Code.gs-ийг Apps Script дээр бүтнээр replace.
2. CONFIG-ийн EDITOR_EMAIL болон EDITOR_PASSWORD-ийг солино.
3. ADMIN_EMAIL / ADMIN_KEY-ээ өөрийн утгаар хадгална.
4. Save.
5. Deploy > Manage deployments > Edit > New version > Deploy.
6. Web App URL өөрчлөгдөхгүй.

GITHUB
index.html
editor.html
listen.html
site-data.js
admin.html
grade1.png ... grade5.png
audio folder
CNAME
файлуудаа upload / replace хийнэ.

АНХААР
Code.gs-г public GitHub дээр бүү upload. Энэ нь зөвхөн Apps Script дээр байна.

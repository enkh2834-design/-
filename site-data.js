// MY ДЭВТЭР — үндсэн агуулгын файл.
// editor.html дээр өөрчлөлт хийж шинэ site-data.js татаж болно.

window.MYDEWTER_DATA = {
  brand: "Хөгжмийн дасгал ажлын дэвтэр",
  tagline: "Хөгжим · Дасгал · Хөгжил",

  heroBadge: "1–5-р ангийн хөгжмийн хичээлийн дэвтэр",
  heroTitle: "Цэгцтэй, ойлгомжтой дэвтэр хөтлөлт",
  heroText: "Бага боловсролын сургалтын агуулгын хүрээнд QR сонсох материал, насны онцлогт тохирсон даалгавар, хөгжмийн мэдрэмжийг хөгжүүлэх дасгал ажлын дэвтэр.",

  teacherSectionTitle: "🎵 Хөгжмийн дасгал ажлын дэвтэр — таны ажлын ачааллыг хөнгөвчилнө!",
  teacherSectionText: "Хичээл бүрт дасгал боловсруулах гэж цаг их зарцуулах шаардлагагүй. Багш, сурагчдын хэрэгцээнд нийцсэн бэлэн дасгал, даалгавар бүхий хөгжмийн ажлын дэвтэр нь хичээлээ илүү хялбар, үр дүнтэй зохион байгуулахад тань тусална.",
  teacherBenefits: [
    "⏰ Цагаа хэмнэж",
    "📚 Хичээлээ хөнгөвчилж",
    "🎼 Сурагчдын хөгжмийн мэдлэг, чадварыг дэмжээрэй!"
  ],
  teacherSectionClosing: "🎶 Хөгжмийн хичээлийг илүү хялбар болгоё!",
  heroImage: "",

  authorName: "Жамсранжавын Энхсайхан",
  authorTitle: "Хөгжмийн багш, арга зүйч",
  authorBio: "",
  authorSpecialization: "Хөгжмийн боловсрол",
  authorEducation: ["СУИС “Хөгжмийн багш арга зүйч”", "МУБИС “Боловсролын удирдлагын магистр”"],
  authorExperience: ["Хөгжмийн багш арга зүйч мэргэжлээр боловсролын салбарт 28 дахь жилдээ ажиллаж байна."],
  authorAchievements: ["АБТА, МУСТА"],
  authorPublications: ["1–5 дугаар ангийн хөгжмийн дасгал ажлын дэвтэр"],
  authorImage: "author.jpg",

  certificateText: "Энэхүү дэвтрийн агуулга, дизайн зохиогчийн эрхээр хамгаалагдсан.",
  certificateImage: "",

  phone: "80080371",
  email: "enkh2834@gmail.com",
  address: "Москва хороолол, Сонгинохайрхан дүүрэг, Улаанбаатар хот, Монгол улс",

  orderApiUrl: "https://script.google.com/macros/s/AKfycby2BMU-GVtvCd6PGMLTkmo32ld3jMt9kdYo3T6AcCP2f2n2JhAqHiddJLv77sCb6LsY/exec",

  grades: [
    {
      grade: 1,
      title: "1-р ангийн дэвтэр",
      description: "Хөгжмийн үндсэн ойлголт, дуу авиаг таних, хөгжимтэй танилцах анхны алхмууд.",
      price: 5000,
      bullets: ["QR сонсох материал", "Өнгөлөг, энгийн даалгавар", "Ноотны бичвэрийн дасгал"],
      listeningTracks: [],
      image: "grade1.png"
    },
    {
      grade: 2,
      title: "2-р ангийн дэвтэр",
      description: "Хэмнэл, аялгууны мэдрэмжийг хөгжүүлэх, долоон эгшгийг таних дасгалууд.",
      price: 5000,
      bullets: ["Эгшгийн өндөр намыг мэдэх", "QR сонсох материал", "Долоон эгшгийг таних дасгалууд"],
      listeningTracks: [],
      image: "grade2.png"
    },
    {
      grade: 3,
      title: "3-р ангийн дэвтэр",
      description: "Ноот унших, дуу дуулах, хөгжмийн зэмсэгтэй танилцах гүнзгийрүүлсэн агуулга.",
      price: 5000,
      bullets: ["Ноот унших дасгал", "Бишгүүрийн даралт, ноотны дасгал", "QR сонсох материал"],
      listeningTracks: [],
      image: "grade3.png"
    },
    {
      grade: 4,
      title: "4-р ангийн дэвтэр",
      description: "Хөгжмийн онол, түүхэн товч мэдээлэл, бүтээлч дасгал ажлууд.",
      price: 5000,
      bullets: ["Хөгжмийн онолын үндэс", "Түүхэн мэдээлэл", "Бүтээлч даалгавар"],
      listeningTracks: [],
      image: "grade4.png"
    },
    {
      grade: 5,
      title: "5-р ангийн дэвтэр",
      description: "Ахисан түвшний дасгал, дуу зохиох, хамтын хөгжим тоглох чиглэлээр бэлтгэх агуулга.",
      price: 5000,
      bullets: ["Ахисан түвшний дасгал", "Дуу зохиох чиглэл", "QR сонсох материал"],
      listeningTracks: [],
      image: "grade5.png"
    }
  ]
};


// V18: Published editor data + exact editor preview support.
window.MYDEWTER_READY = (async function(){
  try {
    const params = new URLSearchParams(location.search);

    if (params.get('editorPreview') === '1') {
      const preview = localStorage.getItem('mydewter_editor_preview_data');
      if (preview) {
        window.MYDEWTER_DATA = Object.assign(
          {},
          window.MYDEWTER_DATA,
          JSON.parse(preview)
        );
      }
      return window.MYDEWTER_DATA;
    }

    const api = window.MYDEWTER_DATA && window.MYDEWTER_DATA.orderApiUrl;
    if (!api) return window.MYDEWTER_DATA;

    const r = await fetch(api + '?action=getSiteData&_=' + Date.now(), {cache:'no-store'});
    const result = await r.json();

    if (result && result.ok && result.data) {
      window.MYDEWTER_DATA = Object.assign({}, window.MYDEWTER_DATA, result.data);
      if (!window.MYDEWTER_DATA.orderApiUrl) {
        window.MYDEWTER_DATA.orderApiUrl = api;
      }
    }
  } catch (e) {
    console.warn('Published site data fallback:', e);
  }
  return window.MYDEWTER_DATA;
})();

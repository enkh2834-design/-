// MY ДЭВТЭР — үндсэн агуулгын файл.
// editor.html дээр өөрчлөлт хийж шинэ site-data.js татаж болно.

window.MYDEWTER_DATA = {
  brand: "MY ДЭВТЭР",
  tagline: "Хөгжим · Дасгал · Хөгжил",

  heroBadge: "1–5-р ангийн хөгжмийн дэвтэр",
  heroTitle: "Хүүхэд бүрт тохирсон хөгжмийн ухаалаг дэвтэр",
  heroText: "QR сонсох материал, насны онцлогт тохирсон даалгавар, хөгжмийн мэдрэмжийг хөгжүүлэх агуулгатай цогц ажлын дэвтэр.",
  heroImage: "",

  authorName: "Жамсранжавын Энхсайхан",
  authorTitle: "Зохиогч",
  authorBio: "",
  authorSpecialization: "",
  authorEducation: [],
  authorExperience: [],
  authorAchievements: [],
  authorPublications: [],
  authorImage: "author.jpg",

  certificateText: "Энэхүү дэвтрийн агуулга, дизайн зохиогчийн эрхээр хамгаалагдсан.",
  certificateImage: "",

  phone: "9911-2233",
  email: "info@mydewter.mn",
  address: "Улаанбаатар хот, Монгол улс",

  orderApiUrl: "https://script.google.com/macros/s/AKfycby2BMU-GVtvCd6PGMLTkmo32ld3jMt9kdYo3T6AcCP2f2n2JhAqHiddJLv77sCb6LsY/exec",

  grades: [
    {
      grade: 1,
      title: "1-р ангийн дэвтэр",
      description: "Хөгжмийн үндсэн ойлголт, дуу авиаг таних, хөгжимтэй танилцах анхны алхмууд.",
      price: 12000,
      bullets: ["QR сонсох материал", "Өнгөлөг, энгийн даалгавар", "Гарын бичвэрийн дасгал"],
      listeningTracks: [],
      image: "grade1.png"
    },
    {
      grade: 2,
      title: "2-р ангийн дэвтэр",
      description: "Хэмнэл, аялгууны мэдрэмжийг хөгжүүлэх, энгийн ноот таних дасгалууд.",
      price: 12500,
      bullets: ["Хэмнэлийн дасгал", "QR сонсох материал", "Багшийн зөвлөмжтэй"],
      listeningTracks: [],
      image: "grade2.png"
    },
    {
      grade: 3,
      title: "3-р ангийн дэвтэр",
      description: "Ноот унших, дуу дуулах, хөгжмийн зэмсэгтэй танилцах гүнзгийрүүлсэн агуулга.",
      price: 13000,
      bullets: ["Ноот унших дасгал", "Хөгжмийн зэмсгийн танилцуулга", "QR сонсох материал"],
      listeningTracks: [],
      image: "grade3.png"
    },
    {
      grade: 4,
      title: "4-р ангийн дэвтэр",
      description: "Хөгжмийн онол, түүхэн товч мэдээлэл, бүтээлч дасгал ажлууд.",
      price: 13500,
      bullets: ["Хөгжмийн онолын үндэс", "Түүхэн мэдээлэл", "Бүтээлч даалгавар"],
      listeningTracks: [],
      image: "grade4.png"
    },
    {
      grade: 5,
      title: "5-р ангийн дэвтэр",
      description: "Ахисан түвшний дасгал, дуу зохиох, хамтын хөгжим тоглох чиглэлээр бэлтгэх агуулга.",
      price: 14000,
      bullets: ["Ахисан түвшний дасгал", "Дуу зохиох чиглэл", "QR сонсох материал"],
      listeningTracks: [],
      image: "grade5.png"
    }
  ]
};


// V14: Editor publish + exact preview support.
window.MYDEWTER_READY = (async function(){
  try {
    const params = new URLSearchParams(location.search);

    // Canva-like editor preview: exact public page, but with unsaved draft data.
    if (params.get('editorPreview') === '1') {
      const preview = localStorage.getItem('mydewter_editor_preview_data');
      if (preview) window.MYDEWTER_DATA = JSON.parse(preview);
      return window.MYDEWTER_DATA;
    }

    const api = window.MYDEWTER_DATA && window.MYDEWTER_DATA.orderApiUrl;
    if (!api) return window.MYDEWTER_DATA;

    const r = await fetch(api + '?action=getSiteData&_=' + Date.now(), {cache:'no-store'});
    const out = await r.json();
    if (out && out.ok && out.data) {
      // The backend copy is the published truth. Keep API URL as safety fallback.
      window.MYDEWTER_DATA = Object.assign({}, window.MYDEWTER_DATA, out.data);
      if (!window.MYDEWTER_DATA.orderApiUrl) window.MYDEWTER_DATA.orderApiUrl = api;
    }
  } catch (e) {
    console.warn('Published site data fallback:', e);
  }
  return window.MYDEWTER_DATA;
})();

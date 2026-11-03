// Central business data for Karachi Milk Supplier

export const site = {
  name: "Karachi Milk Supplier",
  logoTop: "KARACHI",
  logoBottom: "Milk",
  since: "1982",
  slogan: "Karachi ka Apna Milk Supplier",
  sloganUrdu: "کراچی کا اپنا ملک سپلائر",
  tagline:
    "Premium wholesale milk, ghee & dairy — trusted by shops, hotels and caterers across Karachi.",
  phone: "+92 308 2979924",
  phoneDigits: "923082979924",
  phoneLocal: "0308 2979924",
  whatsapp: "https://wa.me/923082979924",
  whatsappOrder:
    "https://wa.me/923082979924?text=Assalam%20o%20Alaikum%2C%20mujhe%20doodh%20ka%20order%20dena%20hai.",
  address1: "Sector 5-E, New Karachi Town, Karachi",
  address1Map: "https://maps.app.goo.gl/asi2Q7wrAYwPQvEdA",
  address2: "QTR 84/2, Sector 5-F, New Karachi",
  hours: "Open 24/7",
  city: "Karachi, Pakistan",
  social: {
    instagram: "https://www.instagram.com/gujjjarmilkwholesalers/",
    facebook: "https://www.facebook.com/profile.php?id=61594684811400",
    linkedin: "https://www.linkedin.com/in/gujjar-wholesalers-74888343b/",
  },
};

export const nav = [
  { href: "/", label: "Home", urdu: "ہوم" },
  { href: "/about", label: "About", urdu: "ہمارے بارے میں" },
  { href: "/mandi-rate", label: "Mandi Rate", urdu: "منڈی ریٹ" },
  { href: "/mandi-bill", label: "Mandi Bill", urdu: "منڈی بل" },
  { href: "/#contact", label: "Contact", urdu: "رابطہ" },
];

export type Product = {
  icon: string;
  name: string;
  nameUrdu: string;
  desc: string;
};

export const products: Product[] = [
  {
    icon: "🥛",
    name: "Bhains ka Doodh",
    nameUrdu: "بھینس کا دودھ",
    desc: "Fresh buffalo milk — garha, malai wala, at mandi rate.",
  },
  {
    icon: "🐄",
    name: "Gaye ka Doodh",
    nameUrdu: "گائے کا دودھ",
    desc: "Fresh cow milk — halka aur taaza, at mandi rate.",
  },
  {
    icon: "🍦",
    name: "Dahi",
    nameUrdu: "دہی",
    desc: "Fresh yogurt for shops, hotels and caterers.",
  },
  {
    icon: "🥣",
    name: "Malai",
    nameUrdu: "ملائی",
    desc: "Fresh cream, thick and rich.",
  },
  {
    icon: "🧈",
    name: "Makhan",
    nameUrdu: "مکھن",
    desc: "White butter, the desi way.",
  },
  {
    icon: "🍯",
    name: "Desi Ghee",
    nameUrdu: "دیسی گھی",
    desc: "Wholesale ghee — rate ke liye rabta karein.",
  },
];

export type Buyer = { icon: string; title: string; desc: string };

export const buyers: Buyer[] = [
  {
    icon: "🏪",
    title: "Doodh ki Dukanein",
    desc: "Milk shops get khalis doodh at the day’s mandi rate, subah aur shaam.",
  },
  {
    icon: "🍽️",
    title: "Hotel aur Restaurant",
    desc: "Daily milk, dahi and malai supply for kitchens.",
  },
  {
    icon: "☕",
    title: "Chai ke Hotel",
    desc: "Garha doodh for doodh patti — tea stalls order any time.",
  },
  {
    icon: "🎪",
    title: "Caterers",
    desc: "Bulk milk and dairy for shaadi and events.",
  },
];

export const stats = [
  { value: "1982", label: "Se Khidmat", labelUrdu: "سے خدمت" },
  { value: "24/7", label: "Order & Delivery", labelUrdu: "آرڈر و ڈیلیوری" },
  { value: "Roz", label: "Mandi Rate Update", labelUrdu: "منڈی ریٹ اپڈیٹ" },
  { value: "Karachi", label: "Bhar mein Supply", labelUrdu: "بھر میں سپلائی" },
];

export const aboutFaqs = [
  {
    q: "Karachi Milk Supplier kab se kaam kar raha hai?",
    qUrdu: "کراچی ملک سپلائر کب سے کام کر رہا ہے؟",
    a: "Karachi Milk Supplier 1982 se Karachi mein khalis doodh ka wholesale kar raha hai. Itne barson mein hamara naam hi dukandaron ke liye pehchan ban gaya hai.",
  },
  {
    q: "Doodh ka rate kaise tay hota hai?",
    qUrdu: "دودھ کا ریٹ کیسے طے ہوتا ہے؟",
    a: "Rate Karachi doodh mandi ki Mushtarika Committee tay karti hai — roz subah aur shaam ke liye alag. Hum wohi mandi rate lagate hain, kabhi barha kar nahi.",
  },
  {
    q: "Kya kam az kam order ki koi shart hai?",
    qUrdu: "کیا کم از کم آرڈر کی کوئی شرط ہے؟",
    a: "Nahi. Ek Mun se le kar poori gaari tak — jitni zaroorat ho utna order karein. Na account ki shart, na minimum order.",
  },
  {
    q: "Order kaise karein?",
    qUrdu: "آرڈر کیسے کریں؟",
    a: "Call ya WhatsApp par rabta karein: 0308 2979924. 24 ghante order liya jata hai aur Karachi bhar mein delivery hoti hai.",
  },
];

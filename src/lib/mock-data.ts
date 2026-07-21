export type SpecialtySlug =
  | "anti-natal"
  | "post-natal"
  | "stroke-recovery"
  | "bone-setting"
  | "infertility"
  | "labor-and-delivery"
  | "infection-treatment";

export interface Specialty {
  slug: SpecialtySlug;
  name: string;
  category: "Maternal Health" | "Physical Therapy" | "Specialized Medicine";
  tagline: string;
  description: string;
  approach: string[];
  icon: string;
}

export const specialties: Specialty[] = [
  {
    slug: "anti-natal",
    name: "Antenatal Care",
    category: "Maternal Health",
    tagline: "Pregnancy tracking & traditional prenatal wellness",
    description:
      "A gentle, month-by-month journey through pregnancy combining modern monitoring with time-honored herbal support to nurture both mother and baby.",
    approach: [
      "Monthly wellness check-ins and vital tracking",
      "Personalized herbal tonics for iron, nausea, and energy",
      "Guided prenatal massage and breathing sessions",
      "Nutrition plans rooted in local, whole foods",
    ],
    icon: "🌱",
  },
  {
    slug: "post-natal",
    name: "Post-Natal Care",
    category: "Maternal Health",
    tagline: "Mother & newborn recovery",
    description:
      "Restore, replenish, and reconnect. Our post-natal program supports healing after birth for both mother and baby through warm herbal baths, nourishing meals, and bonding rituals.",
    approach: [
      "Traditional warm herbal baths (Agbo Omo)",
      "Uterine restoration compresses",
      "Lactation-supporting herbal blends",
      "Newborn wellness monitoring",
    ],
    icon: "👶",
  },
  {
    slug: "stroke-recovery",
    name: "Stroke Recovery Care",
    category: "Physical Therapy",
    tagline: "Rehabilitative therapy & neuro-restorative herbs",
    description:
      "A structured recovery plan integrating physical therapy, herbal circulation boosters, and daily movement drills to help patients regain mobility and independence.",
    approach: [
      "Daily guided physiotherapy sessions",
      "Circulation-supporting herbal decoctions",
      "Speech and cognitive re-training",
      "Family caregiver coaching",
    ],
    icon: "🧠",
  },
  {
    slug: "bone-setting",
    name: "Traditional Bone Setting",
    category: "Physical Therapy",
    tagline: "Non-surgical fracture & joint realignment",
    description:
      "Generations of expertise in setting fractures, sprains, and dislocations without surgery — combining manual realignment with herbal poultices for accelerated healing.",
    approach: [
      "Manual assessment and gentle realignment",
      "Herbal cast and warm poultice application",
      "Weekly healing checkpoints with imaging",
      "Progressive mobility rehabilitation",
    ],
    icon: "🦴",
  },
  {
    slug: "infertility",
    name: "Infertility in Women",
    category: "Specialized Medicine",
    tagline: "Fertility consultation & holistic treatments",
    description:
      "A compassionate, evidence-based fertility path blending diagnostic clarity with cleansing herbal protocols, cycle tracking, and emotional wellness support.",
    approach: [
      "Full hormonal and cycle assessment",
      "Womb-cleansing herbal protocols",
      "Ovulation and fertility window tracking",
      "Couples counseling and lifestyle guidance",
    ],
    icon: "🌸",
  },
  {
  slug: "labor-and-delivery",
  name: "Labor & Delivery",
  category: "Maternal Health",
  tagline: "Traditional maternity care for safe childbirth",
  description:
    "Supportive maternity care that combines experienced birth attendants, traditional wellness practices, and modern monitoring to promote a safe and healthy delivery for both mother and baby.",
  approach: [
    "Prenatal preparation and birth counseling",
    "Traditional herbal support during labor",
    "Safe delivery under skilled supervision",
    "Post-delivery care for mother and newborn",
  ],
  icon: "🤱",
},

{
  slug: "infection-treatment",
  name: "Infection Care",
  category: "Specialized Medicine",
  tagline: "Herbal solutions for common infections",
  description:
    "Traditional and complementary care for bacterial, fungal, and parasitic infections, using quality herbal formulations alongside appropriate clinical evaluation to promote safe and effective recovery.",
  approach: [
    "Assessment of symptoms and medical history",
    "Herbal remedies tailored to the infection",
    "Nutrition and immune-support guidance",
    "Progress monitoring and follow-up consultations",
  ],
  icon: "🦠",
},
];

export const findSpecialty = (slug: string) => specialties.find((s) => s.slug === slug);

export interface Product {
  id: string;
  name: string;
  category: SpecialtySlug;
  price: number;
  stock: number;
  description: string;
  usage: string;
  emoji: string;
}

export const initialProducts: Product[] = [
  { id: "p1", name: "Iya Agbo — Prenatal Tonic", category: "anti-natal", price: 8500, stock: 42, description: "Iron-rich herbal tonic formulated for expecting mothers.", usage: "1 tablespoon twice daily after meals.", emoji: "🍵" },
  { id: "p2", name: "Omi Ewe — Morning Ease Blend", category: "anti-natal", price: 6200, stock: 30, description: "Ginger-mint infusion that soothes morning nausea.", usage: "Steep 1 sachet in hot water each morning.", emoji: "🌿" },
  { id: "p3", name: "Agbo Omo — Post-Natal Bath Herbs", category: "post-natal", price: 12000, stock: 25, description: "Warm herbal bath blend to restore the mother's body after birth.", usage: "Boil, steam, and bathe with 3 times weekly for 6 weeks.", emoji: "🛁" },
  { id: "p4", name: "Oyin-Iya Lactation Syrup", category: "post-natal", price: 9500, stock: 38, description: "Honey-based syrup with fenugreek and moringa to support lactation.", usage: "2 teaspoons three times daily.", emoji: "🍯" },
  { id: "p5", name: "Egungun Balm — Bone & Joint Salve", category: "bone-setting", price: 7500, stock: 60, description: "Warming balm for fractures, sprains, and joint pain relief.", usage: "Massage gently into affected area twice daily.", emoji: "🧴" },
  { id: "p6", name: "Eegun Alagbara Poultice", category: "bone-setting", price: 10500, stock: 20, description: "Traditional healing poultice for accelerated bone repair.", usage: "Apply under supervision of our practitioner.", emoji: "🌾" },
  { id: "p7", name: "Iranti Ori — Neuro Circulation Tonic", category: "stroke-recovery", price: 14500, stock: 18, description: "Blood-flow supporting tonic for stroke rehabilitation.", usage: "30ml twice daily with warm water.", emoji: "🧠" },
  { id: "p8", name: "Ewe Isokan — Mobility Massage Oil", category: "stroke-recovery", price: 8800, stock: 34, description: "Warming oil for post-stroke physical therapy sessions.", usage: "Use during daily physio sessions.", emoji: "🫧" },
  { id: "p9", name: "Ile-Omo Cleanser", category: "infertility", price: 15500, stock: 22, description: "Womb-cleansing herbal decoction for fertility support.", usage: "Take for 21 days after menstruation.", emoji: "🌸" },
  { id: "p10", name: "Ovul-Wise Cycle Blend", category: "infertility", price: 11000, stock: 27, description: "Balances hormones and supports regular ovulation.", usage: "1 sachet daily throughout the cycle.", emoji: "🌼" },
];

export interface MockPatient {
  id: string;
  name: string;
  age: number;
  gender: "F" | "M";
  phone: string;
  specialty: SpecialtySlug;
  history: { date: string; note: string; author: string }[];
  prescriptions: { date: string; product: string; dosage: string }[];
}

export const initialPatients: MockPatient[] = [
  {
    id: "PT-1001", name: "Adaeze Okafor", age: 32, gender: "F", phone: "+234 803 555 0142", specialty: "anti-natal",
    history: [
      { date: "2026-06-12", note: "First trimester check. Blood pressure normal. Started on Iya Agbo tonic.", author: "Dr. Ogunleye" },
      { date: "2026-05-01", note: "Confirmed pregnancy at 6 weeks. Advised on diet.", author: "Dr. Ogunleye" },
    ],
    prescriptions: [{ date: "2026-06-12", product: "Iya Agbo — Prenatal Tonic", dosage: "1 tbsp x2 daily" }],
  },
  {
    id: "PT-1002", name: "Chinedu Balogun", age: 58, gender: "M", phone: "+234 802 555 0198", specialty: "stroke-recovery",
    history: [
      { date: "2026-07-01", note: "Week 4 rehab. Left-side mobility improved by 35%. Continuing physio.", author: "Dr. Ade" },
      { date: "2026-06-08", note: "Initial post-stroke assessment. Started Iranti Ori tonic.", author: "Dr. Ade" },
    ],
    prescriptions: [{ date: "2026-06-08", product: "Iranti Ori — Neuro Circulation Tonic", dosage: "30ml x2 daily" }],
  },
  {
    id: "PT-1003", name: "Funmilayo Adebayo", age: 29, gender: "F", phone: "+234 806 555 0117", specialty: "infertility",
    history: [
      { date: "2026-06-30", note: "Cycle day 14 scan. Follicle development on track.", author: "Dr. Ogunleye" },
      { date: "2026-05-20", note: "Started Ile-Omo cleanser protocol.", author: "Dr. Ogunleye" },
    ],
    prescriptions: [{ date: "2026-05-20", product: "Ile-Omo Cleanser", dosage: "21-day course" }],
  },
  {
    id: "PT-1004", name: "Tunde Alabi", age: 41, gender: "M", phone: "+234 805 555 0155", specialty: "bone-setting",
    history: [
      { date: "2026-07-05", note: "Week 3 post-fracture. Callus formation healthy. Continuing poultice.", author: "Baba Sesan" },
      { date: "2026-06-15", note: "Tibia fracture set manually. Cast applied.", author: "Baba Sesan" },
    ],
    prescriptions: [{ date: "2026-06-15", product: "Egungun Balm — Bone & Joint Salve", dosage: "Apply x2 daily" }],
  },
  {
    id: "PT-1005", name: "Blessing Umeh", age: 34, gender: "F", phone: "+234 807 555 0163", specialty: "post-natal",
    history: [
      { date: "2026-07-10", note: "3 weeks post-partum. Recovery on track. Baby thriving.", author: "Dr. Ogunleye" },
    ],
    prescriptions: [{ date: "2026-07-10", product: "Agbo Omo — Post-Natal Bath Herbs", dosage: "3x weekly" }],
  },
];

export interface MockAppointment {
  id: string;
  patient: string;
  specialty: SpecialtySlug;
  date: string;
  time: string;
  type: "In-person" | "Virtual";
  status: "Pending" | "Approved" | "Completed" | "Cancelled";
  symptoms: string;
}

export const initialAppointments: MockAppointment[] = [
  { id: "A-2001", patient: "Adaeze Okafor", specialty: "anti-natal", date: "2026-07-14", time: "09:00", type: "In-person", status: "Approved", symptoms: "Second trimester check-up." },
  { id: "A-2002", patient: "Chinedu Balogun", specialty: "stroke-recovery", date: "2026-07-14", time: "10:30", type: "In-person", status: "Approved", symptoms: "Weekly physiotherapy session." },
  { id: "A-2003", patient: "Grace Ekong", specialty: "infertility", date: "2026-07-14", time: "12:00", type: "Virtual", status: "Pending", symptoms: "Consultation for irregular cycles." },
  { id: "A-2004", patient: "Tunde Alabi", specialty: "bone-setting", date: "2026-07-15", time: "08:30", type: "In-person", status: "Approved", symptoms: "Follow-up on tibia fracture healing." },
  { id: "A-2005", patient: "Blessing Umeh", specialty: "post-natal", date: "2026-07-15", time: "11:00", type: "In-person", status: "Pending", symptoms: "Baby wellness and breastfeeding support." },
  { id: "A-2006", patient: "Ifeoma Nwosu", specialty: "anti-natal", date: "2026-07-16", time: "14:00", type: "Virtual", status: "Pending", symptoms: "First-time pregnancy questions." },
];

export interface MockOrder {
  id: string;
  customer: string;
  items: string;
  total: number;
  date: string;
  status: "Pending" | "Fulfilled" | "Shipped";
}

export const initialOrders: MockOrder[] = [
  { id: "O-3001", customer: "Adaeze Okafor", items: "Iya Agbo Tonic ×2", total: 17000, date: "2026-07-12", status: "Fulfilled" },
  { id: "O-3002", customer: "Chinedu Balogun", items: "Iranti Ori Tonic ×1, Ewe Isokan Oil ×1", total: 23300, date: "2026-07-11", status: "Shipped" },
  { id: "O-3003", customer: "Funmilayo Adebayo", items: "Ile-Omo Cleanser ×1", total: 15500, date: "2026-07-13", status: "Pending" },
  { id: "O-3004", customer: "Blessing Umeh", items: "Agbo Omo Bath Herbs ×1, Lactation Syrup ×1", total: 21500, date: "2026-07-13", status: "Pending" },
];

export const formatNaira = (n: number) => `₦${n.toLocaleString()}`;

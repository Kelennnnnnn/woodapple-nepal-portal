import everest from "@/assets/tour-everest.jpg";
import annapurna from "@/assets/tour-annapurna.jpg";
import kathmandu from "@/assets/tour-kathmandu.jpg";
import chitwan from "@/assets/tour-chitwan.jpg";
import pokhara from "@/assets/tour-pokhara.jpg";
import lumbini from "@/assets/tour-lumbini.jpg";

export type Tour = {
  slug: string;
  title: string;
  region: string;
  duration: string;
  difficulty: string;
  priceUSD: number;
  image: string;
  short: string;
  highlights: string[];
  itinerary: { day: number; title: string; description: string }[];
};

export const tours: Tour[] = [
  {
    slug: "everest-base-camp-trek",
    title: "Everest Base Camp Trek",
    region: "Khumbu, Solukhumbu",
    duration: "14 days",
    difficulty: "Strenuous",
    priceUSD: 1499,
    image: everest,
    short: "Walk in the footsteps of legends to the foot of the world's highest peak.",
    highlights: [
      "Scenic flight to Lukla",
      "Sherpa village of Namche Bazaar",
      "Tengboche Monastery sunrise",
      "Kala Patthar viewpoint (5,545m)",
    ],
    itinerary: [
      { day: 1, title: "Arrive Kathmandu", description: "Airport pickup and welcome briefing at our office in Thamel." },
      { day: 2, title: "Fly to Lukla, trek to Phakding", description: "Morning mountain flight, gentle 3-hour trek to Phakding." },
      { day: 3, title: "Trek to Namche Bazaar", description: "Cross suspension bridges and climb to the Sherpa capital." },
      { day: 4, title: "Acclimatization day", description: "Hike to Everest View Hotel for first glimpse of Everest." },
    ],
  },
  {
    slug: "annapurna-circuit",
    title: "Annapurna Circuit",
    region: "Annapurna Conservation Area",
    duration: "12 days",
    difficulty: "Moderate",
    priceUSD: 1199,
    image: annapurna,
    short: "Cross the legendary Thorong La pass through changing landscapes and cultures.",
    highlights: [
      "Thorong La Pass (5,416m)",
      "Manang village stay",
      "Muktinath sacred temple",
      "Diverse landscapes",
    ],
    itinerary: [
      { day: 1, title: "Drive to Besisahar", description: "Scenic 7-hour drive from Kathmandu." },
      { day: 2, title: "Trek to Chame", description: "Through subtropical forests along the Marsyangdi river." },
    ],
  },
  {
    slug: "kathmandu-valley-heritage",
    title: "Kathmandu Valley Heritage Tour",
    region: "Kathmandu, Patan, Bhaktapur",
    duration: "5 days",
    difficulty: "Easy",
    priceUSD: 549,
    image: kathmandu,
    short: "Seven UNESCO World Heritage sites in one ancient valley.",
    highlights: [
      "Pashupatinath Temple",
      "Boudhanath Stupa",
      "Bhaktapur Durbar Square",
      "Patan craft workshops",
    ],
    itinerary: [
      { day: 1, title: "Old Kathmandu walk", description: "Explore Durbar Square and the back alleys of Thamel." },
      { day: 2, title: "Patan & Bhaktapur", description: "Full day in the two royal cities." },
    ],
  },
  {
    slug: "chitwan-jungle-safari",
    title: "Chitwan Jungle Safari",
    region: "Chitwan National Park",
    duration: "4 days",
    difficulty: "Easy",
    priceUSD: 449,
    image: chitwan,
    short: "Track one-horned rhinos and Bengal tigers in the lowland jungle.",
    highlights: [
      "Jeep safari",
      "Canoe ride on Rapti river",
      "Tharu cultural evening",
      "Elephant breeding centre visit",
    ],
    itinerary: [
      { day: 1, title: "Drive to Sauraha", description: "Arrival, sunset by the river." },
      { day: 2, title: "Full-day safari", description: "Jeep safari deep into the national park." },
    ],
  },
  {
    slug: "pokhara-lakeside-retreat",
    title: "Pokhara Lakeside Retreat",
    region: "Pokhara",
    duration: "5 days",
    difficulty: "Easy",
    priceUSD: 629,
    image: pokhara,
    short: "Mirror-still lakes, sunrise over Machapuchare and gentle valley hikes.",
    highlights: [
      "Sarangkot sunrise",
      "Phewa Lake boating",
      "Peace Pagoda hike",
      "Paragliding option",
    ],
    itinerary: [
      { day: 1, title: "Fly to Pokhara", description: "25-minute mountain flight, lakeside afternoon." },
      { day: 2, title: "Sarangkot & Phewa", description: "Pre-dawn drive, lake boating later." },
    ],
  },
  {
    slug: "lumbini-spiritual-journey",
    title: "Lumbini Spiritual Journey",
    region: "Lumbini",
    duration: "3 days",
    difficulty: "Easy",
    priceUSD: 389,
    image: lumbini,
    short: "Walk the sacred grounds where Buddha was born.",
    highlights: [
      "Maya Devi Temple",
      "International monastic zone",
      "Ashoka Pillar",
      "Meditation sessions",
    ],
    itinerary: [
      { day: 1, title: "Fly to Bhairahawa", description: "Transfer to Lumbini, evening monastery visit." },
      { day: 2, title: "Sacred garden walk", description: "Full day exploring temples from around the world." },
    ],
  },
];

export const getTour = (slug: string) => tours.find((t) => t.slug === slug);

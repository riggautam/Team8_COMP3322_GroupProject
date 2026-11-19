import InfoPage from './InfoPage.jsx'

// Every outside service, library, image and borrowed piece of code. The course requires
// anything taken from online sources to be cited here, so add to it whenever that happens.
const SECTIONS = [
  {
    heading: "Services",
    paragraphs: [
      "Google Maps JavaScript API: the campus map, its markers and the 3D view.",
      "Google Routes API: walking directions on the map page.",
      "Sign in with Google (Google Identity, OAuth 2.0): logging in with a Google account.",
      "OpenRouter, with the NVIDIA Nemotron 3 Ultra model (nvidia/nemotron-3-ultra-550b-a55b:free): suggestions for matching courses.",
      "Open-Meteo: the weather on the dashboard. Weather data by Open-Meteo.com, licensed under CC BY 4.0.",
      "Hosting: a server provided by the HKU Department of Computer Science for COMP3322.",
    ],
  },
  {
    heading: "Libraries",
    paragraphs: [
      "Frontend: React and React DOM, React Router, and Vite with @vitejs/plugin-react (all MIT License).",
      "Backend: Node.js and Express, with express-session, express-mysql-session, express-rate-limit and mysql2 (all MIT License), bcryptjs (BSD-3-Clause License), and nodemon during development (MIT License).",
      "Database and deployment: MySQL, Docker, Docker Compose and Nginx.",
    ],
  },
  {
    heading: "Images and icons",
    paragraphs: [
      "The WEST logo and the city skyline drawings were made by the WEST team.",
      "The university logos (HKU, Queen's University, Simon Fraser University, UNSW Sydney, The University of Queensland and Western University) belong to their universities and are used only to show which university is which.",
      "The small line icons were / adapted from Feather Icons (MIT License) / Lucide (ISC License).",
      "Map images © Google.",
    ],
  },
  {
    heading: "Code adapted from online sources",
    paragraphs: [
      "The distance and direction (bearing) calculations on the map use the standard haversine and initial-bearing formulas, as explained in Chris Veness's \"Calculate distance, bearing and more between Latitude/Longitude points\" (Movable Type Scripts, MIT License).",
      "Loading Google Maps, the map markers and walking directions follow examples in the Google Maps Platform documentation. Google sign-in follows Google's \"Using OAuth 2.0 for Web Server Applications\" guide. Rate limiting follows the express-rate-limit documentation.",
      "Some code and text were drafted with help from AI assistants (Google's Gemmini, DeepSeek and Kimi) and then reviewed, tested and committed by team members, in line with the course's rules on AI use.",
    ],
  },
]

function CreditsPage() {
  return (
    <InfoPage
      title="Credits"
      description="The services, libraries and resources WEST is built with."
      updated="19 November 2026"
      sections={SECTIONS}
    />
  )
}

export default CreditsPage

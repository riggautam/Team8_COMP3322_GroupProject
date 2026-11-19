import InfoPage from './InfoPage.jsx'

const SECTIONS = [
  {
    heading: "Who we are",
    paragraphs: [
      "WEST (Website for Exchange Students Today) is a student project built by five HKU students (Team 8) for the course COMP3322 Modern Technologies on World Wide Web. It is not an official service of the University of Hong Kong.",
      "This policy explains what WEST stores about you, why, and which outside services see any of it. We only collect what the features need.",
    ],
  },
  {
    heading: "What we collect",
    paragraphs: [
      "Your account: your email address, the display name you choose, and either a scrambled (hashed) copy of your password or, if you sign in with Google, your Google account ID. We never see your Google password. We also store whether you are an admin and when you agreed to our terms.",
      "What you create: blog posts, comments and votes; events you add or save; your arrival checklist; and your study plan (course codes, credits, links and status). Reports you send are stored with your account, the reason and any details you write. Posts and comments written without an account are not linked to anyone.",
      "Your location: on the map page your browser asks before sharing your location. It is used on your device to show where you are and to follow your route. It reaches our server only when you press Walk there from My location, so Google can plan the route, and it is never saved.",
    ],
  },
  {
    heading: "How we use it",
    paragraphs: [
      "To run your account and keep you logged in, to show your own checklist, study plan and saved events, and to show your display name next to what you post.",
      "To keep WEST safe: logins, sign-ups, posts, reports, route requests and course lookups are limited per account or per internet address. Those counts are kept only in the server's memory and are cleared within an hour.",
      "We do not sell your data, show ads, or use analytics or tracking tools.",
    ],
  },
  {
    heading: "Cookies",
    paragraphs: [
      "WEST uses one cookie, west.sid, and only once you log in. It holds a random session ID that tells our server who you are; the session itself is stored in our database. Page scripts can't read it, browsers don't send it with requests that other websites make to WEST in the background, and it expires after 7 days or when you log out.",
      "There are no advertising or tracking cookies. The map on the map page is loaded from Google, which may use its own browser storage as described in Google's privacy policy.",
    ],
  },
  {
    heading: "Services we share data with",
    paragraphs: [
      "Google Maps: the map page loads Google's map in your browser, so Google sees your internet address and the part of the map you look at. To plan a walking route, our server sends Google's Routes API the starting point (your location or the place you typed) and the destination.",
      "Google sign-in: if you choose Continue with Google, Google shares your basic profile (email address, name, Google account ID and profile picture link). We keep only your email address, name and Google account ID.",
      "OpenRouter: when you look for matching courses, our server sends the course details and the two universities to an AI model through OpenRouter (currently NVIDIA Nemotron). Your name and email are not sent. Free AI models may keep the requests they receive, so don't put personal information in course details.",
      "Course websites: when you paste a course link, our server visits that page to read the course information.",
      "Open-Meteo: our server asks Open-Meteo for the weather in Hong Kong. Nothing about you is sent.",
    ],
  },
  {
    heading: "Who can see what",
    paragraphs: [
      "Blog posts, comments and events are public: anyone can read them, with the display name of the person who posted them (or Anonymous, or WEST for our sample events). Vote totals are public; who voted is not shown.",
      "Your checklist, study plan, saved events and reports are private to you. Admins can see reported and hidden content and who posted it, so they can moderate it. Team members who run the server can access the database.",
    ],
  },
  {
    heading: "Keeping and deleting your data",
    paragraphs: [
      "You can delete your own posts, comments, events, checklist items and study plan entries at any time.",
      "To delete your whole account, email us from the address on the account (see Contact). This removes your account, checklist, study plan, votes, saved events and reports. Your posts and comments stay but show as Anonymous, and your events show as added by WEST; tell us if you want those removed too.",
      "The web server keeps standard access logs (internet address, page requested and time) to help us find problems. When the course ends, the server and everything in its database may be deleted.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      "Questions about your data, or want it deleted? Email csenq@hku.hk or speak to any member of Team 8.",
    ],
  },
]

function PrivacyPage() {
  return (
    <InfoPage
      title="Privacy Policy"
      description="What WEST stores about you, why, and who else sees it."
      updated="19 November 2026"
      sections={SECTIONS}
    />
  )
}

export default PrivacyPage

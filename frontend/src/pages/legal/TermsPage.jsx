import InfoPage from './InfoPage.jsx'

const SECTIONS = [
  {
    heading: "Using WEST",
    paragraphs: [
      "WEST is a free student project for HKU exchange students, made for the course COMP3322. It is not an official HKU service, and nothing on it is official university advice.",
      "By creating an account or posting on WEST, you agree to these terms and to our Privacy Policy. If you don't agree, please don't use WEST.",
    ],
  },
  {
    heading: "Your account",
    paragraphs: [
      "Use a real email address and keep your password to yourself; passwords need at least 8 characters. You are responsible for what happens on your account.",
      "If you sign in with Google using the same email as an existing WEST account, the two are joined and the old password is removed, so from then on you sign in with Google.",
      "We may suspend or delete accounts that break these terms.",
    ],
  },
  {
    heading: "What you post",
    paragraphs: [
      "Anyone can read blog posts, comments and events, even without an account. Don't post anything you wouldn't want other students to see.",
      "Don't post spam or advertising, offensive or abusive content, other people's personal information, false or misleading information, or anything illegal or that you don't have the right to share. Events must be real and their details accurate.",
      "You keep ownership of what you post and allow WEST to show it on the site. You can edit or delete your own posts and events, and delete your own comments.",
      "Without an account you can post up to 5 posts and comments an hour. With an account you can add up to 10 events an hour.",
    ],
  },
  {
    heading: "Reports and moderation",
    paragraphs: [
      "If something breaks these rules, use its Report link. You need to be logged in, and each person can report an item once.",
      "When three different people report the same item, it is hidden automatically until an admin reviews it. Admins can keep, hide, restore or delete reported content, and can remove anything that breaks these terms without warning.",
    ],
  },
  {
    heading: "Course matches are suggestions",
    paragraphs: [
      "Course matches and match percentages are rough estimates made by an AI model from the information you give it. They are not official equivalencies and may be wrong.",
      "Always confirm credit transfers with your home university and HKU before you rely on them. The approved, pending and rejected statuses in your study plan are only notes for yourself.",
    ],
  },
  {
    heading: "Maps, events and other information",
    paragraphs: [
      "Walking directions come from Google and may not know about stairs, lifts, building entrances or closures. Use your own judgement and stay safe while walking.",
      "Events are posted by students. WEST does not organise or check them, so confirm the details with the organiser before you go.",
    ],
  },
  {
    heading: "No warranty",
    paragraphs: [
      "WEST is provided as it is, as a student project. It may be unavailable, change or lose data at any time, and we can't promise that anything on it is correct or complete.",
      "As far as the law allows, the WEST team is not responsible for any loss or harm that comes from using WEST or relying on what it shows.",
    ],
  },
  {
    heading: "Changes to these terms",
    paragraphs: [
      "We may update these terms. The date at the top shows when they last changed. If you keep using WEST after a change, you accept the new terms.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: ["Questions about these terms? Email csenq@hku.hk."],
  },
]

function TermsPage() {
  return (
    <InfoPage
      title="Terms & Conditions"
      description="The rules for using WEST."
      updated="19 November 2026"
      sections={SECTIONS}
    />
  )
}

export default TermsPage

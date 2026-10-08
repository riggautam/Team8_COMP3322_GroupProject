# COMP3322 Project Proposal

## Member Information

Owen Haoran Wang - 3036718354
Nick Ze Kun Lei - 3036710912
Jianing Qiu - 3036719956
Rig Ved Gautam - 3036711411
Alyssa Izabelle Spasic - 3036716796

## Project Title:

**WEST: Website for Exchange Students Today**

## Project Description:

Our web application is called WEST (Website for Exchange Students Today). WEST is a dedicated platform designed specifically to help exchange students at the University of Hong Kong (HKU) make the most of their study abroad experience. Moving to a new city and navigating a foreign university system can be stressful, with challenges such as credit transfer and course mapping, discovering campus events, and exploring Hong Kong. WEST acts as a central hub to help exchange students with this transition, with features such as simplified course equivalency planning, displaying daily events, student blog posting, and interactive maps to guide campus navigation and locate food spots on or near campus. Every feature is built to solve everyday student challenges, foster community engagement, and help students have a smooth exchange experience.

## Feature List:
- **Frontend:** React 19 single-page app in JavaScript, built with Vite, with React Router for navigation between pages. Styling: plain CSS [**GOIS FEEL FREE TO USE A UI LIBRARY HERE**].
- **Backend:** Node.js with Express 5, exposing a RESTful API under `/api`.
- **Database:** MySQL, queried from Express with the `mysql2` driver; schema and seed data kept in `.sql` files.
- **Authentication:** email and password checked against the users table in MySQL, with password hashing (bcrypt); Google sign-in with OAuth 2.0 as a nice-to-have.
- **Deployment:** Docker Compose on the Linux virtual machine provided by HKU ITS, running containers.
- **Third-party services:** Google Maps JavaScript API for the food map (and the classroom search nice-to-have).
- **Tools:** Git and GitHub.

### Must-have
- **Accounts**: sign up and log in with email and password; required to post blogs, add events and write reviews.
- **Course mapping**: search HKU course equivalents by home university and course; students submit mappings and track each one's approval status (pending, approved or rejected); save courses to a personal study plan. Students can also list their own transferable credits and flag mappings that are still pending.
- **Events**: today's and upcoming events on the landing page, with a category filter and a detail view; logged-in users can add events.
- **Food map**: a Google Map of food spots on or near campus, with filters (e.g. cuisine, price, student deals) and details (opening hours, directions, student reviews); logged-in users can review spots.
- **Blog**: anyone can browse and read posts; logged-in users can create, edit and delete their own posts.

### Nice-to-have
- **Classroom search**: an HKU campus map built on top of the Google Maps API that guides students to their classrooms.
- **Google sign-in (OAuth 2.0)**: log in with a Google account instead of email and password.
- **Dashboard**: a personal page alongside the events page where logged-in users see the events they have saved, their study plan and their own posts.

## Full Technology Stack:

## Team Task Allocation:
Owen Haoran Wang - Food/building/hall map; classroom search (nice-to-have).
Nick Ze Kun Lei - Project setup and Docker deployment; course mapping. 
Jianing Qiu - Events; dashboard (nice-to-have).
Rig Ved Gautam - Database schema; accounts; Google sign-in (nice-to-have). 
Alyssa Izabelle Spasic: Landing page and overall UI design; blog.

## Problem & Target User Context: 

Exchange students at HKU often struggle because the information they need is scattered across many websites and group chats: upcoming and ongoing campus events, food options on or near campus (including student deals), and other students' reviews and experiences. As exchange students ourselves we saw this real struggle in navigating HK and HKU life at the beginning of semester. Course planning is also difficult. When students cannot get into a class, they have to search through course lists again for a replacement that their home university will accept, and there is no central place to keep track of this. WEST targets exchange students who want all of this in one convenient place. A web application suits them because they can open it instantly on any device without installing anything, which matters for students who are only in Hong Kong for a semester or two. Official HKU websites cover parts of this information, but none combine course planning, campus events, food recommendations and student community tools in a single, user-friendly platform. 

## High-Level Workflow Description:
When users visit WEST, they arrive on the landing page, which lists today's and upcoming events on and around campus. Anyone can browse events, filter them by category, or open an event to see its details. To post anything, users sign up with an email and password or log in. Logged-in users can also add new events.

On the Course Mapping page, students search by home university or course to see which HKU courses map to their home courses and the approval status of each mapping. They can submit their own mappings, update a mapping's status when their home university replies, and save courses to their study plan.

On the Food Map page, users see food spots on or near campus on a Google Map and can filter them, for example by cuisine, price or student deals. Selecting a spot shows its opening hours, directions and reviews from other students, and logged-in users can add their own review. (Nice-to-have: students will also be able to search for a classroom on the map and get directions to it.)

On the Blog page, anyone can read posts. Logged-in users can publish posts, such as introductions, practical living tips or questions for other students, and edit or delete their own posts.

## Anticipated Learning Challenges:

Although our group is made up entirely of third-year computer science exchange students, our experience with web development varies, and most of us have not used React or similar frameworks before. We have a foundation in programming, but applying it to a full web application will involve learning as we go. We expect the main challenges to be integrating external services and getting the different parts of our application to work together.

For our campus navigation and food map features, we will need to learn how to use the Google Maps API to display locations from our database. As we have limited experience with third-party APIs, our plan is to start by watching tutorials, reading official Google Maps documentation together, and building a small test prototype to get comfortable integrating it into the main project.

Connecting the frontend and backend will also take some practice, particularly when handling API calls, waiting for responses, and updating what users see on the page. We plan to build one simple feature first, where a React page retrieves and displays data from MySQL through an Express endpoint. Getting this working early will give us a shared example to build on and help us identify integration issues as we develop the remaining features.


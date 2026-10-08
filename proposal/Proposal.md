# COMP3322 Project Proposal

## Member Information

- Owen Haoran Wang - 3036718354
- Nick Ze Kun Lei - 3036710912
- Jianing Qiu - 3036719956
- Rig Ved Gautam - 3036711411
- Alyssa Izabelle Spasic - 3036716796

## Project Title:

**WEST: Website for Exchange Students Today**

## Project Description:

Our web application is called WEST (Website for Exchange Students Today). WEST is a dedicated platform designed specifically to help exchange students at the University of Hong Kong (HKU) make the most of their study abroad experience. Moving to a new city and navigating a foreign university system can be stressful, with challenges such as credit transfer and course mapping, discovering campus events, and exploring Hong Kong. WEST acts as a central hub to help exchange students with this transition, with features such as simplified course equivalency planning, displaying daily events, student blog posting, and an interactive map with walking directions to classrooms around campus. Every feature is built to solve everyday student challenges, foster community engagement, and help students have a smooth exchange experience.

## Feature List:

### Must-have
- **Accounts**: sign up and log in with email and password; required to post blogs, add events and write reviews.
- **Course mapping**: choose your home university, paste the links to an HKU course and a home course, and the app fetches both course descriptions and suggests the closest matching courses with a match percentage; save matches to a personal study plan with a running total of transferable credits.
- **Dashboard with events**: the home page shows today's and upcoming events (category filter, detail view; logged-in users can add events) alongside course mapping progress, latest blog posts and an arrival checklist.
- **Classroom direction map**: a map built on top of the Google Maps API that gives students live walking directions from where they are to any HKU building.
- **Blog**: anyone can browse and read posts; logged-in users can create, edit and delete their own posts.

### Nice-to-have
- **Food Direction Map**: Google Map API overlay of food spots on or near campus, with filters (e.g. cuisine, price, student deals) and details (opening hours, directions, student reviews); logged-in users can review spots and leave markers.
- **Google sign-in (OAuth 2.0)**: log in with a Google account instead of email and password.
- **3D map view**: a tilted 3D view that follows the walking route for food or campus classes.
- **Saved events**: bookmark events and see them on the dashboard.


## Full Technology Stack:
- **Frontend:** React 19 single-page app in JavaScript, built with Vite, with React Router for navigation between pages. Styling: plain CSS.
- **Backend:** Node.js with Express 5, exposing a RESTful API under `/api`.
- **Database:** MySQL, queried from Express with the `mysql2` driver; schema and seed data kept in `.sql` files.
- **Authentication:** email and password checked against the users table in MySQL, with password hashing (bcrypt); Google sign-in with OAuth 2.0 as a nice-to-have.
- **Deployment:** Docker Compose on the Linux virtual machine provided by HKU ITS, running containers.
- **Third-party services:** Google Maps JavaScript API (campus and food maps), Google Routes API (walking directions, called from the backend), and OpenRouter (an AI model that suggests matching courses, called from the backend).
- **Tools:** Git and GitHub.


## Team Task Allocation
- **Owen Haoran Wang**: classroom direction map (Google Maps, walking directions); 3D map view and food map (nice-to-have).
- **Nick Ze Kun Lei**: project setup and Docker development environment; course mapping (course page fetching, matching suggestions, study plan).
- **Jianing Qiu**: dashboard home page and events; shared UI components and colour tokens; saved events (nice-to-have).
- **Rig Ved Gautam**: database schema and MySQL setup; accounts and login; deployment; Google sign-in (nice-to-have).
- **Alyssa Izabelle Spasic**: blog (browse, search, create, edit and delete posts); overall UI design consistency.

## Problem & Target User Context: 

Exchange students at HKU often struggle because the information they need is scattered across many websites and group chats: upcoming and ongoing campus events, food options on or near campus (including student deals), and other students’ tips and experiences. Moroever, navigating the new campus is also difficult, HKU’s buildings are spread across far with many lifts and escalators, and new students often get lost on the way to class. Course planning is also difficult. Students must take HKU courses that their home university will accept, and when they cannot get into a class they have to search through course lists again and compare descriptions by hand to find an equivalent replacement, with no central place to keep track of it. As exchange students ourselves, we experienced these problems first-hand at the start of the semester. WEST targets exchange students who want all of this in one convenient place. A web application suits them because they can open it instantly on any device without installing anything, which matters for students who are only in Hong Kong for a semester or two. Official HKU websites cover parts of this information, but none combine course planning, campus navigation, events and student community tools in a single, user-friendly platform.

## High-Level Workflow Description:
When users first open WEST, they are taken to the home dashboard, where they can see today's events and what's coming up on campus. Events can be filtered by category and opened for more information. The dashboard also gives students a quick overview of their course mapping progress, recent blog posts, nearby food options and an arrival checklist. From the navigation bar, users can access the Blog, Map and Transfer Credits pages or log in to their account.

To save information or create posts, users will need to log in or create an account using their name, email and password. After logging in, they are taken back to the dashboard, where their name appears in the navigation bar alongside the option to log out. They can also create and share new campus events.

On the Transfer Credits page, students first select their home university and HKU from the dropdown menus. They can then paste links to the course descriptions from both universities. WEST retrieves the course information, which students can check and edit if needed, before suggesting similar courses with a percentage showing how closely they match. Students can save suitable matches to their study plan and keep track of how many credits they may be able to transfer.

The Map page helps students find their way around HKU. After allowing location access, they can search for a building or choose from suggested destinations, such as the Main Building. Selecting Walk there displays a walking route from their current location, along with the estimated distance, travel time and directions that update as they move. If time permits, we also hope to show a way students can also switch to a tilted 3D view to follow the route more easily. Also implementing a social food spots on the map, with options to filter locations and read reviews from other students.

Finally, the Blog page allows anyone to read posts shared by other students. A featured post appears at the top, while the remaining posts can be browsed by category or searched using keywords. Students who are logged in can also write their own posts, whether to introduce themselves, share advice about living in Hong Kong or ask questions. They can return to edit or delete their posts whenever needed.

## Anticipated Learning Challenges:

Although our group is made up entirely of third-year computer science exchange students, our experience with web development varies, and most of us have not used React or similar frameworks before. We have a foundation in programming, but applying it to a full web application will involve learning as we go. We expect the main challenges to be integrating external services and getting the different parts of our application to work together.

For our campus navigation and food map features, we will need to learn how to use the Google Maps API to display locations from our database. As we have limited experience with third-party APIs, our plan is to start by watching tutorials, reading official Google Maps documentation together, and building a small test prototype to get comfortable integrating it into the main project.

Connecting the frontend and backend will also take some practice, particularly when handling API calls, waiting for responses, and updating what users see on the page. We plan to build one simple feature first, where a React page retrieves and displays data from MySQL through an Express endpoint. Getting this working early will give us a shared example to build on and help us identify integration issues as we develop the remaining features.


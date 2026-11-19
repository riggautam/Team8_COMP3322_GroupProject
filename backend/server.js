const express = require('express')
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session)
const pool = require('./db')
const ensureAdminAccount = require('./setupAdmin')
const writeLimiter = require('./middleware/writeLimiter')
const app = express()
app.set('trust proxy', 1)
// Don't announce "X-Powered-By: Express" on every response; it only helps attackers.
app.disable('x-powered-by')
const PORT = process.env.PORT || 5000

const EXAMPLE_SESSION_SECRET = 'replace-with-a-long-random-string' // the placeholder in .env.example
const MIN_SESSION_SECRET_LENGTH = 32

// The secret signs the session cookie, so it must be long, random and private: never missing,
// short, or the value everyone can read in .env.example. Checked before the server starts.
function checkSessionSecret() {
  const secret = process.env.SESSION_SECRET || ''
  if (secret.length < MIN_SESSION_SECRET_LENGTH || secret === EXAMPLE_SESSION_SECRET) {
    throw new Error(
      `Set SESSION_SECRET in .env to a random string of at least ${MIN_SESSION_SECRET_LENGTH} characters (for example from: openssl rand -hex 32).`,
    )
  }
}

const dashboardRouter = require('./routes/dashboard/dashboard')
const checklistRouter = require('./routes/dashboard/checklist')
const courseMappingsRouter = require('./routes/dashboard/courseMappings')
const eventsRouter = require('./routes/events/events')
const weatherRouter = require('./routes/weather/weather')
const authRouter = require('./routes/auth/auth')
const directionsRouter = require('./routes/directions/directions')
const coursePageRouter = require('./routes/transfer_credit/coursePage')
const matchingCoursesRouter = require('./routes/transfer_credit/matchingCourses')
const blogPostsRouter = require('./routes/blog/blogPosts')
const reportsRouter = require('./routes/reports/reports')
const adminRouter = require('./routes/admin/admin')

app.use(express.json())
// Keeps each login in the MySQL sessions table. The browser only holds a signed id in a cookie.
app.use(
  session({
    name: 'west.sid',
    secret: process.env.SESSION_SECRET,
    store: new MySQLStore({}, pool),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // page scripts cannot read the cookie
      sameSite: 'lax', // other sites cannot send it on POST requests
      // Only sent over HTTPS when the site is on HTTPS. 'auto' asks Express whether this request
      // came in over HTTPS (Nginx says so in X-Forwarded-Proto, trusted through 'trust proxy'),
      // so the same code works on plain HTTP locally and on HTTPS on the server.
      secure: 'auto',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, in milliseconds
    },
  }),
)

// After the session, so it can count per account. See middleware/writeLimiter.js.
app.use('/api', writeLimiter)

app.use('/api/dashboard', dashboardRouter)
app.use('/api/checklist', checklistRouter)
app.use('/api/course-mappings', courseMappingsRouter)
app.use('/api/events', eventsRouter)
app.use('/api/weather', weatherRouter)
app.use('/api/auth', authRouter)
app.use('/api/directions', directionsRouter)
app.use('/api/course-page', coursePageRouter)
app.use('/api/matching-courses', matchingCoursesRouter)
app.use('/api/blog-posts', blogPostsRouter)
app.use('/api/reports', reportsRouter)
app.use('/api/admin', adminRouter)

// Any /api path that no route above matched.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found.' })
})

// Errors with their own status, such as malformed JSON (400), keep it. The rest are 500s,
// and their details stay in the server log.
app.use((err, req, res, next) => {
  const status = err.status || 500
  if (status >= 500) console.error(err)
  res.status(status).json({ error: status < 500 ? err.message : 'Internal server error' })
})
// Check the settings and create the admin account from .env before taking requests. Without a
// good SESSION_SECRET, ADMIN_EMAIL and ADMIN_PASSWORD the server stops here, so a deployment
// can't run with an example secret or no admin.
Promise.resolve()
  .then(checkSessionSecret)
  .then(ensureAdminAccount)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error(`Could not start: ${err.message}`)
    process.exit(1)
  })

const express = require('express')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 5000

const dashboardRouter = require('./routes/dashboard/dashboard')
const eventsRouter = require('./routes/events/events')
const authRouter = require('./routes/auth/auth')
const directionsRouter = require('./routes/directions/directions')
const coursePageRouter = require('./routes/transfer_credit/coursePage')
const matchingCoursesRouter = require('./routes/transfer_credit/matchingCourses')

app.use(cors())
app.use(express.json())

app.use('/api/dashboard', dashboardRouter)
app.use('/api/events', eventsRouter)
app.use('/api/auth', authRouter)
app.use('/api/directions', directionsRouter)
app.use('/api/course-page', coursePageRouter)
app.use('/api/matching-courses', matchingCoursesRouter)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
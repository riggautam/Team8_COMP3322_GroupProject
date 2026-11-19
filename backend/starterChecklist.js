const pool = require('./db')

// Every new account starts with these. Students can tick, remove or add to them.
// Used by sign-up, Google sign-in and the admin account created from .env.
const STARTER_CHECKLIST = [
  'Collect student visa / HKID',
  'Get an Octopus card',
  'Open a local bank account',
  'Register for courses',
  'Submit course mapping for approval',
  'Take a campus tour',
]

// Gives a new account the starter checklist. VALUES ? with nested arrays inserts one row per item.
function addStarterChecklist(userId) {
  return pool.query('INSERT INTO checklist_items (user_id, label) VALUES ?', [
    STARTER_CHECKLIST.map((label) => [userId, label]),
  ])
}

module.exports = addStarterChecklist

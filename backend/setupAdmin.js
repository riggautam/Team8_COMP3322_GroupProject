const bcrypt = require('bcryptjs')
const pool = require('./db')
const addStarterChecklist = require('./starterChecklist')

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8
const EXAMPLE_PASSWORD = 'change-me-to-a-long-password' // the placeholder in .env.example

// Makes sure the admin account from .env exists, so a brand-new server has an admin straight
// away, and nobody else can sign up with that email first (sign-up gives 409 for it).
// - No account with ADMIN_EMAIL yet: create it, with ADMIN_PASSWORD hashed, as an admin,
//   with the same starter checklist as any new student account.
// - The account already exists: make sure it is an admin. Its password is left alone.
// Throws if the settings are missing or still the example, and server.js then refuses to start.
async function ensureAdminAccount() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD || ''

  if (!EMAIL_PATTERN.test(email)) {
    throw new Error('Set ADMIN_EMAIL in .env to the admin account\'s email (see .env.example).')
  }
  if (password.length < MIN_PASSWORD_LENGTH || password === EXAMPLE_PASSWORD) {
    throw new Error(
      `Set ADMIN_PASSWORD in .env to your own password of at least ${MIN_PASSWORD_LENGTH} characters.`,
    )
  }

  const [rows] = await pool.query('SELECT id, role FROM users WHERE email = ?', [email])
  if (rows[0]) {
    if (rows[0].role !== 'admin') {
      await pool.query("UPDATE users SET role = 'admin' WHERE id = ?", [rows[0].id])
      console.log(`Made ${email} an admin.`)
    }
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const [result] = await pool.query(
    "INSERT INTO users (email, password, display_name, role, terms_accepted_at) VALUES (?, ?, 'Admin', 'admin', NOW())",
    [email, passwordHash],
  )
  await addStarterChecklist(result.insertId)
  console.log(`Created the admin account ${email}.`)
}

module.exports = ensureAdminAccount

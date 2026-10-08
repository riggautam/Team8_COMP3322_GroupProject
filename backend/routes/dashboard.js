const express = require('express')
const dashboard = require('../data/dashboard')

const router = express.Router()

router.get('/', (req, res) => {
  res.json(dashboard)
})

module.exports = router

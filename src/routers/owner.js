const express = require('express')
const router = express.Router()
const ownerService = require('../services/algolia/owner')

router.put('/owner', ownerService.insertOwner)
router.post('/owner', ownerService.findOwnerByCity)
router.delete('/owner', ownerService.deleteOwnerById)

module.exports = router
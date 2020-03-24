const express = require('express');
const router = express.Router();
const houseService = require('../services/user/house');
const auth = require('../middleware/auth');

router.post('/createhouse', auth, houseService.createHouse);
router.post('/gethouse', auth, houseService.getHouse);
router.post('/edithouse', auth, houseService.editHouse);
router.post('/deletehouse', auth, houseService.deleteHouse);

module.exports = router;
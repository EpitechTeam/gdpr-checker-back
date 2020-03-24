const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const userService = require('../services/user/user');
const missionService = require('../services/user/mission');
const statsService = require('../services/user/stats');


router.post('/getusers', userService.getUsers);

router.post('/register', userService.createUser);

router.post('/login', userService.login);

router.post('/me', auth, userService.me);

router.post('/edit', auth, userService.edit);

router.post('/logout', auth, userService.logout);

router.post('/logoutAll', auth, userService.logoutall);

router.post('/modifyEmail', auth, userService.modifyEmail);

router.post('/modifyPhone', auth, userService.modifyPhone);

router.get('/user/:_id', userService.getUser);

router.post('/createmission', auth, missionService.createMission);

router.post('/getmission', auth, missionService.getMission);

router.post('/getstats', auth, statsService.getStats);

router.post('/getca', auth, statsService.getCa);

router.post('/forgot', userService.forgot);

router.post('/reset', userService.reset);

router.post('/validEmail', userService.validEmail)

router.post('/sendEmailVerification', auth, userService.sendEmailVerification)

router.post('/changeDisponibilite', auth, userService.changeDisponibilite)

router.post('/modifyPassword', auth, userService.modifyPassword);

module.exports = router;


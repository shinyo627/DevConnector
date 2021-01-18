const express = require('express');
const router = express.Router();

// @route       Get api/posts
// @desc        Posts route
// @access      Private
router.get('/', (req, res) => res.send('Posts route'));

module.exports = router;

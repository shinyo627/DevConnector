const express = require('express');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const router = express.Router();

const User = require('../../models/User');

// @route       Get api/auth
// @desc        Auth route
// @access      Private
router.get('/', auth, async (req, res) => {
  try {
    // req.user.id exists because of auth middleware that assigns the payload user object to request object after jwt.verification
    //   select('-password') is for not returning password
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route       POST api/auth
// @desc        Authenticate user & gives token
// @access      Public
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please is required').exists(),
  ],
  async (req, res) => {
    // Error messages from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // See if user exists
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: `Invalid credentials` }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: `Invalid credentials` }] });
      }

      // Return new jsonwebtoken
      const payload = {
        user: {
          //   user.id that I'm assigning inside payload user object id: is actually ObjectId from mongoDB instead of _id. Mongoose allows this.
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          // Instead of the token I can also assign user.id directly as json if I needed to. But in this case, it's going to be token
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;

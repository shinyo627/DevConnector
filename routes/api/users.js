const express = require('express');
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
// Normalize to give me proper url, this will fix issue with gravatar's avatar
const normalize = require('normalize-url');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const router = express.Router();

const User = require('../../models/User');

// @route       POST api/users
// @desc        Register a user
// @access      Public
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    // Error messages from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // See if user exists
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }
      // Get users gravatar before saving the user
      // gravatar.url() is wrapped in normalize function to fix initial issue with returning proper value source
      const avatar = normalize(
        gravatar.url(email, {
          // s is for default size, r is for rating, d: mm is default image
          s: '200',
          r: 'pg',
          d: 'mm',
        }),
        { forceHttps: true }
      );

      user = new User({
        name,
        email,
        avatar,
        password,
      });

      // Encrypt password then, save the new user document
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // Return jsonwebtoken - for users to login right away after register
      const payload = {
        user: {
          //   user.id that I'm assigning inside payload user object id: is actually ObjectId from mongoDB instead of _id. Mongoose allows this.
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 60 * 5 },
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

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const axios = require('axios');
const config = require('config');
// Normalize to give me proper url, regardless of what user entered
const normalize = require('normalize-url');

const Profile = require('../../models/Profile');
const Post = require('../../models/Post');
const User = require('../../models/User');

// @route       Get api/profile/me
// @desc        Get current users profile
// @access      Private
router.get('/me', auth, async (req, res) => {
  try {
    //   Passing ObjectId of each users to match user field
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res
        .status(400)
        .json({ msg: 'There is no profile for this user.' });
    }

    res.json(profile);
  } catch (err) {
    console.err(err.message);
    res.status(500).send('Server Error');
  }
});

// @route       POST api/profile
// @desc        Create or Update user profile
// @access      Private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required').not().isEmpty(),
      check('skills', 'Skills is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // destructure the request
    const {
      website,
      skills,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
      // spread the rest of the fields we don't need to check
      ...rest
    } = req.body;

    // build a profile
    const profileFields = {
      user: req.user.id,
      website:
        website && website !== ''
          ? normalize(website, { forceHttps: true })
          : '',
      skills: Array.isArray(skills)
        ? skills
        : skills.split(',').map((skill) => ' ' + skill.trim()),
      ...rest,
    };

    // Build socialFields object
    const socialFields = { youtube, twitter, instagram, linkedin, facebook };

    // normalize social fields to ensure valid url
    for (const [key, value] of Object.entries(socialFields)) {
      if (value && value.length > 0)
        socialFields[key] = normalize(value, { forceHttps: true });
    }
    // add to profileFields
    profileFields.social = socialFields;

    // Build social object to assign to profileFields
    // profileFields.social = {};
    // if (youtube) profileFields.social.youtube = youtube;
    // if (twitter) profileFields.social.twitter = twitter;
    // if (facebook) profileFields.social.facebook = facebook;
    // if (linkedin) profileFields.social.linkedin = linkedin;
    // if (instagram) profileFields.social.instagram = instagram;
    try {
      //   Passing ObjectId of each user document to match the user field of which Profile
      let profile = await Profile.findOne({
        user: req.user.id,
      });

      if (profile) {
        // Update the profile formData if user already had a profile
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }

      //   Create if the user doesn't have profile
      profile = new Profile(profileFields);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route       Get api/profile
// @desc        Get all profiles
// @access      Public
router.get('/', async (req, res) => {
  try {
    //   Add [name, avatar] fields of User model
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);

    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route       Get api/profile/user/:user_id
// @desc        Get profile by user ID for public viewing
// @access      Public
router.get('/user/:user_id', async (req, res) => {
  try {
    //   Add [name, avatar] fields of User model
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) return res.status(400).json({ msg: 'Profile not found' });

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    // Giving condition with err.kind object so that  if the profile really doesn't exists we can send more specific respond messages for reason
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route       DELETE api/profile
// @desc        Delete profile, user & posts
// @access      Private
router.delete('/', auth, async (req, res) => {
  try {
    // Remove users posts
    await Post.deleteMany({ user: req.user.id });
    // Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    // Remove user
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route       PUT api/profile/experience
// @desc        Add profile experience
// @access      Private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company name is required').not().isEmpty(),
      check('from', 'From date name is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      // profile.experience field array will have its own ObjectId
      profile.experience.unshift(newExp);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route       DELETE api/profile/experience/:exp_id
// @desc        Delete experience from profile
// @access      Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // Get remove index - to remove one experience item out of the array by getting one experience item's index and splice the one experience object with matching req.params.exp_id out of experience array.
    const removeIndex = profile.experience
      .map((item) => {
        return item.id;
      })
      .indexOf(req.params.exp_id);

    // console.log(
    //   'api/profile/experience/:exp_id, This is removeIndex',
    //   removeIndex
    // );
    // If removeIndex was not found because indexOf() returns -1 when element is not present
    if (removeIndex < 0) {
      return res.status(400).json({ message: 'Experience not found' });
    }

    //   Arr.splice to remove one item(experience) with index
    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route       PUT api/profile/education
// @desc        Add profile education
// @access      Private
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required').not().isEmpty(),
      check('degree', 'Degree is required').not().isEmpty(),
      check('fieldofstudy', 'Field of study is required').not().isEmpty(),
      check('from', 'From date name is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      // profile.education field array will have its own ObjectId
      profile.education.unshift(newEdu);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route       DELETE api/profile/education/:edu_id
// @desc        Delete education from profile
// @access      Private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // Get remove index - to remove one education item out of the array by getting one education item's index and splice the one education object with matching req.params.exp_id out of education array.
    const removeIndex = profile.education
      .map((item) => {
        return item.id;
      })
      .indexOf(req.params.edu_id);

    // If removeIndex was not found because indexOf() returns -1 when element is not present
    if (removeIndex < 0) {
      return res.status(400).json({ message: 'Education not found' });
    }

    //   Arr.splice to remove one item(education) with index
    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route       GET api/profile/github/:username
// @desc        Get user repos from Github
// @access      Public - because viewing repos from profile should be like so
router.get('/github/:username', async (req, res) => {
  try {
    const uri = encodeURI(
      `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
    );
    const headers = {
      'user-agent': 'node.js',
      Authorization: `token ${config.get('githubToken')}`,
    };

    const githubResponse = await axios.get(uri, { headers });
    res.json(githubResponse.data);
  } catch (err) {
    console.error(err.message);
    res.status(404).send('No Github profile found');
  }
});

module.exports = router;

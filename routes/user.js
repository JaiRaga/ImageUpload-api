const express = require('express');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const User = require('../models/User');

const s3 = new aws.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_BUCKET_REGION,
});

const upload = () =>
  multer({
    storage: multerS3({
      s3,
      bucket: 'pic-upload-beta',
      metadata: function (req, file, cb) {
        cb(null, { fileName: file.fieldname });
      },
      key: function (req, file, cb) {
        cb(null, `${uuidv4()}.jpg`);
      },
    }),
  });

router.post('/upload-image', async (req, res) => {
  try {
    console.log('upload-image/', req.file);
    const uploadSingle = upload().single('image-upload');

    uploadSingle(req, res, async (err) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ success: false, message: err.message });
      }
      console.log('uploadSingle', req.file);

      const user = new User({ photoUrl: req.file.location });
      await user.save();

      res.status(200).json({ data: req.file.location });
    });
  } catch (err) {
    console.log('Error****', err);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/register', async (req, res) => {
	const user = new User(req.body)

	try {
		await user.save()
		const token = await user.generateAuthToken()
		res.status(201).send({ user, token })
	} catch (e) {
		res.status(400).send(e)
	}
})

router.post('/login', async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password)
		const token = await user.generateAuthToken()
		res.send({ user, token })
	} catch (e) {
		res.status(400).send('Unable to Login!')
	}
})

module.exports = router;

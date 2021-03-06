const router = require("express").Router();
const models = require("../../models");
const sharp = require("sharp");
const multer = require("multer");
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });
const { v4: uuidv4 } = require("uuid");
const aws = require("aws-sdk");
const s3 = new aws.S3({
  signatureVersion: "v4",
  region: "us-east-1",
});

const S3_BUCKET = "image-upload-storage-minh";

async function uploadToS3(key, buffer, mimetype) {
  return new Promise((resolve, reject) => {
    s3.putObject(
      { Bucket: S3_BUCKET, ContentType: mimetype, Key: key, Body: buffer },
      () => resolve()
    );
  });
}

function getSignedUrl(bucket, key, expires = 3600) {
  return new Promise((resolve, reject) => {
    // Get a pre-signed URL for a given operation name.
    s3.getSignedUrl(
      "getObject",
      {
        Bucket: bucket,
        Key: key,
        Expires: expires,
      },
      function (err, url) {
        if (err) throw new Error(err);

        resolve(url);
      }
    );
  });
}

// generate a signed URL for each image stored in S3.
// These images are not publicly available so we use the AWS SDK to create a pre-authorized URL.
// These URLs will expire after a certain period of time and will no longer be valid.
router.get("/api/uploads", async (req, res) => {
  let uploadList = await models.uploads.findAll({
    include: [
      {
        model: models.images,
        as: "image",
      },
      {
        model: models.images,
        as: "thumbnail",
      },
    ],
  });

  uploadList = await Promise.all(
    uploadList.map(async (upload) => {
      const [imageUrl, thumbnailUrl] = await Promise.all([
        getSignedUrl(upload.image.bucket, upload.image.key),
        getSignedUrl(upload.thumbnail.bucket, upload.thumbnail.key),
      ]);
      return {
        ...upload.toJSON(),
        imageUrl,
        thumbnailUrl,
      };
    })
  );

  res.send(uploadList);
});

// Generate a GUID for image and thumbnail.
// Create a thumbnail image
// Save both images as new entries in the images table
// Create a new entry in the uploads table
router.post("/api/uploads", upload.single("image"), async (req, res) => {
  const id = uuidv4();
  const thumbnailId = uuidv4();
  const thumbnail = await sharp(req.file.buffer).resize(200).toBuffer();

  await Promise.all([
    uploadToS3(`images/${id}`, req.file.buffer, req.file.mimetype),
    uploadToS3(`thumbnails/${thumbnailId}`, thumbnail, req.file.mimetype),
  ]);

  await Promise.all([
    models.images.create({
      id,
      bucket: S3_BUCKET,
      key: `images/${id}`,
    }),
    models.images.create({
      id: thumbnailId,
      bucket: S3_BUCKET,
      key: `thumbnails/${thumbnailId}`,
    }),
  ]);

  await models.uploads.create({
    file_name: req.file.originalname,
    image_id: id,
    thumbnail_id: thumbnailId,
  });

  res.sendStatus(201);
});

module.exports = router;

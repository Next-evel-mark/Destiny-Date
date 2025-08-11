const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload-profile-pic', 
  upload.single('image'), 
  async (req, res) => {
    // Upload to AWS S3
    const s3Upload = await s3.upload({
      Bucket: 'destinydate-profile-pics',
      Key: `${req.user.id}-${Date.now()}.jpg`,
      Body: req.file.buffer,
      ContentType: 'image/jpeg'
    }).promise();

    // Update user record
    await db.query(
      `UPDATE users SET profile_picture_url = $1 WHERE id = $2`,
      [s3Upload.Location, req.user.id]
    );

    res.json({ imageUrl: s3Upload.Location });
});

// Email Verification Route (Node.js/Express)
app.post('/register', async (req, res) => {
  const { email, phone, password } = req.body;
  
  // Generate verification token/code
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const smsCode = Math.floor(100000 + Math.random() * 900000);

  // Save user to DB with verification data
  const user = await db.query(
    `INSERT INTO users (email, phone, password_hash, verification_token, sms_verification_code) 
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [email, phone, hashedPassword, verificationToken, smsCode]
  );

  // Send verification
  if(email) {
    await sendgrid.send({
      to: email,
      templateId: 'verification-template',
      dynamicTemplateData: { verificationLink: `https://destinydate.com/verify-email?token=${verificationToken}` }
    });
  }
  
  if(phone) {
    await twilio.messages.create({
      body: `Your Destiny Date verification code: ${smsCode}`,
      to: phone,
      from: '+1234567890'
    });
  }

  res.status(201).json({ message: 'Verification sent' });
});

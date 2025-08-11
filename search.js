app.get('/search', async (req, res) => {
  const { query } = req.query;
  
  const results = await db.query(
    `SELECT id, username, profile_picture_url 
     FROM users 
     WHERE username ILIKE $1 
     AND email_verified = true 
     LIMIT 10`,
    [`%${query}%`]
  );

  res.json(results.rows);
});

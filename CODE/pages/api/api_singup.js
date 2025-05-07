import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const {
    email,
    password,
    name,
    gender,
    birthdate,
    sktid,
    skincareGoals,
    preferencesConcerns,
    allergicIngredients,
    favouriteBrands
  } = req.body;

  console.log("📥 Received signup:", req.body);

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Check duplicate email
    const [existingUsers] = await connection.execute(
      "SELECT email FROM account_skin WHERE email = ?",
      [email]
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    // Insert new user
    await connection.execute(
      `INSERT INTO account_skin (accName, email, pwd, gender, dob, sktid, accRoles)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, password, gender, birthdate, sktid || null, "Member"]
    );

    const [user] = await connection.execute(
      "SELECT acc_id FROM account_skin WHERE email = ?",
      [email]
    );
    const acc_id = user[0].acc_id;

    // Insert into UserConcern: skincare goals
    if (Array.isArray(skincareGoals)) {
      const values = skincareGoals.filter(Boolean).map(goal => [acc_id, goal]);
      if (values.length) {
        await connection.query("INSERT INTO UserConcern (accid, benefitid) VALUES ?", [values]);
      }
    }

    // Insert into UserConcern: preferences concern
    if (Array.isArray(preferencesConcerns)) {
      const values = preferencesConcerns.filter(Boolean).map(c => [acc_id, c]);
      if (values.length) {
        await connection.query("INSERT INTO UserConcern (accid, concernid) VALUES ?", [values]);
      }
    }

    // Insert into UserConcern: allergic ingredients
    if (Array.isArray(allergicIngredients)) {
      const values = allergicIngredients.filter(Boolean).map(i => [acc_id, i]);
      if (values.length) {
        await connection.query("INSERT INTO UserConcern (accid, ingdid) VALUES ?", [values]);
      }
    }

    // Insert into FavBrand
    if (Array.isArray(favouriteBrands)) {
      const values = favouriteBrands.filter(Boolean).map(b => [acc_id, b]);
      if (values.length) {
        await connection.query("INSERT INTO FavBrand (accid, brandid) VALUES ?", [values]);
      }
    }

    res.status(200).json({ success: true, message: "Sign-up successful" });
    await connection.end();
  } catch (error) {
    console.error("❌ SIGNUP ERROR:", error);
    res.status(500).json({ success: false, message: "Database error", error: error.message });
  }
}

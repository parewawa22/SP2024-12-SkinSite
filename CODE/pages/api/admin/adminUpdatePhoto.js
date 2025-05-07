import formidable from "formidable";
import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import sharp from "sharp";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const uploadDir = path.join(process.cwd(), "public/image/ProductImage");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    multiples: false,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ Formidable error:", err);
      return res.status(500).json({ error: "File parsing failed" });
    }

    const pdid = fields.pdid?.[0];
    const imageFile = files.photo?.[0];

    if (!pdid || !imageFile) {
      return res.status(400).json({ error: "Missing product ID or image file" });
    }

    const originalName = imageFile.originalFilename || "uploaded";
    const baseName = originalName.replace(/\.[^/.]+$/, "");
    const newFileName = `${pdid}.jpg`; 

    const newFilePath = path.join(uploadDir, newFileName);

    const photoPath = `/image/ProductImage/${newFileName}`;

    try {
      await sharp(imageFile.filepath)
        .jpeg({ quality: 90 })
        .toFile(newFilePath);
        fs.unlinkSync(imageFile.filepath);

      const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });

      await db.execute(`UPDATE Product SET photo = ? WHERE pd_id = ?`, [photoPath, pdid]);
      await db.end();

      return res.status(200).json({ message: "Image uploaded", photo: `/image/ProductImage/${newFileName}` });
    } catch (err) {
      console.error("❌ Image processing error:", err);
      return res.status(500).json({ error: "Image conversion failed" });
    }
  });
}

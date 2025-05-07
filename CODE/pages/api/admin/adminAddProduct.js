import mysql from "mysql2/promise";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import sharp from "sharp";

export const config = {
    api: { bodyParser: false },
};

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

    const form = formidable({ multiples: false });


    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(500).json({ error: "Form parse error" });

        const ingredientIds = fields.ingredientIds
            ? JSON.parse(fields.ingredientIds[0])
            : [];

        const {
            name, brand, category, skinType, PAO, FDA,
            size, price, description, usage,
        } = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v[0]]));

        if (!name || !brand || !category || !skinType || !size || !price) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const db = await mysql.createConnection(dbConfig);
        try {
            await db.beginTransaction();

            // ✅ Get or insert category
            const [catRows] = await db.query(`SELECT cat_id FROM Category WHERE catName = ?`, [category]);
            let catid = catRows[0]?.cat_id;
            if (!catid) {
                const [insertCat] = await db.query(`INSERT INTO Category (catName) VALUES (?)`, [category]);
                catid = insertCat.insertId;
            }

            // ✅ Insert product
            await db.query(
                `INSERT INTO Product (pdName, pdDescription, catid, pdusage, FDA, PAO, photo) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [name, description, catid, usage, FDA, PAO, null]
            );

            const [[{ pd_id: pdid }]] = await db.query(`SELECT pd_id FROM Product ORDER BY pd_id DESC LIMIT 1`);

            if (ingredientIds.length > 0) {
                for (const ingd_id of ingredientIds) {
                    await db.execute(
                        `INSERT INTO IngdInProduct (pdid, ingdid) VALUES (?, ?)`,
                        [pdid, ingd_id]
                    );
                }
            }


            // ✅ Convert image and save
            let imageFileName = "notfoundProduct.png";
            if (files.photo?.[0]) {
                const uploadDir = path.join(process.cwd(), "public/image/ProductImage");
                if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

                imageFileName = `${pdid}.jpg`;
                await sharp(files.photo[0].filepath).jpeg({ quality: 90 }).toFile(path.join(uploadDir, imageFileName));
                fs.unlinkSync(files.photo[0].filepath);

                await db.query(`UPDATE Product SET photo = ? WHERE pd_id = ?`, [`/image/ProductImage/${imageFileName}`, pdid]);
            }

            // ✅ Insert brand into ProductInBrand
            const [brandRow] = await db.query(`SELECT brand_id FROM Brand WHERE brandName = ?`, [brand]);
            if (brandRow.length > 0) {
                await db.query(`INSERT INTO ProductInBrand (brandid, pdid) VALUES (?, ?)`, [brandRow[0].brand_id, pdid]);
            }

            // ✅ Insert skin type
            const skinTypeNames = skinType.split(",").map(s => s.trim());
            for (const stName of skinTypeNames) {
                const [[sktRow]] = await db.query(`SELECT skt_id FROM SkinType WHERE sktName = ?`, [stName]);
                if (sktRow?.skt_id) {
                    await db.query(`INSERT INTO ProductSkinType (pdid, sktid) VALUES (?, ?)`, [pdid, sktRow.skt_id]);
                }
            }

            // ✅ Insert size
            const [vol, ...unitArr] = size.split(" ");
            const unit = unitArr.join(" ");
            const [sizeRow] = await db.query(`SELECT size_id FROM Size WHERE volumn = ? AND unit = ?`, [vol, unit]);

            let sizeid = sizeRow[0]?.size_id;
            if (!sizeid) {
                const sizeNewId = `STH${Date.now()}`;
                await db.query(`INSERT INTO Size (size_id, volumn, unit) VALUES (?, ?, ?)`, [sizeNewId, vol, unit]);
                sizeid = sizeNewId;
            }

            // ✅ Insert price
            await db.query(`INSERT INTO Price (sizeid, pdid, price) VALUES (?, ?, ?)`, [sizeid, pdid, price]);

            await db.commit();
            res.status(200).json({ message: "Product added successfully" });
        } catch (error) {
            await db.rollback();
            console.error("Error:", error);
            res.status(500).json({ error: "Server error", message: error.message });
        } finally {
            db.end();
        }
    });
}

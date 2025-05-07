select * FROM Product WHERE catid = 'CTG00001';

SELECT * FROM account_skin WHERE acc_id = 'ACC00001';

SELECT * FROM wishlist WHERE accid = 'ACC00001';

SHOW TABLES;
SHOW CREATE TABLE IngdInProduct;


select * from ingredient;

SELECT * FROM Ingredient WHERE ingd_id = 'ING00001่';

SELECT * FROM IngdInProduct WHERE pdid = 'PTH00001';

SELECT p.PAO, p.FDA FROM Product p WHERE p.pd_id = 'PTH0001';

SELECT * FROM Product WHERE pd_id = 'PTH00001';

SELECT pd_id, FDA, PAO FROM Product WHERE pd_id = 'PTH00001';

SELECT p.pd_id, ps.price, s.volumn, s.unit
FROM Product p
LEFT JOIN Price ps ON p.pd_id = ps.pdid
LEFT JOIN Size s ON ps.sizeid = s.size_id
WHERE p.pd_id = 'PTH00001';

SELECT * FROM ProductSkinType WHERE pdid = 'PTH00001';

SELECT s.size_id, s.volumn, s.unit 
FROM Size s 
JOIN Price ps ON s.size_id = ps.sizeid 
WHERE ps.pdid = 'PTH00001';

SELECT * FROM Price WHERE pdid = 'PTH00001';

SELECT st.sktName 
FROM ProductSkinType pst 
JOIN SkinType st ON pst.sktid = st.skt_id 
WHERE pst.pdid = 'PTH00001';

SELECT p.pd_id, b.brandName 
FROM Product p
LEFT JOIN ProductInBrand pb ON p.pd_id = pb.pdid
LEFT JOIN Brand b ON pb.brandid = b.brand_id;

SELECT p.pd_id, c.catName 
FROM Product p
LEFT JOIN Category c ON c.cat_id = p.catid;

SELECT p.pd_id, s.volumn, s.unit, ps.price 
FROM Product p
LEFT JOIN Price ps ON ps.pdid = p.pd_id
LEFT JOIN Size s ON ps.sizeid = s.size_id;

SELECT * FROM Product;

SHOW TABLES;

SELECT * FROM Product LIMIT 10;
DELETE FROM ProductSkinType WHERE pdid IS NULL OR sktid IS NULL;

SELECT * FROM account_skin WHERE acc_id = 'ACC00001';

SELECT * FROM Price WHERE pdid IN ('PTH00001', 'PTH00002');

SELECT pdid, accid, COUNT(*) 
FROM review 
GROUP BY pdid, accid
HAVING COUNT(*) > 1;

SELECT pd_id FROM Product WHERE pd_id = 'PTH00001';
SELECT acc_id FROM account_skin WHERE acc_id = 'ACC00001';

SELECT * FROM review;

SELECT * FROM review WHERE accid = 'ACC00001';

SHOW CREATE TABLE review;

SELECT * FROM SkinType;

SELECT ingdid
FROM IngdInProduct
WHERE ingdid NOT IN (SELECT ingd_id FROM Ingredient);

SHOW CREATE TABLE Product;
SHOW CREATE TABLE Ingredient;

SELECT * FROM Product WHERE pd_id = 'PTH00001';

SELECT ingdid 
FROM IngdInProduct 
WHERE ingdid NOT IN (SELECT ingd_id FROM Ingredient);

select * FROM Product ;

SELECT DISTINCT ingdid
FROM IngdInProduct
WHERE ingdid NOT IN (SELECT ingd_id FROM Ingredient);

SELECT DISTINCT pdid
FROM IngdInProduct
WHERE pdid NOT IN (SELECT pdid FROM Product);

SELECT ingd_id, LENGTH(ingd_id) AS length
FROM Ingredient;

SELECT ingd_id, LENGTH(ingd_id) AS len
FROM Ingredient
WHERE LENGTH(ingd_id) != 8;

SELECT ingd_id, LENGTH(ingd_id) AS len_raw, LENGTH(TRIM(ingd_id)) AS len_trimmed
FROM Ingredient;

SELECT DISTINCT ingdid
FROM IngdInProduct
WHERE ingdid NOT IN (
    SELECT ingd_id FROM Ingredient
);

SELECT i.pdid, i.ingdid
FROM IngdInProduct i
LEFT JOIN Ingredient ing ON i.ingdid = ing.ingd_id
WHERE ing.ingd_id IS NULL;

SELECT i.pdid, i.ingdid
FROM IngdInProduct i
LEFT JOIN Ingredient ing ON i.ingdid = ing.ingd_id
WHERE ing.ingd_id IS NULL;

SELECT * FROM routineset ORDER BY routine_id DESC;

SELECT * FROM routineset WHERE accid = 'ACC0001' ORDER BY routine_id DESC;

SELECT rs.routineid, s.step_id, s.stepOrder, s.pdid
FROM RoutineStep rs
JOIN Step s ON rs.stepid = s.step_id;


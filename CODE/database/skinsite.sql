DROP DATABASE IF EXISTS skinsite;
CREATE DATABASE IF NOT EXISTS skinsite;
USE skinsite;

CREATE TABLE IF NOT EXISTS Brand (
	brand_id CHAR(8) PRIMARY KEY,
    brandName VARCHAR(1000) NOT NULL,
    brandDescription VARCHAR(3000)
);

DELIMITER //
CREATE TRIGGER before_insert_brand
BEFORE INSERT ON Brand
FOR EACH ROW
BEGIN
    DECLARE new_id INT;
    DECLARE formatted_id CHAR(8);

    SET new_id = IFNULL(
        (SELECT CAST(SUBSTRING(brand_id, 4, 5) AS UNSIGNED) FROM Brand 
         ORDER BY brand_id DESC LIMIT 1),
        0
    ) + 1;

    SET formatted_id = CONCAT('BTH', LPAD(new_id, 5, '0'));

    SET NEW.brand_id = formatted_id;
END;
//
DELIMITER ;

CREATE TABLE IF NOT EXISTS SkinType (
	skt_id CHAR(8) PRIMARY KEY,
    sktName VARCHAR(1000) NOT NULL,
    sktDescription VARCHAR(3000)
);

DELIMITER //
CREATE TRIGGER before_insert_skintype
BEFORE INSERT ON SkinType
FOR EACH ROW
BEGIN
    DECLARE new_id INT;
    DECLARE formatted_id CHAR(8);

    SET new_id = IFNULL(
        (SELECT CAST(SUBSTRING(skt_id, 4, 5) AS UNSIGNED) FROM SkinType 
         ORDER BY skt_id DESC LIMIT 1),
        0
    ) + 1;

    SET formatted_id = CONCAT('SKT', LPAD(new_id, 5, '0'));

    SET NEW.skt_id = formatted_id;
END;
//
DELIMITER ;

CREATE TABLE IF NOT EXISTS Ingredient (
	ingd_id CHAR(8) PRIMARY KEY,
    ingdName VARCHAR(1000) NOT NULL,
    ingdDetail VARCHAR(3000),
    ingdRisk INT,
	dataAvailability INT
);

ALTER TABLE Ingredient ADD CONSTRAINT 
chk_ingdRisk CHECK (ingdRisk >= 1 AND ingdRisk <= 10);

ALTER TABLE Ingredient ADD CONSTRAINT 
chk_ingddata CHECK (dataAvailability >= 1 AND dataAvailability <= 10);

DELIMITER //
CREATE TRIGGER before_insert_ingredient
BEFORE INSERT ON Ingredient
FOR EACH ROW
BEGIN
    DECLARE new_id INT;
    DECLARE formatted_id CHAR(8);

    SET new_id = IFNULL(
        (SELECT CAST(SUBSTRING(ingd_id, 4, 5) AS UNSIGNED) FROM Ingredient 
         ORDER BY ingd_id DESC LIMIT 1),
        0
    ) + 1;

    SET formatted_id = CONCAT('ING', LPAD(new_id, 5, '0'));

    SET NEW.ingd_id = formatted_id;
END;
//
DELIMITER ;

-- SHOW CREATE TABLE Ingredient; 
    
CREATE TABLE IF NOT EXISTS Category (
	cat_id CHAR(8) PRIMARY KEY,
    catName VARCHAR(1000) NOT NULL
);

DELIMITER //
CREATE TRIGGER before_insert_category
BEFORE INSERT ON Category
FOR EACH ROW
BEGIN
    DECLARE new_id INT;
    DECLARE formatted_id CHAR(8);

    SET new_id = IFNULL(
        (SELECT CAST(SUBSTRING(cat_id, 4, 5) AS UNSIGNED) FROM Category 
         ORDER BY cat_id DESC LIMIT 1),
        0
    ) + 1;

    SET formatted_id = CONCAT('CTG', LPAD(new_id, 5, '0'));

    SET NEW.cat_id = formatted_id;
END;
//
DELIMITER ;

CREATE TABLE IF NOT EXISTS Size (
	size_id CHAR(8) PRIMARY KEY,
    volumn INT NOT NULL,
    unit ENUM("ml/g", "sheet", "pair", "pads") NOT NULL
);

DELIMITER //
CREATE TRIGGER before_insert_size
BEFORE INSERT ON Size
FOR EACH ROW
BEGIN
    DECLARE new_id INT;
    DECLARE formatted_id CHAR(8);

    SET new_id = IFNULL(
        (SELECT CAST(SUBSTRING(size_id, 4, 5) AS UNSIGNED) FROM Size 
         ORDER BY size_id DESC LIMIT 1),
        0
    ) + 1;

    SET formatted_id = CONCAT('STH', LPAD(new_id, 5, '0'));

    SET NEW.size_id = formatted_id;
END;
//
DELIMITER ;

CREATE TABLE IF NOT EXISTS Benefit (
	benefit_id CHAR(8) PRIMARY KEY,
    benefitName VARCHAR(1000) NOT NULL,
    benefitDesc VARCHAR(3000)
);

DELIMITER //
CREATE TRIGGER before_insert_benefit
BEFORE INSERT ON Benefit
FOR EACH ROW
BEGIN
    DECLARE new_id INT;
    DECLARE formatted_id CHAR(8);

    SET new_id = IFNULL(
        (SELECT CAST(SUBSTRING(benefit_id, 4, 5) AS UNSIGNED) FROM Benefit 
         ORDER BY benefit_id DESC LIMIT 1),
        0
    ) + 1;

    SET formatted_id = CONCAT('BNF', LPAD(new_id, 5, '0'));

    SET NEW.benefit_id = formatted_id;
END;
//
DELIMITER ;

CREATE TABLE IF NOT EXISTS Concern (
	concern_id CHAR(8) PRIMARY KEY,
    concernName VARCHAR(1000) NOT NULL,
    concernDetail VARCHAR(3000)
);

DELIMITER //
CREATE TRIGGER before_insert_concern
BEFORE INSERT ON Concern
FOR EACH ROW
BEGIN
    DECLARE new_id INT;
    DECLARE formatted_id CHAR(8);

    SET new_id = IFNULL(
        (SELECT CAST(SUBSTRING(concern_id, 4, 5) AS UNSIGNED) FROM Concern 
         ORDER BY concern_id DESC LIMIT 1),
        0
    ) + 1;

    SET formatted_id = CONCAT('CTH', LPAD(new_id, 5, '0'));

    SET NEW.concern_id = formatted_id;
END;
//
DELIMITER ;

CREATE TABLE IF NOT EXISTS account_skin (
    acc_id CHAR(8) PRIMARY KEY,
    accName VARCHAR(1000) NOT NULL,
    email VARCHAR(320) NOT NULL,
    pwd VARCHAR(255) NOT NULL,
    accRoles ENUM("Member", "Admin") DEFAULT "Member" NOT NULL,
    gender ENUM("Male", "Female", "Not prefer to say") NOT NULL,
    dob DATE NOT NULL,
    sktid CHAR(8),
    CONSTRAINT FK_sktID FOREIGN KEY (sktid)
    REFERENCES SkinType(skt_id)
);

DELIMITER //
CREATE TRIGGER before_insert_account_skin
BEFORE INSERT ON account_skin
FOR EACH ROW
BEGIN
    DECLARE new_id INT;
    DECLARE formatted_id CHAR(8);

    SET new_id = IFNULL(
        (SELECT CAST(SUBSTRING(acc_id, 4, 5) AS UNSIGNED) FROM account_skin 
         ORDER BY acc_id DESC LIMIT 1), 
        0
    ) + 1;

    SET formatted_id = CONCAT('ACC', LPAD(new_id, 5, '0'));

    SET NEW.acc_id = formatted_id;
END;
//
DELIMITER ;

CREATE TABLE IF NOT EXISTS Product (
	pd_id CHAR(8) PRIMARY KEY,
	pdName VARCHAR(1000) NOT NULL,
    pdDescription VARCHAR(3000),
    catid char(8) NOT NULL,
    pdusage VARCHAR(1000),
    FDA CHAR(15) NOT NULL,
    PAO VARCHAR(1000),
	photo VARCHAR(1000),
    CONSTRAINT FK_catID FOREIGN KEY (catid)
    REFERENCES Category(cat_id)
);

DELIMITER //
CREATE TRIGGER before_insert_product
BEFORE INSERT ON Product
FOR EACH ROW
BEGIN
    DECLARE new_id INT;
    DECLARE formatted_id CHAR(8);

    SET new_id = IFNULL(
        (SELECT CAST(SUBSTRING(pd_id, 4, 5) AS UNSIGNED) FROM Product 
         ORDER BY pd_id DESC LIMIT 1), 
        0
    ) + 1;

    SET formatted_id = CONCAT('PTH', LPAD(new_id, 5, '0'));

    SET NEW.pd_id = formatted_id;
END;
//
DELIMITER ;

CREATE TABLE IF NOT EXISTS review (
	pdid CHAR(8) NOT NULL,
    accid CHAR(8) NOT NULL,
	scoreRating INT NOT NULL,
    textReview VARCHAR(1000),
	rvdate DATETIME NOT NULL,
    CONSTRAINT PK_review PRIMARY KEY (pdid, accid),
    CONSTRAINT FK_rvpdid FOREIGN KEY (pdid)
    REFERENCES Product(pd_id),
    CONSTRAINT FK_rvaccid FOREIGN KEY (accid)
    REFERENCES account_skin(acc_id)
);

ALTER TABLE review ADD CONSTRAINT 
chk_scoreRating CHECK (scoreRating >= 0 AND scoreRating <= 5);

CREATE TABLE IF NOT EXISTS Step (
	step_id CHAR(8) PRIMARY KEY,
    stepOrder INT NOT NULL,
    pdid	VARCHAR(512),
    CONSTRAINT FK_stpdid FOREIGN KEY (pdid)
    REFERENCES Product(pd_id)
);

DELIMITER //
CREATE TRIGGER before_insert_step
BEFORE INSERT ON Step
FOR EACH ROW
BEGIN
    DECLARE new_id INT;
    DECLARE formatted_id CHAR(8);

    SET new_id = IFNULL(
        (SELECT CAST(SUBSTRING(step_id, 4, 5) AS UNSIGNED) FROM Step 
         ORDER BY step_id DESC LIMIT 1), 
        0
    ) + 1;

    SET formatted_id = CONCAT('STP', LPAD(new_id, 5, '0'));

    SET NEW.step_id = formatted_id;
END;
//
DELIMITER ;

CREATE TABLE IF NOT EXISTS routineset (
	routine_id CHAR(8) PRIMARY KEY,
    accid CHAR(8) NOT NULL,
    routineType ENUM('Morning', 'Night') NOT NULL,
    routineName VARCHAR(1000) NOT NULL,
    CONSTRAINT FK_rtaccid FOREIGN KEY (accid)
    REFERENCES account_skin(acc_id)
);

DELIMITER //
CREATE TRIGGER before_insert_routineset
BEFORE INSERT ON routineset
FOR EACH ROW
BEGIN
    DECLARE new_id INT;
    DECLARE formatted_id CHAR(8);

    SET new_id = IFNULL(
        (SELECT CAST(SUBSTRING(routine_id, 4, 5) AS UNSIGNED)
         FROM routineset ORDER BY routine_id DESC LIMIT 1),
        0
    ) + 1;

    SET formatted_id = CONCAT('RUT', LPAD(new_id, 5, '0'));

    SET NEW.routine_id = formatted_id;
END;
//
DELIMITER ;


CREATE TABLE RoutineStep (
	stepid CHAR(8),
	routineid CHAR(8),
	PRIMARY KEY (stepid, routineid),
    CONSTRAINT FK_stpid FOREIGN KEY (stepid)
    REFERENCES Step(step_id),
	CONSTRAINT FK_routineid FOREIGN KEY (routineid)
    REFERENCES routineset(routine_id)
);

CREATE TABLE IF NOT EXISTS wishlist (
	pdid CHAR(8) NOT NULL,
    accid CHAR(8) NOT NULL,
    dateAdd DATETIME NOT NULL,
    CONSTRAINT PK_wishlist PRIMARY KEY (pdid, accid),
    CONSTRAINT FK_wlpdid FOREIGN KEY (pdid)
    REFERENCES Product(pd_id),
    CONSTRAINT FK_wlaccid FOREIGN KEY (accid)
    REFERENCES account_skin(acc_id)
);

CREATE TABLE IF NOT EXISTS Price (
	sizeid CHAR(8) NOT NULL,
    pdid CHAR(8) NOT NULL,
    price DECIMAL(7,2) NOT NULL,
    CONSTRAINT PK_price PRIMARY KEY (sizeid, pdid),
    CONSTRAINT FK_psizeid FOREIGN KEY (sizeid)
    REFERENCES Size(size_id),
    CONSTRAINT FK_ppdid FOREIGN KEY (pdid)
    REFERENCES Product(pd_id)
);

CREATE TABLE IF NOT EXISTS FavBrand (
    accid CHAR(8) NOT NULL,
    brandid CHAR(8) NOT NULL,
    CONSTRAINT PK_FavBrand PRIMARY KEY (accid, brandid),
    CONSTRAINT FK_fbaccid FOREIGN KEY (accid)
    REFERENCES account_skin(acc_id) ON DELETE CASCADE,
    CONSTRAINT FK_fbbrandid FOREIGN KEY (brandid)
    REFERENCES Brand(brand_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS UserConcern (
    accid CHAR(8) NOT NULL,
    benefitid CHAR(8),
    concernid CHAR(8),
    ingdid CHAR(8),
    -- CONSTRAINT PK_UserConcern PRIMARY KEY (accid, benefitid, concernid, ingdid),
    CONSTRAINT FK_usaccid FOREIGN KEY (accid)
    REFERENCES account_skin(acc_id),
    CONSTRAINT FK_usbenefitid FOREIGN KEY (benefitid)
    REFERENCES Benefit(benefit_id),
    CONSTRAINT FK_usconcernid FOREIGN KEY (concernid)
    REFERENCES Concern(concern_id),
    CONSTRAINT FK_usingdid FOREIGN KEY (ingdid)
    REFERENCES Ingredient(ingd_id)
);

CREATE TABLE IF NOT EXISTS ProductSkinType (
    pdid CHAR(8) NOT NULL,
    sktid CHAR(8) NOT NULL,
    CONSTRAINT PK_ProductSkinType PRIMARY KEY (pdid, sktid),
    CONSTRAINT FK_pstpdid FOREIGN KEY (pdid)
    REFERENCES Product(pd_id),
    CONSTRAINT FK_pstsktid FOREIGN KEY (sktid)
    REFERENCES SkinType(skt_id)
);

CREATE TABLE IF NOT EXISTS IngdInProduct (
    pdid CHAR(8) NOT NULL,
    ingdid CHAR(8) NOT NULL,
    CONSTRAINT PK_IngdInProduct PRIMARY KEY (pdid, ingdid),
    CONSTRAINT FK_inpdpdid FOREIGN KEY (pdid)
    REFERENCES Product(pd_id),
    CONSTRAINT FK_inpdingdid FOREIGN KEY (ingdid)
    REFERENCES Ingredient(ingd_id)
);

-- DESCRIBE IngdInProduct;

CREATE TABLE IF NOT EXISTS ConcernInProduct (
    pdid CHAR(8) NOT NULL,
    concernid CHAR(8),
    CONSTRAINT PK_IngdConcern PRIMARY KEY (pdid, concernid),
    CONSTRAINT FK_icingdid FOREIGN KEY (pdid)
    REFERENCES Product(pd_id),
    CONSTRAINT FK_icconcernid FOREIGN KEY (concernid)
    REFERENCES Concern(concern_id)
);

CREATE TABLE IF NOT EXISTS BenefitInProduct (
    pdid CHAR(8) NOT NULL,
    benefitid CHAR(8),
    CONSTRAINT PK_BenefitInIngd PRIMARY KEY (pdid, benefitid),
    CONSTRAINT FK_biiingdid FOREIGN KEY (pdid)
    REFERENCES Product(pd_id),
    CONSTRAINT FK_biibenefitid FOREIGN KEY (benefitid)
    REFERENCES Benefit(benefit_id)
);

CREATE TABLE IF NOT EXISTS ProductInBrand (
    brandid CHAR(8) NOT NULL,
    pdid CHAR(8) NOT NULL,
    CONSTRAINT PK_ProductBrand PRIMARY KEY (brandid, pdid),
    CONSTRAINT FK_pbbrandid FOREIGN KEY (brandid)
    REFERENCES Brand(brand_id),
    CONSTRAINT FK_pbpdid FOREIGN KEY (pdid)
    REFERENCES Product(pd_id)
);

-- UserConcern: ลบ FK เดิมแล้วเพิ่มใหม่
ALTER TABLE UserConcern DROP FOREIGN KEY FK_usaccid;
ALTER TABLE UserConcern 
  ADD CONSTRAINT FK_usaccid FOREIGN KEY (accid) 
  REFERENCES account_skin(acc_id) ON DELETE CASCADE;

-- FavBrand
ALTER TABLE FavBrand DROP FOREIGN KEY FK_fbaccid;
ALTER TABLE FavBrand 
  ADD CONSTRAINT FK_fbaccid FOREIGN KEY (accid) 
  REFERENCES account_skin(acc_id) ON DELETE CASCADE;

-- wishlist
ALTER TABLE wishlist DROP FOREIGN KEY FK_wlaccid;
ALTER TABLE wishlist 
  ADD CONSTRAINT FK_wlaccid FOREIGN KEY (accid) 
  REFERENCES account_skin(acc_id) ON DELETE CASCADE;

-- routineset
ALTER TABLE routineset DROP FOREIGN KEY FK_rtaccid;
ALTER TABLE routineset 
  ADD CONSTRAINT FK_rtaccid FOREIGN KEY (accid) 
  REFERENCES account_skin(acc_id) ON DELETE CASCADE;

-- review
ALTER TABLE review DROP FOREIGN KEY FK_rvaccid;
ALTER TABLE review 
  ADD CONSTRAINT FK_rvaccid FOREIGN KEY (accid) 
  REFERENCES account_skin(acc_id) ON DELETE CASCADE;
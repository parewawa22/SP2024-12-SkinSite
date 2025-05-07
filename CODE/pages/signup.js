import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import styles from "../styles/sign-up.module.css"; 

const SignUp = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    gender: "",
    birthdate: "",
    sktid: "",
    skincareGoals: [""], 
    preferencesConcerns: [""], 
    allergicIngredients: [""],
    favouriteBrands: [""],
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [skinTypes, setSkinTypes] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [concerns, setConcerns] = useState([]);
  const [ingredients, setIngredients] = useState([]); 
  const [filteredIngredients, setFilteredIngredients] = useState([]); 
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [brands, setBrands] = useState([]); 


  useEffect(() => {
    fetch("/api/skintype/api_skintypes")
      .then((res) => res.json())
      .then((data) => setSkinTypes(data));

    fetch("/api/product/api_benefit")
      .then((res) => res.json())
      .then((data) => setBenefits(data));

    fetch("/api/product/api_concern")
      .then((res) => res.json())
      .then((data) => setConcerns(data));

    fetch("/api/account/api_all_ingredients")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setIngredients(data);
        }
      });

    fetch("/api/product/api_brands")
      .then((res) => res.json())
      .then((data) => setBrands(data));
  }, []);

  const handleChange = (e, type, index = null) => {
    const { value } = e.target;
    if (["skincareGoals", "preferencesConcerns", "allergicIngredients", "favouriteBrands"].includes(type)) {
      const updatedArray = [...formData[type]];
      updatedArray[index] = value;
      setFormData((prev) => ({ ...prev, [type]: updatedArray }));

      if (type === "allergicIngredients") {
        setFilteredIngredients(ingredients.filter(ing =>
          ing.ingdName.toLowerCase().includes(value.toLowerCase())
        ));
      }

      if (type === "favouriteBrands") {
        setFilteredBrands(brands.filter(b => b.brandName.toLowerCase().includes(value.toLowerCase())));
      }
    } else {
      setFormData((prev) => ({ ...prev, [type]: value }));
    }
  };

  const handleAddField = (type) => {
    setFormData((prev) => ({
      ...prev,
      [type]: [...prev[type], ""],
    }));
  };

  const handleRemoveField = (type, index) => {
    const updatedArray = [...formData[type]];
    updatedArray.splice(index, 1);
    setFormData((prev) => ({ ...prev, [type]: updatedArray }));
  };

  const handleSelectIngredient = (index, ingd_id) => {
    const updatedAllergic = [...formData.allergicIngredients];
    updatedAllergic[index] = ingd_id;
    setFormData((prev) => ({ ...prev, allergicIngredients: updatedAllergic }));
    setFilteredIngredients([]);
  };

  const handleSelectBrand = (index, brand_id) => {
    const updatedBrands = [...formData.favouriteBrands];
    updatedBrands[index] = brand_id;
    setFormData((prev) => ({ ...prev, favouriteBrands: updatedBrands }));
    setFilteredBrands([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("/api/api_singup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        alert("Sign-up successful!");
        router.push("/login"); 
      } else {
        alert("Sign-up failed: " + data.message);
      }
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again.");
      alert("Something went wrong. Please try again.");
    }
  };


  return (
    <div className={styles.container}>
      <div className={styles.signupBox}>
        <div className={styles.logo}>
          <a href="/">
            <Image src="/image/logoname.png" alt="SkinSite Logo" width={250} height={60} />
          </a>
        </div>

        <h2 className={styles.title}>Sign-up</h2>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>Email</label>
          <input type="email" name="email" placeholder="Email" className={styles.inputField} required onChange={(e) => handleChange(e, "email")} />

          <label className={styles.label}>Password</label>
          <input type="password" name="password" placeholder="Password" className={styles.inputField} required onChange={(e) => handleChange(e, "password")} />

          <label className={styles.label}>Confirm Password</label>
          <input type="password" name="confirmPassword" placeholder="Confirm Password" className={styles.inputField} required onChange={(e) => handleChange(e, "confirmPassword")} />

          <label className={styles.label}>Name and Surname</label>
          <input type="text" name="name" placeholder="Name and Surname" className={styles.inputField} required onChange={(e) => handleChange(e, "name")} />

          <label className={styles.label}>Gender</label>
          <select name="gender" className={styles.inputField} required onChange={(e) => handleChange(e, "gender")}>
            <option value="">Select Gender</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Not prefer to say">Not prefer to say</option>
          </select>

          <label className={styles.label}>Birth Date</label>
          <input type="date" name="birthdate" className={styles.inputField} required onChange={(e) => handleChange(e, "birthdate")} />

          <label className={styles.label}>Skin Condition</label>
          <select name="sktid" className={styles.inputField} onChange={(e) => handleChange(e, "sktid")}>
            <option value="">None</option>
            {skinTypes.map((skt) => (
              <option key={skt.skt_id} value={skt.skt_id}>{skt.sktName}</option>
            ))}
          </select>

          <label className={styles.label}>Skincare Goal</label>
          {formData.skincareGoals.map((goal, index) => (
            <div key={index} className={styles.dropdownContainer}>
              <select
                className={styles.selectField}
                value={goal}
                onChange={(e) => handleChange(e, "skincareGoals", index)}
              >
                <option value="">Select Skincare Goal</option>
                {benefits
                  .filter((b) => !formData.skincareGoals.includes(b.benefit_id) || b.benefit_id === goal)
                  .map((b) => (
                    <option key={b.benefit_id} value={b.benefit_id}>
                      {b.benefitName}
                    </option>
                  ))}
              </select>
              {index === formData.skincareGoals.length - 1 && (
                <button type="button" className={styles.addButton} onClick={() => handleAddField("skincareGoals")}>+</button>
              )}
              {formData.skincareGoals.length > 1 && (
                <button type="button" className={styles.removeButton} onClick={() => handleRemoveField("skincareGoals", index)}>−</button>
              )}
            </div>
          ))}

          <label className={styles.label}>Preferences Concern</label>
          {formData.preferencesConcerns.map((concern, index) => (
            <div key={index} className={styles.dropdownContainer}>
              <select className={styles.selectField} value={concern} onChange={(e) => handleChange(e, "preferencesConcerns", index)}>
                <option value="">Select Preferences Concern</option>
                {concerns
                  .filter((c) => !formData.preferencesConcerns.includes(c.concern_id) || c.concern_id === concern)
                  .map((c) => (
                    <option key={c.concern_id} value={c.concern_id}>
                      {c.concernName}
                    </option>
                  ))}
              </select>
              {index === formData.preferencesConcerns.length - 1 && (
                <button type="button" className={styles.addButton} onClick={() => handleAddField("preferencesConcerns")}>+</button>
              )}
              {formData.preferencesConcerns.length > 1 && (
                <button type="button" className={styles.removeButton} onClick={() => handleRemoveField("preferencesConcerns", index)}>−</button>
              )}
            </div>
          ))}

          <label className={styles.label}>Allergic Ingredients</label>
          {formData.allergicIngredients.map((ingredient, index) => (
            <div key={index} className={styles.dropdownContainer}>
              <select
                className={styles.selectField}
                value={ingredient}
                onChange={(e) => handleChange(e, "allergicIngredients", index)}
              >
                <option value="">Select Allergic Ingredient</option>
                {ingredients
                  .filter((ing) =>
                    !formData.allergicIngredients.includes(ing.ingd_id) || ing.ingd_id === ingredient 
                  )
                  .sort((a, b) => a.ingdName.localeCompare(b.ingdName)) 
                  .map((ing) => (
                    <option key={ing.ingd_id} value={ing.ingd_id}>
                      {ing.ingdName}
                    </option>
                  ))}
              </select>
              {index === formData.allergicIngredients.length - 1 && (
                <button type="button" className={styles.addButton} onClick={() => handleAddField("allergicIngredients")}>
                  +
                </button>
              )}
              {formData.allergicIngredients.length > 1 && (
                <button type="button" className={styles.removeButton} onClick={() => handleRemoveField("allergicIngredients", index)}>−</button>
              )}
            </div>
          ))}

          <label className={styles.label}>Favourite Brand</label>
          {formData.favouriteBrands.map((brand, index) => (
            <div key={index} className={styles.dropdownContainer}>
              <select
                className={styles.selectField}
                value={brand}
                onChange={(e) => handleChange(e, "favouriteBrands", index)}
              >
                <option value="">Select Favourite Brand</option>
                {brands
                  .filter((b) =>
                    !formData.favouriteBrands.includes(b.brand_id) || b.brand_id === brand
                  )
                  .map((b) => (
                    <option key={b.brand_id} value={b.brand_id}>
                      {b.brandName}
                    </option>
                  ))}
              </select>
              {index === formData.favouriteBrands.length - 1 && (
                <button type="button" className={styles.addButton} onClick={() => handleAddField("favouriteBrands")}>
                  +
                </button>
              )}
              {formData.favouriteBrands.length > 1 && (
                <button type="button" className={styles.removeButton} onClick={() => handleRemoveField("favouriteBrands", index)}>−</button>
              )}
            </div>
          ))}

          <button type="submit" className={styles.signupButton}>Save</button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;

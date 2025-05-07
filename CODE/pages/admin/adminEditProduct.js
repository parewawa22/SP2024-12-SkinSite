import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "/styles/admin/adminEditProduct.module.css";
import Link from "next/link";
import AdminBar from "./adminBar";
import NavBar from "/components/NavBar";
import Footer from "/components/Footer";

export default function AdminEditProduct() {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState("");

  const [allBrands, setAllBrands] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState(null);

  const [catid, setCatid] = useState(null);
  const [categoryInput, setCategoryInput] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  const [allSkinTypes, setAllSkinTypes] = useState([]);
  const [selectedSkinTypes, setSelectedSkinTypes] = useState([]);
  const [skinTypeInput, setSkinTypeInput] = useState("");

  const [sizeInput, setSizeInput] = useState("");
  const [allSizes, setAllSizes] = useState([]);
  const [priceInput, setPriceInput] = useState("");

  const [product, setProduct] = useState({
    name: "",
    brand: "",
    category: "",
    skinType: "",
    pao: "",
    fda: "",
    size: "",
    price: "",
    description: "",
    pdusage: "",
    photo: "",
  });

  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { pdid } = router.query;
  const { pdid: productId } = router.query;

  useEffect(() => {
    const fetchBrands = async () => {
      const res = await fetch("/api/admin/api_addbrand");
      const data = await res.json();
      setAllBrands(data);
    };
    fetchBrands();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch("/api/product/api_categories");
    const data = await res.json();
    setAllCategories(data);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch("/api/product/api_categories");
      const data = await res.json();
      setAllCategories(data);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSkinTypes = async () => {
      const res = await fetch("/api/skintype/api_skin_type");
      const data = await res.json();
      setAllSkinTypes(data);
    };
    fetchSkinTypes();
  }, []);

  useEffect(() => {
    const fetchSizes = async () => {
      const res = await fetch("/api/product/api_size");
      const data = await res.json();
      setAllSizes(data);
    };
    fetchSizes();
  }, []);

  useEffect(() => {
    if (product.size && sizeInput === "") {
      setSizeInput(product.size);
    }
  }, [product.size]);

  useEffect(() => {
    if (product && product.category) {
      setCategoryInput(product.category);
    }
  }, [product]);

  useEffect(() => {
    const filtered = allCategories.filter(cat =>
      cat.catName.toLowerCase().includes(categoryInput.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [categoryInput, allCategories]);

  useEffect(() => {
    if (pdid) {
      fetch(`/api/product/api_product?pdid=${pdid}`)
        .then((response) => response.json())
        .then((data) => {
          console.log("🟢 API response:", data); 

          if (data.product) {
            console.log("🟡 Product Photo Before Setting:", data.product.photo);
            console.log("PAO from backend:", data.product.PAO);

            setProduct({
              name: data.product.name || "",
              brand: data.product.brand || "Unknown Brand",
              category: data.product.category || "No Category",
              skinType: data.product.skinType ? data.product.skinType.split(", ") : ["Not Specified"],
              pao: data.product.PAO ?? "Not Available",
              fda: data.product.FDA || "Not Available",
              size: data.product.size || "Not Available",
              price: data.product.price || "Not Available",
              description: data.product.description || "",
              pdusage: data.product.pdusage || "",
              brandId: data.product.brandId || null,
              catid: data.product.catid || null,
              photo: data.product.photo && data.product.photo !== "Not Available" ? data.product.photo.trim() : "notfoundProduct.png",
            });
            setSelectedBrandId(data.product.brandId || null); 
            setCatid(data.product.catid || null);            
            setCategoryInput(data.product.category || "");  
            setSizeInput(data.product.size || "Not Available");
            setPriceInput(data.product.price || "");

            if (data.product.skinType) {
              setSelectedSkinTypes(data.product.skinType.split(", ").map(s => s.trim()));
            }

            console.log("🟠 Product State After Setting:", product); 
          } else {
            console.error("🔴 Product data is missing.");
          }
        })
        .catch(error => console.error("🔴 Error fetching product:", error));
    }
  }, [pdid]);

  useEffect(() => {
    if (!productId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/product/api_product?pdid=${productId}`);
        const data = await res.json();
        const productData = {
          ...data.product,
          pao: data.product.PAO ?? "Not Available", 
          fda: data.product.FDA ?? "Not Available",
        };
        setProduct(productData);

        const ingdRes = await fetch(`/api/product/api_product_ingredients?pdid=${productId}`);
        const ingdData = await ingdRes.json();
        setIngredients(ingdData);

        const allIngdRes = await fetch("/api/admin/api_addingredient");
        const allIngdData = await allIngdRes.json();
        setAllIngredients(allIngdData);
      } catch (err) {
        console.error("Error loading product", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  const fetchAllIngredients = async () => {
    const res = await fetch("/api/admin/api_addingredient"); 
    const data = await res.json();
    setAllIngredients(data);
  };

  const fetchProductIngredients = async (productId) => {
    const res = await fetch(`/api/product/api_product_ingredients?pdid=${productId}`);
    const data = await res.json();
    setIngredients(data);
  };

  useEffect(() => {
    if (productId) {
      fetchProductIngredients(productId);
      fetchAllIngredients();
    }
  }, [productId]);

  const toggleEditMode = () => {
    setIsEditingImage(!isEditingImage);
  };

  const confirmSkinTypeAdd = () => {
    const newType = skinTypeInput.trim();
    if (
      newType !== "" &&
      allSkinTypes.find(st => st.sktName === newType) &&
      !selectedSkinTypes.includes(newType)
    ) {
      setSelectedSkinTypes(prev => [...prev, newType]);
    }
    setSkinTypeInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      confirmSkinTypeAdd();
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile || !productId) return;

    const formData = new FormData();
    formData.append("photo", selectedFile);
    formData.append("pdid", productId);

    const response = await fetch("/api/admin/adminUpdatePhoto", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    if (response.ok) {
      alert("✅ Image update successful!");
      setProduct(prev => ({ ...prev, photo: result.photo }));
    } else {
      alert(`❌ Image upload failed: ${result.error}`);
    }
  };

  const handleFileUploadAuto = async (event) => {
    const file = event.target.files[0];
    if (!file || !productId) return;

    const formData = new FormData();
    formData.append("photo", file);
    formData.append("pdid", productId);

    try {
      const res = await fetch("/api/admin/adminUpdatePhoto", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        alert("✅ Image updated!");
        setProduct((prev) => ({
          ...prev,
          photo: result.photo, 
        }));
      } else {
        alert(`❌ Upload failed: ${result.error}`);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("❌ Upload failed");
    }
  };



  const handleSkinTypeChange = (e) => {
    const input = e.target.value;
    setSkinTypeInput(input);

    if (input.endsWith(",")) {
      const newType = input.slice(0, -1).trim();
      if (
        newType !== "" &&
        allSkinTypes.find(st => st.sktName === newType) &&
        !selectedSkinTypes.includes(newType)
      ) {
        setSelectedSkinTypes(prev => [...prev, newType]);
      }
      setSkinTypeInput("");
    }
  };

  const handleRemoveSkinType = (name) => {
    setSelectedSkinTypes(prev => prev.filter(st => st !== name));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
    if (name === "price") {
      setPriceInput(value);
    } else {
      setProduct((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        setProduct((prev) => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(product).forEach((key) => formData.append(key, product[key]));
    if (selectedFile) formData.append("photo", selectedFile);

    const response = await fetch(`/api/product/api_product?pdid=${pdid}`, {
      method: "PUT",
      body: formData,
    });

    const result = await response.json();
    if (response.ok) {
      alert("Product updated successfully!");
    }
    else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleAddIngredient = () => {
    const found = allIngredients.find(i => i.ingd_id === selectedIngredient);
    if (found) {
      setIngredients([...ingredients, found]);
      setSelectedIngredient("");
    }
  };

  const handleRemoveIngredient = (ingd_id) => {
    setIngredients(ingredients.filter(i => i.ingd_id !== ingd_id));
  };

  const handleSave = async () => {
    try {
      const payload = {
        pdid: productId,
        pdName: product.name,
        pdDescription: product.description,
        pdusage: product.pdusage,
        FDA: product.fda,
        PAO: product.pao,
        ingredientIds: ingredients.map(i => i.ingd_id),
        skinTypeNames: selectedSkinTypes,
        sizeInput: sizeInput,
      };

      if (selectedBrandId !== null) {
        payload.brandId = selectedBrandId;
      }

      if (product.catid) {
        payload.catid = product.catid;
      }

      if (catid !== null) {
        payload.catid = catid;
      }

      if (priceInput !== "") {
        payload.price = priceInput;
      }

      if (selectedSkinTypes.length > 0) {
        console.log("🟢 Payload sending to server:", payload);
        payload.skinTypeNames = selectedSkinTypes;
      }

      const res = await fetch("/api/admin/adminEditProduct", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        alert("Product updated successfully!");
        router.push("/admin/adminProduct");
      } else {
        alert(`Failed to update: ${result.message}`);
      }
    } catch (err) {
      console.error("Error saving product:", err);
      alert("Error saving product.");
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("⚠️ Are you sure you want to delete this item??");
  
    if (!confirmDelete) return;
  
    try {
      const res = await fetch("/api/admin/adminEditProduct", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdid: productId }),
      });
  
      const result = await res.json();
  
      if (res.ok) {
        alert("✅ Product has been successfully deleted.");
        router.push("/admin/adminProduct");
      } else {
        alert(`❌ Product deletion failed: ${result.message}`);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("❌ There was an error deleting the product.");
    }
  };  

  const imagePath = product.photo && product.photo !== "Not Available"
    ? `/image/ProductImage/${product.photo}`
    : "/image/ProductImage/notfoundProduct.png";

  console.log("🔵 Final Image Path:", imagePath);

  return (
    <div className={styles.main}>
      <NavBar />

      <div className={styles.body}>
        <AdminBar />

        <div className={styles.head}>
          <h2>Edit Products</h2>

          <div className={styles.productInfo}>

            <h3 className={styles.title}> Product Information </h3>

            <form className={styles.overview}>

              <label> Product Name </label>
              <input type="text" name="name" value={product.name || ""} onChange={handleChange} style={{ marginLeft: '20px' }} />

              <label> Brand Name </label>
              <input
                type="text"
                list="brandList"
                value={product.brand}
                onChange={(e) => {
                  setProduct({ ...product, brand: e.target.value });

                  const found = allBrands.find(b => b.brandName === e.target.value);
                  if (found) setSelectedBrandId(found.brand_id);
                }}
              />
              <datalist id="brandList">
                {allBrands.map((brand) => (
                  <option key={brand.brand_id} value={brand.brandName} />
                ))}
              </datalist>

              <label>Category</label>
              <input
                type="text"
                list="categoryList"
                value={categoryInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setCategoryInput(value);

                  const found = allCategories.find(cat => cat.catName === value);
                  if (found) {
                    setProduct(prev => ({ ...prev, category: found.catName, catid: found.cat_id }));
                  }
                }}
              />
              <datalist id="categoryList">
                {allCategories.map(cat => (
                  <option key={cat.cat_id} value={cat.catName} />
                ))}
              </datalist>

              <label>Skin Type</label>
              <div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                  {selectedSkinTypes.map((type, index) => (
                    <span key={index} style={{
                      padding: "5px 10px",
                      background: "#eee",
                      borderRadius: "12px",
                      display: "inline-flex",
                      alignItems: "center"
                    }}>
                      {type}
                      <button type="button" onClick={() => handleRemoveSkinType(type)} style={{
                        marginLeft: "8px",
                        background: "none",
                        border: "none",
                        color: "red",
                        cursor: "pointer"
                      }}>×</button>
                    </span>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="text"
                    value={skinTypeInput}
                    onChange={handleSkinTypeChange}
                    onKeyDown={handleKeyPress}
                    list="skinTypeList"
                    placeholder="Type and press Enter or click Add"
                  />
                  <button type="button" onClick={confirmSkinTypeAdd}>Add</button>
                </div>

                <datalist id="skinTypeList">
                  {allSkinTypes
                    .filter(st => !selectedSkinTypes.includes(st.sktName))
                    .map(st => (
                      <option key={st.skt_id} value={st.sktName} />
                    ))}
                </datalist>
              </div>


              <label> PAO </label>
              <input
                type="text"
                name="pao"
                value={product.pao ?? "Not Available"}   
                onChange={handleChange}
              />

              <label> FDA </label>
              <input type="text" name="fda" value={product.fda !== "" ? product.fda : "Not Available"} onChange={handleChange} style={{ marginLeft: '20px' }} />

              <label> Size </label>
              <input
                type="text"
                name="sizeInput"
                list="sizeList"
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                placeholder="e.g. 50 ml"
              />
              <datalist id="sizeList">
                {allSizes.map((size, idx) => (
                  <option key={idx} value={`${size.volumn} ${size.unit}`} />
                ))}
              </datalist>

              <label> Price </label>
              <input
                type="text"
                name="price"
                value={priceInput}
                onChange={handleChange}
              />
            </form>

            <div className={styles.ingredientSection}>
              <h4>Ingredients</h4>
              <ul>
                {ingredients.map((ing) => (
                  <li key={ing.ingd_id}>
                    {ing.ingdName}
                    <button onClick={() => handleRemoveIngredient(ing.ingd_id)}>❌</button>
                  </li>
                ))}
              </ul>
              <select
                value={selectedIngredient}
                onChange={(e) => setSelectedIngredient(e.target.value)}
              >
                <option value="">Select Ingredient</option>
                {allIngredients
                  .filter(ing => !ingredients.find(i => i.ingd_id === ing.ingd_id))
                  .map((ing) => (
                    <option key={ing.ingd_id} value={ing.ingd_id}>
                      {ing.ingdName}
                    </option>
                  ))}
              </select>
              <button onClick={handleAddIngredient} disabled={!selectedIngredient}>Add</button>
            </div>

            <form className={styles.fulltext}>
              <div className={styles.Description}>
                <label> Product Description </label>
                <textarea name="description" value={product.description || ""} onChange={handleChange} className={styles.textarea}></textarea>
              </div>

              <div className={styles.Usage}>
                <label> Usage </label>
                <textarea name="pdusage" value={product.pdusage || ""} onChange={handleChange} className={styles.textarea}></textarea>
              </div>

              <div className={styles.image}>
                <label> Image </label>
                <div className={styles.borderImage}>
                  <div className={styles.imagePreview}>
                    <img
                      src={`${product?.photo}?t=${Date.now()}` || "/image/notfoundProduct.png"}
                      alt={product?.name}
                      style={{ width: "550px", height: "550px", marginRight: "20px" }}
                    />

                  </div>
                  <button type="button" className={styles.editButton} onClick={() => fileInputRef.current.click()}>
                    Upload Image
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUploadAuto}
                    style={{ display: "none" }}
                  />

                </div>
              </div>
            </form>

            <div className={styles.save}>
              <button onClick={handleSave}>Save</button>
              <button onClick={handleDelete} className={styles.deleteButton}>Delete</button>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

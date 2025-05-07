import { useRef, useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import styles from "/styles/admin/adminAddProduct.module.css";
import Link from "next/link";
import AdminBar from "./adminBar";
import NavBar from "/components/NavBar";
import Footer from "/components/Footer";

export default function AdminAdd() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [allIngredients, setAllIngredients] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [allSkinTypes, setAllSkinTypes] = useState([]);
  const [allSizes, setAllSizes] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [showSkinTypeList, setShowSkinTypeList] = useState(false);
  const [product, setProduct] = useState({
    name: "",
    brand: "",
    category: "",
    skinType: "",
    PAO: "",
    FDA: "",
    size: "",
    price: "",
    description: "",
    usage: "",
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const key in product) {
      if (product[key].trim() === "") {
        alert(`Please fill in the ${key} field.`);
        return;
      }
    }
    if (!selectedFile) {
      alert("Please upload a product image.");
      return;
    }

    const sanitizedProduct = {};
    Object.entries(product).forEach(([key, value]) => {
      sanitizedProduct[key] = value.trim() === "-" ? null : value;
    });

    const formData = new FormData();
    Object.entries(sanitizedProduct).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (selectedFile) {
      formData.append("photo", selectedFile);
    }

    if (selectedIngredients.length > 0) {
      formData.append("ingredientIds", JSON.stringify(selectedIngredients.map(i => i.ingd_id)));
    }

    const response = await fetch("/api/admin/adminAddProduct", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    if (response.ok) {
      alert("✅ Product added successfully!");
      router.push("/admin/adminProduct");
    } else {
      alert(`❌ Error: ${result.error}`);
    }
  };

  useEffect(() => {
    const fetchIngredients = async () => {
      const res = await fetch("/api/admin/api_addingredient");
      const data = await res.json();
      setAllIngredients(data);
    };
    fetchIngredients();
  }, []);

  useEffect(() => {
    const fetchSkinTypes = async () => {
      try {
        const res = await fetch("/api/skintype/api_skin_type");
        const data = await res.json();
        setAllSkinTypes(data);
      } catch (err) {
        console.error("Error fetching skin types:", err);
      }
    };

    fetchSkinTypes();
  }, []);

  useEffect(() => {
    const fetchOptions = async () => {
      const [brands, cats, sizes] = await Promise.all([
        fetch("/api/admin/api_addbrand").then(res => res.json()),
        fetch("/api/product/api_categories").then(res => res.json()),
        fetch("/api/product/api_size").then(res => res.json()),
      ]);
      setAllBrands(brands);
      setAllCategories(cats);
      setAllSizes(sizes);
    };
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  return (
    <div className={styles.main}>
      <NavBar />
      <div className={styles.body}>
        <AdminBar />
        <div className={styles.head}>
          <h2>Add Products</h2>
          <div className={styles.productInfo}>
            <h3 className={styles.title}> Product Information </h3>
            <form className={styles.overview}>
              <label>Product Name</label>
              <input type="text" name="name" value={product.name} onChange={handleChange} placeholder="Product Name" />
              <label>Brand Name</label>
              <input type="text" name="brand" list="brandList" value={product.brand} onChange={handleChange} placeholder="Brand Name" />
              <datalist id="brandList">
                {allBrands.map((b) => <option key={b.brand_id} value={b.brandName} />)}
              </datalist>
              <label>Category</label>
              <input type="text" name="category" list="categoryList" value={product.category} onChange={handleChange} placeholder="Category" />
              <datalist id="categoryList">
                {allCategories.map((c) => <option key={c.cat_id} value={c.catName} />)}
              </datalist>
              <label>Skin Type</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="text"
                  name="skinType"
                  value={product.skinType}
                  onChange={handleChange}
                  placeholder="e.g. Oily, Dry"
                  style={{ width: "300px" }}
                />
                <button
                  type="button"
                  title="Show available skin types"
                  onClick={() => setShowSkinTypeList(prev => !prev)}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: "18px",
                    color: "#333"
                  }}
                >
                  ℹ️
                </button>

                {showSkinTypeList && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      marginTop: "5px",
                      backgroundColor: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: "10px",
                      padding: "12px 16px",
                      maxHeight: "200px",
                      overflowY: "auto",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      zIndex: 1000,
                      width: "320px",
                      fontFamily: "inherit"
                    }}
                  >
                    <p style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "14px" }}>Available Skin Types:</p>
                    <ul style={{ padding: 0, margin: 0, listStyleType: "none" }}>
                      {allSkinTypes.map((skt, index) => (
                        <li
                          key={skt.skt_id}
                          style={{
                            padding: "6px 8px",
                            backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                            borderRadius: "6px",
                            marginBottom: "5px",
                            fontSize: "13.5px"
                          }}
                        >
                          {skt.sktName}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <label>PAO</label>
              <input type="text" name="PAO" value={product.PAO} onChange={handleChange} placeholder="e.g. 12 M or Not Avaliable" />
              <label>FDA</label>
              <input type="text" name="FDA" value={product.FDA} onChange={handleChange} placeholder="XX-X-XXXXXXXXXX or Not Avaliable" />
              <label>Size</label>
              <input
                type="text"
                name="size"
                list="sizeList"
                value={product.size}
                onChange={handleChange}
                placeholder="e.g. 50 ml"
              />
              <datalist id="sizeList">
                {allSizes.map((size, idx) => (
                  <option key={idx} value={`${size.volumn} ${size.unit}`} />
                ))}
              </datalist>
              <label>Price</label>
              <input type="text" name="price" value={product.price} onChange={handleChange} placeholder="Price" />
            </form>
            <form className={styles.fulltext} onSubmit={handleSubmit}>
              <div className={styles.Description}>
                <label>Product Description</label>
                <textarea name="description" value={product.description} onChange={handleChange} placeholder="Enter product details..." className={styles.textarea}></textarea>
              </div>
              <div className={styles.Usage}>
                <label>Usage</label>
                <textarea name="usage" value={product.usage} onChange={handleChange} placeholder="Enter usage instructions..." className={styles.textarea}></textarea>
              </div>

              <div className={styles.ingredientSection}>
                <h4>Ingredients</h4>
                <ul>
                  {selectedIngredients.map((ing) => (
                    <li key={ing.ingd_id}>
                      {ing.ingdName}
                      <button type="button" onClick={() => setSelectedIngredients(selectedIngredients.filter(i => i.ingd_id !== ing.ingd_id))}>❌</button>
                    </li>
                  ))}
                </ul>


                <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "10px" }}>
                  <select
                    value={selectedIngredient}
                    onChange={(e) => setSelectedIngredient(e.target.value)}
                  >
                    <option value="">Select Ingredient</option>
                    {allIngredients
                      .filter(ing => !selectedIngredients.some(i => i.ingd_id === ing.ingd_id))
                      .map((ing) => (
                        <option key={ing.ingd_id} value={ing.ingd_id}>
                          {ing.ingdName}
                        </option>
                      ))}
                  </select>


                  <button
                    type="button"
                    onClick={() => {
                      const found = allIngredients.find(i => i.ingd_id === selectedIngredient);
                      if (found) {
                        setSelectedIngredients([...selectedIngredients, found]);
                        setSelectedIngredient("");
                      }
                    }}
                    disabled={!selectedIngredient}
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className={styles.image}>
                <label>Image</label>

                {!preview && (
                  <div className={styles.drop} onDrop={handleDrop} onDragOver={handleDragOver} onClick={triggerFileInput}>
                    <div className={styles.borderImage}>
                      <svg width="45" height="40" viewBox="0 0 75 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M38.0255 25.6974C37.9631 25.6176 37.8833 25.5531 37.7923 25.5088C37.7012 25.4644 37.6013 25.4414 37.5 25.4414C37.3988 25.4414 37.2988 25.4644 37.2078 25.5088C37.1168 25.5531 37.037 25.6176 36.9746 25.6974L27.6336 37.5155C27.5566 37.6138 27.5088 37.7318 27.4957 37.8561C27.4826 37.9803 27.5047 38.1057 27.5595 38.2179C27.6143 38.3301 27.6996 38.4247 27.8056 38.4907C27.9116 38.5568 28.0341 38.5916 28.159 38.5914H34.3224V58.8081C34.3224 59.175 34.6227 59.4753 34.9896 59.4753H39.9938C40.3607 59.4753 40.661 59.175 40.661 58.8081V38.5997H46.8411C47.3999 38.5997 47.7085 37.9575 47.3665 37.5238L38.0255 25.6974Z" fill="black" />
                        <path d="M62.4706 17.9994C58.6508 7.92439 48.9177 0.76014 37.5167 0.76014C26.1156 0.76014 16.3825 7.91605 12.5627 17.991C5.41513 19.8676 0.135769 26.3813 0.135769 34.121C0.135769 43.337 7.60027 50.8015 16.8079 50.8015H20.1523C20.5193 50.8015 20.8195 50.5012 20.8195 50.1343V45.1301C20.8195 44.7632 20.5193 44.4629 20.1523 44.4629H16.8079C13.9972 44.4629 11.3534 43.3453 9.38508 41.3186C7.42512 39.3003 6.3826 36.5814 6.47434 33.7624C6.5494 31.5606 7.30002 29.4922 8.65948 27.7491C10.0523 25.9726 12.0039 24.6799 14.1724 24.1044L17.3333 23.2787L18.4926 20.2262C19.2099 18.3247 20.2107 16.5482 21.4701 14.9385C22.7134 13.3431 24.1861 11.9406 25.8403 10.7767C29.2682 8.36642 33.3048 7.09037 37.5167 7.09037C41.7285 7.09037 45.7651 8.36642 49.193 10.7767C50.8527 11.9444 52.3205 13.3455 53.5632 14.9385C54.8226 16.5482 55.8234 18.333 56.5407 20.2262L57.6916 23.2704L60.8443 24.1044C65.3647 25.3221 68.5256 29.4338 68.5256 34.121C68.5256 36.8816 67.4497 39.4838 65.4981 41.4354C64.541 42.3981 63.4025 43.1614 62.1484 43.6811C60.8943 44.2007 59.5496 44.4665 58.1921 44.4629H54.8476C54.4807 44.4629 54.1804 44.7632 54.1804 45.1301V50.1343C54.1804 50.5012 54.4807 50.8015 54.8476 50.8015H58.1921C67.3997 50.8015 74.8642 43.337 74.8642 34.121C74.8642 26.3896 69.6015 19.8843 62.4706 17.9994Z"
                          fill="black" />
                      </svg>
                      <p>Drag and drop your file here</p>
                      <p>or</p>
                      <button type="button" className={styles.uploadButton}>
                        Upload Image
                      </button>
                      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} />
                    </div>
                  </div>
                )}

                {preview && (
                  <div className={styles.preview}>
                    <div className={styles.borderImage}>
                      <img src={preview} alt="Preview" className={styles.imagePreview} />
                      <p className={styles.fileName}>{selectedFile?.name}</p>
                      <button type="button" onClick={() => { setSelectedFile(null); setPreview(null); }} className={styles.removeButton} >
                        Remove Image
                      </button>
                    </div>
                  </div>
                )}

              </div>
              <div className={styles.save}>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      </div >
    </div >
  );
}

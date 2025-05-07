import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "/styles/admin/adminReview.module.css";
import Link from "next/link";
import NavBar from "/components/NavBar";
import AdminBar from "./adminBar";
import Footer from "/components/Footer";

export default function AdminReview() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/product/api_product");
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      if (Array.isArray(data.mysqlData) && data.mysqlData.length > 0) {
        setProducts(data.mysqlData);
      } else {
        console.warn("⚠ No products found in API response.");
      }
    } catch (error) {
      console.error("❌ Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [])

  const filteredProducts = products.filter(product =>
    product.pd_id.toLowerCase().includes(query) ||
    product.name.toLowerCase().includes(query)
  );

  return (
    <div className={styles.main}>
      <NavBar />

      <div className={styles.body}>
        <AdminBar />

        <div className={styles.userManage}>
          <h2> User Review Management </h2>

          <div className={styles.head}>
            <h2> All Product </h2>
          </div>


          <div className={styles.productList}>

            <div className={styles.searchBox}>
              <img src="\image\search.png" alt="search" style={{ height: "17px" }} />
              <input
                type="text"
                placeholder="Search by ID or Name"
                onChange={(e) => setQuery(e.target.value.toLowerCase())}
                style={{ border: "none", outline: "none" }}
              />
            </div>

            <div className={styles.gridHeader}>
              <h3>Product</h3>
              <h3>Brand</h3>
              <h3>Category</h3>
              <h3>Size</h3>
              <h3>Price</h3>
              <h3>Actions</h3>
            </div>

            {Array.isArray(filteredProducts) && filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div className={styles.gridRow} key={product.pd_id}>
                  <div className={styles.productImage}>
                    <img src={product?.photo || "/image/notfoundProduct.png"} alt={product.name} style={{ width: "80px", height: "75px", marginLeft: "20px", marginRight: "20px" }} />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "12px", color: "#888", fontWeight: "bold" }}>
                        {product.pd_id}
                      </span>
                      <span style={{ fontSize: "14px", fontWeight: "normal" }}>
                        {product.name}
                      </span>
                    </div>
                  </div>
                  <p>{product.brand}</p>
                  <p>{product.category}</p>
                  <p>{product.size ? product.size : "N/A"}</p>
                  <p>{product.price ? `฿${parseFloat(product.price).toFixed(2)}` : "Not Available"}</p>
                  <div className={styles.editProduct}>
                    <button onClick={() => router.push(`/admin/adminEditReview?pdid=${product.pd_id}`)}>
                      <img src="/image/viewIcon.png" style={{ width: '20px', height: '25px', marginRight: '10px' }}></img>
                      View
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>⚠ No products available.</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "/styles/admin/adminProduct.module.css";
import Link from "next/link";
import NavBar from "/components/NavBar";
import AdminBar from "./adminBar";
import Footer from "/components/Footer";

export default function AdminProduct() {
    const [products, setProducts] = useState([]);
    const [query, setQuery] = useState("");
    const router = useRouter();

    const handleEditClick = (pdid) => {
        router.push(`/admin/adminEditProduct?pdid=${pdid}`); 
    };

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

                <div className={styles.AllProduct}>

                    <div className={styles.head}>
                        <h2> Product Management </h2>
                        <button>
                            <Link href="/admin/adminAddProduct">
                                <svg width="12" height="13" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13.9286 8.57143H8.57143V13.9286C8.57143 14.2127 8.45855 14.4853 8.25761 14.6862C8.05668 14.8871 7.78416 15 7.5 15C7.21584 15 6.94332 14.8871 6.74239 14.6862C6.54145 14.4853 6.42857 14.2127 6.42857 13.9286V8.57143H1.07143C0.787268 8.57143 0.514746 8.45855 0.313814 8.25762C0.112883 8.05668 0 7.78416 0 7.5C0 7.21584 0.112883 6.94332 0.313814 6.74239C0.514746 6.54145 0.787268 6.42857 1.07143 6.42857H6.42857V1.07143C6.42857 0.787268 6.54145 0.514746 6.74239 0.313814C6.94332 0.112882 7.21584 0 7.5 0C7.78416 0 8.05668 0.112882 8.25761 0.313814C8.45855 0.514746 8.57143 0.787268 8.57143 1.07143V6.42857H13.9286C14.2127 6.42857 14.4853 6.54145 14.6862 6.74239C14.8871 6.94332 15 7.21584 15 7.5C15 7.78416 14.8871 8.05668 14.6862 8.25762C14.4853 8.45855 14.2127 8.57143 13.9286 8.57143Z" fill="black" />
                                </svg>

                            </Link>

                            <Link href="/admin/adminAddProduct"> Add </Link>
                        </button>
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

                        {filteredProducts.length > 0 ? (
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
                                        <button onClick={() => handleEditClick(product.pd_id)}>
                                            <svg width="17" height="19" viewBox="0 0 17 17" fill="red" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M9.83073 2.6263C10.6606 1.79644 12.0061 1.79644 12.8359 2.6263L14.3741 4.1645C15.204 4.99437 15.204 6.33984 14.3741 7.1697L6.87587 14.668C6.74303 14.8008 6.56286 14.8754 6.375 14.8754H2.83333C2.44213 14.8754 2.125 14.5583 2.125 14.1671V10.6254C2.125 10.4376 2.19963 10.2574 2.33247 10.1246L9.83073 2.6263Z" fill="black" />
                                            </svg>
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>⚠ No matching products found.</p>
                        )}
                    </div>
                </div>

            </div>
            <Footer />
        </div>
    );
}

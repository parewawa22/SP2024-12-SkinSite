import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "../styles/compare/compare.module.css";
import { useRouter } from "next/router";
import Footer from "/components/Footer";
import { getLoggedInUserId, getLoggedInUserRole } from "../utils/auth";
import NavBar from "/components/NavBar";

export default function Compare() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [products, setProducts] = useState([]);
    const [productWarnings, setProductWarnings] = useState({});
    const [alertMessage, setAlertMessage] = useState("");

    const accid = getLoggedInUserId();
    const role = getLoggedInUserRole();
    const profileLink = accid
        ? (role === "Admin" ? "/admin/adminAccount" : "/account")
        : "/login";

    useEffect(() => {
        fetchProducts();

        // Reset comparison data when component mounts
        const resetComparison = () => {
            setSelectedProducts([]);
            setSearchTerm("");
            setFilteredProducts([]);
        };

        resetComparison();

        // Handle preselected product from URL
        const handlePreselectedProduct = async () => {
            const preselectedId = router.query.preselect;
            if (preselectedId) {
                try {
                    const response = await fetch(`/api/product/api_product?pdid=${preselectedId}`);
                    const data = await response.json();
                    if (data.product) {
                        setSelectedProducts([data.product]);
                    }
                } catch (error) {
                    console.error("Error fetching preselected product:", error);
                }
            }
        };

        if (router.isReady) {
            handlePreselectedProduct();
        }
    }, [router.isReady, router.query.preselect]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(`.${styles.box}`)) {
                setFilteredProducts([]);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        return () => {
            setSelectedProducts([]);
            setSearchTerm("");
            setFilteredProducts([]);
        };
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/product/api_product');
            const data = await response.json();
            setProducts(data.mysqlData);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const fetchProductWarnings = async (productId) => {
        const accid = localStorage.getItem('user_acc_id');
        try {
            const response = await fetch(`/api/product/api_product_warnings?pdid=${productId}&accid=${accid}`);
            const data = await response.json();
            setProductWarnings(prev => ({ ...prev, [productId]: data }));
        } catch (error) {
            console.error('Error fetching warnings:', error);
        }
    };

    const handleSearchChange = (e) => {
        const searchValue = e.target.value.toLowerCase();
        setSearchTerm(searchValue);

        if (searchValue === "") {
            setFilteredProducts([]);
        } else {
            const filtered = products.filter((product) =>
                product.name.toLowerCase().includes(searchValue) ||
                product.brand.toLowerCase().includes(searchValue)
            );
            setFilteredProducts(filtered);
        }
    };

    // display dropdown when click search box
    const handleInputClick = () => {
        if (filteredProducts.length === 0) {
            setFilteredProducts(products);
        }
    };


    const handleSelectProduct = (product) => {
        if (selectedProducts.length < 3 && !selectedProducts.includes(product)) {
            setSelectedProducts([...selectedProducts, product]);
            fetchProductWarnings(product.pd_id); // Fetch warnings when product is selected
        }
        else if (selectedProducts.includes(product)) {
            setSelectedProducts(selectedProducts.filter((p) => p !== product));
        }
        setSearchTerm(""); // Clear search term after selecting a product
        setFilteredProducts([]); // Hide dropdown after selection
    };

    const handleRemoveProduct = (index) => {
        const updatedProducts = [...selectedProducts];
        updatedProducts.splice(index, 1);
        setSelectedProducts(updatedProducts);
    };

    const handleCompare = () => {
        const selectedIds = selectedProducts.map((product) => product.pd_id);
        if (selectedIds.length < 2) {
            setAlertMessage("Please select at least 2 products to compare.");
            return;
        }

        // Clear alert and proceed
        setAlertMessage("");
        localStorage.setItem('comparedProducts', JSON.stringify(selectedIds));
        router.push(`/compareResult?products=${selectedIds.join(",")}`);
        setSelectedProducts([]);
        setSearchTerm("");
        setFilteredProducts([]);
    };

    return (
        <div className={styles.container}>
            <NavBar />

            <main className={styles.content}>
                <h1>Product Compare</h1>
                <p>Add up to 3 products below to start comparison.</p>
                <div className={styles.box}>
                    <div className={styles.searchBox}>
                        <input type="text" placeholder="Search product..." value={searchTerm} onChange={handleSearchChange} onClick={handleInputClick} />
                        <button>
                            <img src="/image/search.png" alt="Search" width={15} height={15}></img>
                        </button>
                    </div>

                    {filteredProducts.length > 0 && (
                        <ul className={styles.searchDropdown}>
                            {filteredProducts.map((product) => (
                                <li key={product.pd_id} onClick={() => handleSelectProduct(product)}>
                                    <img src={product.photo || "/image/ProductImage/notfoundProduct.png"} alt={product.name} width={40} height={40} style={{ borderRadius: '5px' }} />
                                    <div className={styles.productInfo}>
                                        <span>{product.name}</span>
                                        <span>{product.brand}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <p className={styles.selectionInfo}>
                    {`Selected ${selectedProducts.length} of 3 products`}
                </p>

                <div className={styles.listProducts}>
                    {selectedProducts.map((product, index) => (
                        <div key={index} className={styles.productBox}>
                            <div className={styles.productContent}>
                                <img
                                    src={product.photo || "/image/ProductImage/notfoundProduct.png"}
                                    alt={product.name}
                                    width={80}
                                    height={80}
                                />
                                <div>
                                    {productWarnings[product.pd_id]?.hasWarning && (
                                        <span className={styles.warningIcon}>⚠️</span>
                                    )}
                                    <div className={styles.info}>
                                        <div className={styles.name}>{product.name}</div>
                                        <div className={styles.brand}>{product.brand}</div>
                                    </div>
                                </div>
                            </div>
                            <button
                                className={styles.removeButton}
                                onClick={() => handleRemoveProduct(index)}
                            >
                                ✖
                            </button>
                        </div>
                    ))}
                </div>
                <button className={styles.compareButton} onClick={handleCompare}>Compare</button>
                {alertMessage && (
                    <p style={{ color: "red", marginTop: "10px", fontWeight: "bold" }}>
                        {alertMessage}
                    </p>
                )}
            </main>
            <Footer />
        </div>
    );
}

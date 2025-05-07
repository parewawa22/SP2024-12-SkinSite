import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import NavBar from "/components/NavBar";
import Footer from "/components/Footer";
import SearchBox from "/components/SearchBox"
import Link from "next/link";

export default function SearchPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [skinTypes, setSkinTypes] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [concerns, setConcerns] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState([]);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [bookmarkedProducts, setBookmarkedProducts] = useState({});
  const [productWarnings, setProductWarnings] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [checkedFilters, setCheckedFilters] = useState({});
  const [wishlistLoaded, setWishlistLoaded] = useState(false);
  const [sortOption, setSortOption] = useState("az");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // filter
  const [openSections, setOpenSections] = useState({
    category: false,
    skinType: false,
    concern: false,
    brand: false,
    benefit: false
  });

  useEffect(() => {
    applyFilters(); 
  }, [searchTerm, filters, sortOption]);

  useEffect(() => {
    fetchData("/api/product/api_categories", setCategories);
    fetchData("/api/skintype/api_skintypes", setSkinTypes);
    fetchData("/api/product/api_benefit", setBenefits);
    fetchData("/api/product/api_concern", setConcerns);
    fetchData("/api/product/api_brands", setBrands);
  }, []);

  useEffect(() => {
    const fetchWishlist = async () => {
      const accid = localStorage.getItem("user_acc_id");
      console.log("🔍 Fetching wishlist for accid:", accid);
      if (!accid) return;
  
      try {
        const res = await fetch(`/api/api_wishlist?accid=${accid}`);
        const json = await res.json();
  
        if (!Array.isArray(json.data)) {
          console.warn("⚠️ Wishlist API response is not valid:", json);
          return;
        }
  
        // Set bookmarked state
        const bookmarks = {};
        json.data.forEach((item) => {
          console.log("✅ Wishlist item found:", item.pd_id);
          bookmarks[item.pd_id] = true;
        });
  
        setBookmarkedProducts(bookmarks);
        console.log("✅ Bookmarked products state:", bookmarks);
      } catch (err) {
        console.error("❌ Failed to load wishlist:", err);
      } finally {
        setWishlistLoaded(true);
      }
    };
  
    fetchWishlist();
  }, []);
  
  // sort function
  useEffect(() => {
    let sortedProducts = [...products];
  
    switch (sortOption) {
      case "az": // a-z
        sortedProducts.sort((a, b) => a.pdName.localeCompare(b.pdName));
        break;
      case "za": // z-a
        sortedProducts.sort((a, b) => b.pdName.localeCompare(a.pdName));
        break;
      case "lowprice":
        sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "highprice":
        sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "rating":
        sortedProducts.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
        break;
      case "reviewCount":
        sortedProducts.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;

      default:
        break;
    }
  
    setProducts(sortedProducts);
  }, [sortOption, products.length]);

  const fetchData = async (endpoint, setter) => {
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      setter(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      setter([]);
    }
  };

  const toggleBookmark = async (pdid) => {
    const accid = localStorage.getItem("user_acc_id");
    if (!accid) return;

    const isBookmarked = bookmarkedProducts[pdid];

    try {
      if (isBookmarked) {
        await fetch("/api/api_wishlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accid, pdid }),
        });
      } else {
        await fetch("/api/api_wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accid, pdid }),
        });
      }

      setBookmarkedProducts((prev) => ({
        ...prev,
        [pdid]: !isBookmarked,
      }));
    } catch (err) {
      console.error("Error toggling wishlist:", err);
    }
  };

  const updateFilters = (type, value) => {
    const keyword = value.trim();
    if (!keyword) return;

    const filterKey = `${type}:${keyword}`;
    setCheckedFilters(prev => ({ ...prev, [filterKey]: true }));

    setFilters(prev => {
      const alreadyExists = prev.some(f => f.type === type && f.value.toLowerCase() === keyword.toLowerCase());
      if (alreadyExists) return prev;
      const newFilters = [...prev, { type, value: keyword }];
      applyFilters(newFilters); 
      return newFilters;
    });
  };

  const applyFilters = async (filtersOverride) => {
    try {
      const activeFilters = Array.isArray(filtersOverride) ? filtersOverride : filters;
      const keywords = [...activeFilters.map(f => f.value), searchTerm].join(" ");
      const sortParam = sortOption || ""; // new line

      const res = await fetch(`/api/api_search?query=${encodeURIComponent(keywords)}&sort=${sortParam}`);
      const data = await res.json();
      let filtered = Array.isArray(data) ? data : [];

      const groupedFilters = activeFilters.reduce((acc, filter) => {
        if (!acc[filter.type]) acc[filter.type] = [];
        acc[filter.type].push(filter.value);
        return acc;
      }, {});
      
      filtered = filtered.filter(product => {
        return (
          (!groupedFilters["Search"] || groupedFilters["Search"].every(keyword =>
            (product.pdName || "").toLowerCase().includes(keyword.toLowerCase()) ||
            (product.pdDescription || "").toLowerCase().includes(keyword.toLowerCase()) ||
            (product.catName || "").toLowerCase().includes(keyword.toLowerCase()) ||
            (product.brandName || "").toLowerCase().includes(keyword.toLowerCase()) ||
            (product.sktNames || "").toLowerCase().includes(keyword.toLowerCase()) ||
            (product.concernNames || "").toLowerCase().includes(keyword.toLowerCase()) ||
            (product.ingredientNames || "").toLowerCase().includes(keyword.toLowerCase()) ||
            (product.benefitNames || "").toLowerCase().includes(keyword.toLowerCase())
          )) &&
          (!groupedFilters["Category"] || groupedFilters["Category"].includes(product.catName)) &&
          (!groupedFilters["Skin Type"] || groupedFilters["Skin Type"].every(type =>
            (product.sktNames || "").split(",").includes(type)
          )) &&
          (!groupedFilters["Concern"] || groupedFilters["Concern"].every(concern =>
            (product.concernNames || "").split(",").includes(concern)
          )) &&
          (!groupedFilters["Brand"] || groupedFilters["Brand"].includes(product.brandName)) &&
          (!groupedFilters["Benefit"] || groupedFilters["Benefit"].every(benefit =>
            (product.benefitNames || "").split(",").includes(benefit)
          ))
        );
      });

      setProducts(filtered);
      filtered.forEach((p) => fetchProductWarnings(p.pd_id));
    } catch (err) {
      console.error("❌ Error applying filters:", err);
    }
  };

  const handleSortChange = (option) => {
    setSortOption(option);
  };

  // warning ingredient, concern
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

  const removeFilter = (type, value) => {
    const keyword = value.trim();
    if (!keyword) return;

    const filterKey = `${type}:${keyword}`;
    setCheckedFilters(prev => {
      const updated = { ...prev };
      delete updated[filterKey];
      return updated;
    });

    setFilters(prev => {
      const newFilters = prev.filter(f => !(f.type === type && f.value.toLowerCase() === keyword.toLowerCase()));
      applyFilters(newFilters);  // ✅ Update results instantly
      return newFilters;
    });
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };


    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);


  return (
    <div style={{ position: "relative", fontFamily: "'Inria Serif', serif", backgroundColor: "#f8f8f8" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inria+Serif:wght@300;400;700&display=swap" rel="stylesheet"></link>
      <NavBar />
      {/* side bar */}
      <div style={{ display: "flex", marginTop: "70px" }}>
        {/* Filter Section */}
        <div style={{
          display: isMobile ? (isFilterOpen ? 'block' : 'none') : 'block',
          width: "250px",
          background: "#fff",
          padding: "20px 24px",
          boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1)",
          height: "100vh",
          position: "sticky",
          top: "70px",
          borderRadius: "12px",
          overflowY: "auto",
          fontFamily: "'Poppins', sans-serif",
          zIndex: "10",
          position: isMobile ? "fixed" : "sticky",
          top: "70px", left: 0, right: 0, bottom: 0,
          backgroundColor: "#fff",
          zIndex: 50, overflowY: "auto",
          transition: "transform 0.3s ease-in-out",
        }}>
          {/* Category Filter */}
          <h3
            onClick={() => toggleSection('category')}
            style={{
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #F8D1D1, #F4E3C1)',
              color: '#333',
              padding: '14px 24px',
              margin: '12px 0',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              transition: '0.2s ease',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            Category
            <span style={{ fontSize: '18px' }}>
              {openSections.category ? '▲' : '▼'}
            </span>
          </h3>


          {openSections.category && (
            <div style={{
              padding: '10px 18px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              marginBottom: '16px',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
            }}>
              {categories.map((category) => (
                <button
                  key={category.cat_id}
                  onClick={() => {
                    const keyword = category.catName;
                    const filterKey = `Category:${keyword}`;
                    setCheckedFilters((prev) => ({ ...prev, [filterKey]: true }));

                    setFilters((prev) => {
                      const alreadyExists = prev.some(f => f.type === "Category" && f.value.toLowerCase() === keyword.toLowerCase());
                      if (alreadyExists) return prev;
                      const newFilters = [...prev, { type: "Category", value: keyword }];
                      applyFilters(newFilters);
                      return newFilters;
                    });
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '9px 15px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '15px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease',
                    margin: '6px 0',
                    color: '#555',
                    fontWeight: '500',
                    letterSpacing: '0.5px',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.textDecoration = 'underline';
                    e.target.style.color = '#FF7043';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.textDecoration = 'none';
                    e.target.style.color = '#555';
                  }}
                >
                  {category.catName}
                </button>
              ))}
            </div>
          )}

          {/* Skin Type Filter */}
          <h3
            onClick={() => toggleSection('skinType')}
            style={{
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #F8D1D1, #F4E3C1)',
              color: '#333',
              padding: '14px 24px',
              margin: '12px 0',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              transition: '0.2s ease',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            Skin Type
            <span style={{ fontSize: '18px' }}>
              {openSections.skinType ? '▲' : '▼'}
            </span>
          </h3>


          {openSections.skinType && (
            <div style={{
              padding: '10px 18px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              marginBottom: '16px',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
            }}>
              {skinTypes.map((skin) => {
                const key = `Skin Type:${skin.sktName}`;
                return (
                  <label key={skin.skt_id} style={{ display: "block", cursor: "pointer", marginBottom: "8px" }}>
                    <input
                      type="checkbox"
                      checked={checkedFilters[key] || false}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        if (isChecked) {
                          updateFilters("Skin Type", skin.sktName);
                          applyFilters(); // <-- add this
                        } else {
                          removeFilter("Skin Type", skin.sktName);
                          applyFilters();
                        }
                      }}
                      style={{
                        width: '18px',
                        height: '18px',
                        marginRight: '10px',
                        accentColor: '#FF7043',
                        cursor: 'pointer',
                      }}
                    />
                    {skin.sktName}
                  </label>
                );
              })}
            </div>
          )}

          {/* Preference Concern Filter */}
          <h3
            onClick={() => toggleSection('concern')}
            style={{
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #F8D1D1, #F4E3C1)',
              color: '#333',
              padding: '14px 24px',
              margin: '12px 0',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              transition: '0.2s ease',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            Preference Concern
            <span style={{ fontSize: '18px' }}>
              {openSections.concern ? '▲' : '▼'}
            </span>
          </h3>


          {openSections.concern && (
            <div style={{
              padding: '10px 18px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              marginBottom: '16px',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
            }}>
              {concerns.map((concern) => {
                const key = `Concern:${concern.concernName}`;
                return (
                  <label key={concern.concern_id} style={{ display: "block", cursor: "pointer", marginBottom: "8px" }}>
                    <input
                      type="checkbox"
                      checked={checkedFilters[key] || false}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        if (isChecked) {
                          updateFilters("Concern", concern.concernName);
                        } else {
                          removeFilter("Concern", concern.concernName);
                        }
                      }}
                      style={{
                        width: '18px',
                        height: '18px',
                        marginRight: '10px',
                        accentColor: '#FF7043',
                        cursor: 'pointer',
                      }}
                    />
                    {concern.concernName}
                  </label>
                );
              })}
            </div>
          )}

          {/* Brand Filter */}
          <h3
            onClick={() => toggleSection('brand')}
            style={{
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #F8D1D1, #F4E3C1)',
              color: '#333',
              padding: '14px 24px',
              margin: '12px 0',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              transition: '0.2s ease',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            Brand
            <span style={{ fontSize: '18px' }}>
              {openSections.brand ? '▲' : '▼'}
            </span>
          </h3>

          {openSections.brand && (
            <div style={{
              padding: '10px 18px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              marginBottom: '16px',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
            }}>
              {brands.map((brand) => {
                const key = `Brand:${brand.brandName}`;
                return (
                  <label key={brand.brand_id} style={{ display: "block", cursor: "pointer", marginBottom: "8px" }}>
                    <input
                      type="checkbox"
                      checked={checkedFilters[key] || false}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        if (isChecked) {
                          updateFilters("Brand", brand.brandName);
                        } else {
                          removeFilter("Brand", brand.brandName);
                        }
                      }}
                      style={{
                        width: '18px',
                        height: '18px',
                        marginRight: '10px',
                        accentColor: '#FF7043',
                        cursor: 'pointer',
                      }}
                    />
                    {brand.brandName}
                  </label>
                );
              })}
            </div>
          )}

          {/* Benefit Filter */}
          <h3
            onClick={() => toggleSection('benefit')}
            style={{
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #F8D1D1, #F4E3C1)',
              color: '#333',
              padding: '14px 24px',
              margin: '12px 0',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              transition: '0.2s ease',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            Benefit
            <span style={{ fontSize: '18px' }}>
              {openSections.benefit ? '▲' : '▼'}
            </span>
          </h3>

          {openSections.benefit && (
            <div
              style={{
                padding: '10px 18px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                marginBottom: '16px',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
              }}
            >
              {benefits.map((benefit) => {
                const key = `Benefit:${benefit.benefitName}`;
                return (
                  <label
                    key={benefit.benefit_id}
                    style={{
                      display: 'block',
                      cursor: 'pointer',
                      marginBottom: '8px',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checkedFilters[key] || false}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        if (isChecked) {
                          updateFilters("Benefit", benefit.benefitName);
                        } else {
                          removeFilter("Benefit", benefit.benefitName);
                        }
                      }}
                      style={{
                        width: '18px',
                        height: '18px',
                        marginRight: '10px',
                        accentColor: '#FF7043',
                        cursor: 'pointer',
                      }}
                    />
                    {benefit.benefitName}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Results Section */}
        <div style={{ flex: 1, padding: "20px" }}>
          {/* Filters Applied */}
          <div style={{ marginBottom: "10px" }}>
            <SearchBox
              onSearch={(keyword) => {
                const keywordTrimmed = keyword.trim();
                if (!keywordTrimmed) return;

                const newFilter = { type: "Search", value: keywordTrimmed };
                setFilters((prev) => {
                  const exists = prev.some(
                    (f) => f.type === "Search" && f.value.toLowerCase() === keywordTrimmed.toLowerCase()
                  );
                  const updated = exists ? prev : [...prev, newFilter];
                  applyFilters(updated); 
                  return updated;
                });
              }}
            />

            <div
              style={{
                // display: "flex", justifyContent: "space-between", paddingRight: "40px", paddingTop: "20px"
              }}
            >
              <div style={{ margin: "20px 0px" }}>
                <strong>Your Filters:</strong>
                {filters.map((filter, index) => (
                  <span key={index} style={{
                    margin: "5px",
                    padding: "5px",
                    background: "#eee",
                    borderRadius: "5px",
                    marginTop:"6px",
                    marginBottom:"6px",
                    display: "inline-flex",
                    alignItems: "start"
                  }}>
                    {filter.type}: {filter.value}
                    <button
                      onClick={() => removeFilter(filter.type, filter.value)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        marginLeft: "5px",
                        fontSize: "16px"
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label htmlFor="sort-select" style={{ marginRight: "10px" }}>Sort by:</label>
                <select id="sort-select" onChange={(e) => handleSortChange(e.target.value)} style={{ padding: "6px", borderRadius: "10px", borderColor: "rgb(212, 212, 212)" }}>
                  <option value="az">Name: A to Z</option>
                  <option value="za">Name: Z to A</option>
                  <option value="priceLow">Lowest to Price</option>
                  <option value="priceHigh">Highest Price</option>
                  <option value="rating">Score Rating</option>
                  <option value="reviewCount">Total Reviews</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product List */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            overflowY: "auto",
            height: "calc(100vh - 130px)",
            marginTop: isFilterOpen && isMobile ? '350px' : '0',
          }}>
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product.pd_id} style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #ddd",
                  padding: "12px 20px 12px 20px",
                  marginRight: "20px",
                  borderRadius: "10px",
                  background: "#fff",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  justifyContent: "space-between",
                  position: "relative"
                }}>
                  <div style={{ display: "flex", justifyItems: "start", gap: "24px" }}>
                    <Link href={`/productInfo?pdid=${product.pd_id}`} style={{ display: "flex", alignItems: "center" }}>
                      <img
                        src={product?.photo || `/image/ProductImage/${product.pd_id}.jpeg`}
                        alt="product"
                        style={{ width: '80px', height: '80px' }}
                      />
                    </Link>
                    <div>
                      <Link href={`/productInfo?pdid=${product.pd_id}`}>
                        <h5>{product.pdName || "No Name Available"}</h5>
                        <p style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}>
                          {product.pdDescription || "No Description Available"}
                        </p>

                    {/* ✅ Price Section */}
                    <p style={{ marginTop: "4px", fontWeight: "bold", color: "#444" }}>
                      {product.price ? `${Number(product.price).toFixed(2)} THB` : "No price available"}
                    </p>

                    {/* ⭐ Score Rating & Review Count */}
                    <p style={{ fontSize: "0.9em", color: "#666", marginTop: "2px" }}>
                      ⭐ {product.avgRating ? Number(product.avgRating).toFixed(1) : "N/A"} 
                      {" "}({product.reviewCount || 0} reviews)
                    </p>
                      </Link>
                    </div>
                  </div>
                  <div style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "90px"
                  }}>
                    {productWarnings[product.pd_id]?.hasWarning && (
                      <div style={{
                        fontSize: "1.4em",
                        color: "#ff4444"
                      }}>
                        ⚠️
                      </div>
                    )}
                    <button onClick={() => toggleBookmark(product.pd_id)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                      {wishlistLoaded && (
                        <Image
                          src={ bookmarkedProducts[product.pd_id] ? "/image/clickbookmark.png" : "/image/bookmark.png" }
                          alt="Bookmark"
                          width={17}
                          height={23}
                        />
                      )}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No products found</p>
            )}
          </div>
        </div>
        {isMobile && (
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            style={{
              position: "fixed",
              bottom: "0", left: "0", right: "0",
              background: 'linear-gradient(135deg, #F8D1D1, #F4E3C1)',
              color: "black",
              fontFamily: "'Inria Serif', sans-serif",
              fontWeight: "bold",
              padding: "15px 0", fontSize: "18px",
              border: "none", borderRadius: "0",
              cursor: "pointer", zIndex: 100
            }}
          >
            {isFilterOpen ? "Close Filters" : "Open Filters"}
          </button>
        )}
      </div>
      <Footer />
    </div>
  );
}

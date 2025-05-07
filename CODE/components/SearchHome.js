import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router"; 

export default function SearchHome({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      if (!searchQuery.trim()) {
        setFilteredProducts([]);
        return;
      }

      try {
        const res = await fetch(`/api/product/api_product`); 
        const data = await res.json();

        if (Array.isArray(data.mysqlData)) {
          const filtered = data.mysqlData.filter((product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.brand.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setFilteredProducts(filtered); 
          onSearch(filtered, searchQuery);  
        } else {
          setFilteredProducts([]);
          console.error("Unexpected response format:", data);
        }
      } catch (err) {
        console.error("Search error:", err);
        setFilteredProducts([]);
      }
    };

    fetchProducts();
  }, [searchQuery, onSearch]);

  const handleSelectProduct = (productId) => {
    router.push(`/productInfo?pdid=${productId}`);
  };

  return (
    <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
      <div
        style={{
          display: "inline-flex",
          marginTop: "20px",
          alignItems: "center",
          backgroundColor: "white",
          border: "2px solid #fff",
          borderRadius: "25px",
          padding: "1px 15px",
          width: "100%",
        }}
      >
        <input
          type="text"
          placeholder="Search product name only"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} 
          style={{
            flex: 1,
            border: "1px solid #ffffff",
            outline: "none",
            fontSize: "1rem",
            color: searchQuery ? "black" : "black",
            fontFamily: "Inria Serif, serif",
            padding: "10px",
          }}
        />
        <button
          type="submit"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image src="/image/search.png" alt="Search Icon" width={14.55} height={14.55} />
        </button>
      </div>

      {filteredProducts.length > 0 && (
        <ul
          style={{
            position: "absolute",
            width: "88%",
            background: "white",
            border: "1px solid #D6D6D6",
            borderRadius: "10px",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
            maxHeight: "200px",
            overflowY: "auto",
            zIndex: "10",
            listStyle: "none",
            margin: "0",
            padding: "5px 0",
          }}
        >
          {filteredProducts.map((product) => (
            <li
              key={product.pd_id}
              onClick={() => handleSelectProduct(product.pd_id)} 
              style={{
                padding: "10px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
                transition: "background-color 0.2s ease",
              }}
            >
              <img
                src={product.photo || "/image/ProductImage/notfoundProduct.png"}
                alt={product.name}
                width={40}
                height={40}
                style={{ borderRadius: "5px" }}
              />
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", color:"black"}}>
                <span style={{
                    display: "inline-block",
                    maxWidth: "350px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontSize: "14px"
                  }}>
                  {product.name}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
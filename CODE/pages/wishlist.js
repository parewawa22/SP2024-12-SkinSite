import { useState, useEffect } from "react";
import styles from '/styles/wishlist.module.css';
import Link from "next/link";
import UserBar from "/components/UserSidebar";
import { useRouter } from "next/router";
import NavBar from "/components/NavBar";
import Footer from "/components/Footer";

export default function account() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [warnings, setWarnings] = useState({});

  const router = useRouter();

  const accid = typeof window !== "undefined" ? localStorage.getItem("user_acc_id"): null;

  useEffect(() => {
    if (!accid) {
      console.error("User not logged in.");
      setLoading(false);
      return;
    }

    console.log("Fetching wishlist for accid:", accid);
    fetchProducts();
  }, [accid]);

  // product
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/api_wishlist?accid=${accid}&_=${timestamp}`);

      // Parse the JSON response
      const data = await response.json();

      // Check for API error responses
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch wishlist');
      }

      // Validate the data structure
      if (!data.data || !Array.isArray(data.data)) {
        console.error("Invalid data format received:", data);
        setWishlist([]);
        return;
      }

      // Update wishlist state with the received data
      setWishlist(data.data);

      // Fetch warnings for each product
      data.data.forEach(product => {
        fetchProductWarnings(product.pd_id);
      });

    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setWishlist([]);
      alert("Could not load wishlist. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  //remove product in wishlist
  const handleRemoveFromWishlist = async (accid, pdid) => {
    try {
      const response = await fetch(
        `/api/api_wishlist?accid=${accid}&pdid=${pdid}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove from wishlist');
      }

      // Remove item from local state
      setWishlist(prevItems =>
        prevItems.filter(item => item.pd_id !== pdid)
      );

    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  // Add this function to fetch warnings
  const fetchProductWarnings = async (productId) => {
    const accid = localStorage.getItem('user_acc_id');
    try {
      const response = await fetch(`/api/product/api_product_warnings?pdid=${productId}&accid=${accid}`);
      const data = await response.json();
      setWarnings(prev => ({ ...prev, [productId]: data }));
    } catch (error) {
      console.error('Error fetching warnings:', error);
    }
  };

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const filteredWishlist = wishlist.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.main}>
      <NavBar />
      <div className={styles.mobileUserBarToggle}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>User Bar ▾</button>
      </div>
      <div className={styles.body}>
        {/* <UserBar/> */}
        {(sidebarOpen || isDesktop) && <UserBar />}

        <div className={styles.content}>
          <h2> My Wishlist </h2>

          <div className={styles.searchBox}>
          <input 
              type="text" 
              placeholder="Search" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
            <button>
              <img src="/image/search.png" alt="search" style={{ width: '25px', height: '25px', marginRight: '10px' }} />
            </button>
          </div>

          <div className={styles.productList}>
            {filteredWishlist.length > 0 ? (
              filteredWishlist.map((item) => (
                <div key={item.pd_id} className={styles.wishlistItem}>
                  <Link href={`/productInfo?pdid=${item.pd_id}`}>
                    <img src={item?.photo || "/image/ProductImage/notfoundProduct.png"} alt="product" style={{ width: '80px', height: '80px' }} />
                  </Link>

                  <div className={styles.productInfo}>
                    <Link href={`/productInfo?pdid=${item.pd_id}`}>
                      <h5>{item.name || "No Name Available"} </h5>
                      <p> {item.description?.length > 100 ? item.description.substring(0, 100) + "..." : item.pdDescription} </p>
                      <p> {item.price} THB </p>
                    </Link>
                  </div>

                  <div className={`${styles.flagIcon} ${styles.saved}`} onClick={() => handleRemoveFromWishlist(accid, item.pd_id)}>
                    <svg width="20" height="20" viewBox="0 0 27 34" xmlns="http://www.w3.org/2000/svg">
                      <path d="M26.5 4.65202V33.2417L13.6886 28.0223L13.5 27.9454L13.3113 28.0223L0.5 33.2417V4.65202C0.5 3.78594 0.817895 3.05265 1.47818 2.42603C2.13967 1.79828 2.92367 1.48649 3.85744 1.48535H23.1429C24.0778 1.48535 24.8621 1.79707 25.5234 2.42574C26.184 3.05367 26.5011 3.78691 26.5 4.65138V4.65202Z" fill="#FF8C8C" stroke="#EB4848" />
                    </svg>
                  </div>
                </div>
              ))
            ) : (
              <p>No products found in your wishlist.</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

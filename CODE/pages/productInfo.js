import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from '/styles/productInfo.module.css'; 
import Link from "next/link";
import NavBar from "/components/NavBar";
import Footer from "/components/Footer";
import { calculateProductScore } from '../utils/calculateScore';

export default function ProductInfo() {
  const router = useRouter();
  const { pdid } = router.query;

  const [account, setAccount] = useState(null);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [concerns, setConcerns] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("detail");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 10;

  const [rating, setRating] = useState(["5"]);
  const [reviewText, setReviewText] = useState("");
  const [productScore, setProductScore] = useState({ score: 0, grade: 'N/A' });
  const [userSkinType, setUserSkinType] = useState('Normal-Oily'); 

  const [isInWishlist, setIsInWishlist] = useState(false);

  const [comparedProducts, setComparedProducts] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const [skinTypes, setSkinTypes] = useState([]);

  // Add state for warnings
  const [warnings, setWarnings] = useState({ concerns: [], allergens: [], hasWarning: false });

  // Add account loading state
  const [isAccountLoaded, setIsAccountLoaded] = useState(false);

  useEffect(() => {
    const storedAccId = localStorage.getItem('user_acc_id');
    setAccount(storedAccId);
    const userAccount = localStorage.getItem("user_acc_id");
    if (userAccount) {
      setAccount(userAccount);
    }
    setIsAccountLoaded(true);
  }, []);


  // Add this function to fetch user skin type
  const fetchUserSkinType = async (accId) => {
    if (!accId) {
      console.warn('No account ID provided for skin type fetch');
      return;
    }

    try {
      const response = await fetch(`/api/user/skintype?accId=${accId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch skin type');
      }
      const data = await response.json();
      setUserSkinType(data.skinType);
    } catch (error) {
      console.error('Error fetching user skin type:', error);
      setUserSkinType('Normal'); // Fallback to default
    }
  };

  // Add this function after your existing useState declarations
  const calculateRiskCounts = (ingredients) => {
    return ingredients.reduce((counts, ing) => {
      if (ing.risk === null) {
        counts.unknown++;
      } else if (ing.risk <= 2) {
        counts.low++;
      } else if (ing.risk <= 6) {
        counts.moderate++;
      } else {
        counts.high++;
      }
      return counts;
    }, { low: 0, moderate: 0, high: 0, unknown: 0 });
  };

  // Update the checkWishlistStatus function
  const checkWishlistStatus = async () => {
    try {
      const accid = localStorage.getItem('user_acc_id');

      if (!accid || !pdid) {
        console.error('Missing required parameters');
        return;
      }

      const response = await fetch(`/api/api_wishlist?` + new URLSearchParams({
        accid: accid,
        pdid: pdid
      }));

      const data = await response.json();
      setIsInWishlist(data.isInWishlist);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const toggleWishlist = async () => {
    try {
      const accid = localStorage.getItem('user_acc_id');

      if (!accid) {
        alert('Please login to use wishlist features');
        return;
      }

      if (!pdid) {
        console.error('Product ID is missing');
        return;
      }

      // If removing from wishlist (DELETE request)
      if (isInWishlist) {
        const response = await fetch(`/api/api_wishlist?accid=${accid}&pdid=${pdid}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to remove from wishlist');
        }

        // If adding to wishlist (POST request)
      } else {
        const response = await fetch('/api/api_wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            accid: accid,
            pdid: pdid
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to add to wishlist');
        }
      }

      // Toggle the wishlist state only if the request was successful
      setIsInWishlist(!isInWishlist);

    } catch (error) {
      console.error('Wishlist operation failed:', error);
      alert(error.message);
    }
  };

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const paginatedReviews = reviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  useEffect(() => {
    if (!router.isReady || !isAccountLoaded) return;

    const fetchData = async () => {
      try {
        // Only fetch user skin type if we have an account
        if (account) {
          await fetchUserSkinType(account);
        } else {
          console.log('No account found, using default skin type');
          setUserSkinType('Normal');
        }

        // Fetch other product data
        await Promise.all([
          fetchProductDetails(pdid),
          fetchIngredients(pdid),
          fetchReviews(pdid),
          checkWishlistStatus()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [router.isReady, isAccountLoaded, account, pdid]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    console.log("Submit Review Debug:", {
      pdid,
      accid: account,
      scoreRating: rating,
      textReview: reviewText
    });

    if (!account || !pdid || !rating) {
      alert("Register before Write a review.");
      return;
    }

    try {
      const res = await fetch("/api/review/api_rvsave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdid,
          accid: account,
          scoreRating: parseInt(rating),
          textReview: reviewText
        }),
      });

      if (!res.ok) throw new Error("Failed to submit review");

      setIsReviewModalOpen(false);
      setRating("5");
      setReviewText("");

      fetchReviews(pdid);
    } catch (err) {
      alert("Error submitting review: " + err.message);
    }
  };

  const fetchProductDetails = async (pdid) => {
    if (!pdid) return;

    try {
      const response = await fetch(`/api/product/api_product?pdid=${pdid}`);
      if (!response.ok) throw new Error("Failed to fetch product");

      const data = await response.json();
      setProduct(data.product);

      setConcerns(data.product.concerns ? data.product.concerns.split(', ') : []);
      setBenefits(data.product.benefits ? data.product.benefits.split(', ') : []);

      // Extract product skin types
      const skinTypesArray = data.product.skinTypes?.split(',').map(type => type.trim()) || [];
      setSkinTypes(skinTypesArray);
    } catch (err) {
      console.error("Error fetching product:", err);
      setError(err.message);
    }
  };

  const fetchReviews = async (pdid) => {
    try {
      const response = await fetch(`/api/review/api_review?pdid=${pdid}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setReviews(data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to load reviews.");
    }
  };

  const fetchIngredients = async (pdid) => {
    try {
      const response = await fetch(`/api/product/api_ingredients?pdid=${pdid}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setIngredients(data.ingredients || []);
    } catch (err) {
      console.error("Error fetching ingredients:", err);
      setError("Failed to load ingredients.");
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (score) => {
    if (score >= 81) return styles.darkGreen;
    if (score >= 61) return styles.lightGreen;
    if (score >= 41) return styles.yellow;
    if (score >= 21) return styles.orange;
    return styles.red;
  };

  const getGradeText = (score) => {
    if (score >= 81) return 'A';
    if (score >= 61) return 'B';
    if (score >= 41) return 'C';
    if (score >= 21) return 'D';
    return 'E';
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, r) => sum + r.scoreRating, 0);
    return (total / reviews.length).toFixed(1);
  };

  // Update the handleCompareClick function
  const handleCompareClick = () => {
    const existingCompared = JSON.parse(localStorage.getItem('comparedProducts') || '[]');

    // Check if product is already in comparison
    if (existingCompared.includes(pdid)) {
      alert('This product is already in your comparison list.');
      return;
    }

    if (existingCompared.length === 0) {
      // First product - just add to list and stay on page
      const newCompared = [pdid];
      localStorage.setItem('comparedProducts', JSON.stringify(newCompared));
      alert('Product added for comparison. Select another product to compare.');
    }
    else if (existingCompared.length === 1) {
      // Second product - show confirmation modal
      setShowCompareModal(true);
    }
    else if (existingCompared.length === 2) {
      // Third product - add, navigate to comparison, and clear list
      const newCompared = [...existingCompared, pdid];
      localStorage.setItem('comparedProducts', JSON.stringify(newCompared));
      router.push({
        pathname: '/compareResult',
        query: { products: newCompared.join(',') }
      }).then(() => {
        // Clear comparison list after navigation
        localStorage.removeItem('comparedProducts');
      });
    }
    else {
      // If already have 3 products, clear previous and start new comparison
      localStorage.setItem('comparedProducts', JSON.stringify([pdid]));
      alert('Starting new comparison with this product. Select another product to compare.');
    }
  };

  // Modify the fetchSkinTypes function to handle errors without throwing
  const fetchSkinTypes = async () => {
    if (!pdid) return;

    try {
      const response = await fetch(`/api/skintype/api_skintype_match?pdid=${pdid}`)

      // Instead, just set empty array for now to prevent error
      setSkinTypes([]);

    } catch (error) {
      console.error('Error fetching skin types:', error);
      setSkinTypes([]);
    }
  };

  // Update useEffect to use this function
  useEffect(() => {
    if (pdid) {
      fetchSkinTypes();
    }
  }, [pdid]);

  // Add this useEffect after your other useEffects
  useEffect(() => {
    const fetchSkinTypes = async () => {
      if (pdid) {
        try {
          const response = await fetch(`/api/skintype/api_skintype_match?pdid=${pdid}`);
          if (!response.ok) throw new Error('Failed to fetch skin types');
          const data = await response.json();
          setSkinTypes(data);
        } catch (error) {
          console.error('Error fetching skin types:', error);
          setSkinTypes([]);
        }
      }
    };

    fetchSkinTypes();
  }, [pdid]);

  // Add warning fetch to useEffect
  useEffect(() => {
    const fetchWarnings = async () => {
      if (pdid) {
        try {
          const accid = localStorage.getItem('user_acc_id');
          const response = await fetch(`/api/product/api_product_warnings?pdid=${pdid}&accid=${accid}`);
          const data = await response.json();
          setWarnings(data);
        } catch (error) {
          console.error('Error fetching warnings:', error);
        }
      }
    };

    fetchWarnings();
  }, [pdid]);

  useEffect(() => {
    if (ingredients.length > 0 && skinTypes.length > 0 && userSkinType) {
      const score = calculateProductScore(ingredients, userSkinType, skinTypes);
      setProductScore({
        score: score.score,
        grade: score.grade,
        breakdown: score.breakdown
      });
    }
  }, [ingredients, skinTypes, userSkinType]);

  const HighlightedText = ({ text, highlightTerms, isAllergen = false }) => {
    if (!text || !Array.isArray(highlightTerms)) return <>{text}</>;

    const parts = text.split(new RegExp(`(${highlightTerms.join('|')})`, 'gi'));

    return (
      <span>
        {parts.map((part, i) => {
          if (!part) return null; 
          const isHighlighted = highlightTerms.some(term =>
            typeof part === 'string' && typeof term === 'string' &&
            part.toLowerCase() === term.toLowerCase()
          );
          return isHighlighted ? (
            <span key={i} className={isAllergen ? styles.allergenHighlighted : styles.highlighted}>
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          );
        })}
      </span>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles.mainContent}>
      <link href="https://fonts.googleapis.com/css2?family=Inria+Serif:wght@300;400;700&display=swap" rel="stylesheet"></link>
      <NavBar />

      {/* Warning Banner */}
      {warnings.hasWarning && (
        <div className={styles.warningBanner}>
          {warnings.concerns.length > 0 && (
            <div className={styles.safeWarning}>
              ✅ This product is safe from:
              {warnings.concerns.map(concern => (
                <span key={concern} className={styles.safeItem}>
                  {concern}
                </span>
              ))}
            </div>
          )}
          {warnings.allergens.length > 0 && (
            <div className={styles.allergyWarning}>
              🚫 Contains ingredients you're allergic to:
              {warnings.allergens.map(allergen => (
                <span key={allergen} className={styles.allergyItem}>
                  {allergen}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={styles.headProduct}>
        <div className={styles.previousPage} onClick={() => router.back()} style={{ cursor: "pointer" }}>
          <svg width="35" height="30" viewBox="0 0 51 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.6281 22.75L28.5281 32.55L25.5 35L8.5 21L25.5 7L28.5281 9.45L16.6281 19.25H42.5V22.75H16.6281Z" fill="#1D1B20" />
          </svg>
        </div>

        <div className={styles.productOverview}>

          <img src={product?.photo || "/image/ProductImage/notfoundProduct.png"} alt={product?.name || "Product"} style={{ width: '300px', height: '300px' }}></img>

          <div className={styles.productNameScore}>
            <div className={styles.productName}>
              <h2>{product?.brand || "Unknown Brand"}</h2>
              <h3> {product?.name || "Unknown Product"} </h3>
              <h4>{product?.category || "No Category"}</h4>
            </div>

            <div className={styles.score}>
              <div className={styles.line}>
                <h3>{calculateAverageRating()}</h3>
                <div className={styles.stars}>
                  {[...Array(5)].map((_, i) => {
                    const avg = parseFloat(calculateAverageRating());
                    const full = i + 1 <= Math.floor(avg);
                    const half = i + 1 > avg && i < avg;
                    return (
                      <svg key={i} width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M10 0L12.857 6.91H20.486L14.314 11.18L16.672 18.09L10 13.82L3.328 18.09L5.686 11.18L-0.514 6.91H7.143L10 0Z"
                          fill={full ? "#FFE600" : half ? "url(#halfGradient)" : "#E0E0E0"}
                        />
                        {half && (
                          <defs>
                            <linearGradient id="halfGradient">
                              <stop offset="50%" stopColor="#FFE600" />
                              <stop offset="50%" stopColor="#E0E0E0" />
                            </linearGradient>
                          </defs>
                        )}
                      </svg>
                    );
                  })}
                </div>
              </div>

              <div className={styles.line}>
                <h3> {reviews.length} </h3>
                <h4> Reviews </h4>
              </div>

              <div className={styles.line}>
                <div className={styles.level}>
                  <h3 className={getGradeColor(productScore.score)}>
                    {getGradeText(productScore.score)}
                  </h3>
                </div>
                <h4>Score: {productScore.score}%</h4>
              </div>
            </div>

            <div className={styles.display}>
              <h2> {product?.price || "Not Available"} ฿ </h2>
              <div className={styles.size}>
                <h4> Size: </h4>
                <button> {product?.size || "Not Available"} </button>
              </div>

              <div className={styles.buttonAdd}>
                <div className={styles.compare}>
                  <button type="button" onClick={handleCompareClick}>
                    + Compare
                  </button>
                </div>

                <div className={styles.add}>
                  <button
                    type="button"
                    onClick={toggleWishlist}
                    className={`${styles.wishlistButton} ${isInWishlist ? styles.inWishlist : ''}`}
                  >
                    <img
                      src={isInWishlist ? "/image/wishlist-filled.png" : "/image/wishlist.png"}
                      alt="wishlist"
                      style={{ width: '15px', height: '20px' }}
                    />
                    <p>{isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className={styles.productInfo}>
        <h2> Product Information </h2>

        {/* check product detail & Review */}
        <div className={styles.DetailRating}>
          {/* if click product detail */}
          <div className={activeTab === "detail" ? styles.activeTab : ""} onClick={() => setActiveTab("detail")} >
            <h3> Product Detail </h3>
            {activeTab === "detail" && <div className={styles.blueLine}></div>}
          </div>

          {/* if click Rating and review */}
          <div className={activeTab === "reviews" ? styles.activeTab : ""} onClick={() => setActiveTab("reviews")} >
            <h3> Rating & Reviews <span className={styles.reviewCountBox}>{reviews.length}</span> </h3>
            {activeTab === "reviews" && <div className={styles.blueLine}></div>}
          </div>
        </div>
        {activeTab === "reviews" && (
          <div className={styles.reviewActionRow}>
            <button className={styles.writeReviewBtn} onClick={() => setIsReviewModalOpen(true)}>
              ✍️ Write a Review
            </button>
          </div>
        )}

        {/* display product detail */}
        {activeTab === "detail" && (
          <div className={styles.ProductDetail}>
            <div className={styles.Description}>
              <h3> Description </h3>
              <p>{product?.description || "No description available."}</p>
            </div>

            <div className={styles.Concern}>
              <h3> Concern </h3>
              <div className={styles.ConcernList}>
                {concerns.length > 0 ? (
                  concerns.map((concern, index) => (
                    <p key={index}>
                      <HighlightedText
                        text={concern}
                        highlightTerms={warnings.concerns}
                        isAllergen={false}  // This will use green highlighting
                      />
                    </p>
                  ))
                ) : (
                  <p>No concerns found.</p>
                )}
              </div>
            </div>

            <div className={styles.Benefit}>
              <h3> Benefit </h3>
              <div className={styles.BenefitList}>
                {benefits.length > 0 ? (
                  benefits.map((benefit, index) => (
                    <p key={index}>{benefit}</p>
                  ))
                ) : (
                  <p>No benefit found.</p>
                )}
              </div>
            </div>

            <div className={styles.SkinType}>
              <h3>Best Suited For</h3>
              <div className={styles.SkinTypeList}>
                {skinTypes.length > 0 ? (
                  skinTypes.map((skinType, index) => (
                    <p key={index}>{skinType}</p>
                  ))
                ) : (
                  <p>No skin type information available</p>
                )}
              </div>
            </div>

            <div className={styles.safety}>
              <h3>Ingredients Safety</h3>
              <div className={styles.riskBars}>
                {(() => {
                  const riskCounts = calculateRiskCounts(ingredients);
                  const total = ingredients.length || 1; // Prevent division by zero

                  return (
                    <>
                      <div className={styles.riskBar}>
                        <div className={styles.riskLabel}>
                          <div className={styles.GreenSquare}></div>
                          <p>Low Risk</p>
                          <span>{riskCounts.low}</span>
                        </div>
                        <div className={styles.barContainer}>
                          <div
                            className={styles.barFill}
                            style={{
                              width: `${(riskCounts.low / total) * 100}%`,
                              backgroundColor: '#4CAF50'
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className={styles.riskBar}>
                        <div className={styles.riskLabel}>
                          <div className={styles.OrangeSquare}></div>
                          <p>Moderate Risk</p>
                          <span>{riskCounts.moderate}</span>
                        </div>
                        <div className={styles.barContainer}>
                          <div
                            className={styles.barFill}
                            style={{
                              width: `${(riskCounts.moderate / total) * 100}%`,
                              backgroundColor: '#FF9800'
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className={styles.riskBar}>
                        <div className={styles.riskLabel}>
                          <div className={styles.redSquare}></div>
                          <p>High Risk</p>
                          <span>{riskCounts.high}</span>
                        </div>
                        <div className={styles.barContainer}>
                          <div
                            className={styles.barFill}
                            style={{
                              width: `${(riskCounts.high / total) * 100}%`,
                              backgroundColor: '#f44336'
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className={styles.riskBar}>
                        <div className={styles.riskLabel}>
                          <div className={styles.graySquare}></div>
                          <p>Unknown</p>
                          <span>{riskCounts.unknown}</span>
                        </div>
                        <div className={styles.barContainer}>
                          <div
                            className={styles.barFill}
                            style={{
                              width: `${(riskCounts.unknown / total) * 100}%`,
                              backgroundColor: '#9E9E9E'
                            }}
                          ></div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className={styles.ingd}>
              <h3> Ingredients List </h3>
              <div className={styles.ingdList}>
                <table>
                  {/* Table Head */}
                  <thead>
                    <tr>
                      <th> Ingredient </th>
                      <th> Risk </th>
                      <th> EWG Data Availability </th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody>
                    {ingredients.length > 0 ? (
                      ingredients.map((ing, index) => (
                        <tr key={index}>
                          <td>
                            <HighlightedText
                              text={ing.name}
                              highlightTerms={warnings.allergens}
                              isAllergen={true}  // This will use red highlighting
                            />
                          </td>
                          <td>{ing.risk != null ? ing.risk : '-'}</td>
                          <td>{ing.ewg != null ? ing.ewg : '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3">No ingredients found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* display rating and review */}
        {activeTab === "reviews" && (
          <div className={styles.Reviews}>
            {paginatedReviews.length > 0 ? (
              paginatedReviews.map((review, index) => (
                <div key={index} className={styles.ReviewItem}>
                  <div className={styles.userInfo}>
                    <img src="/image/profile.png" style={{ width: '40px', height: '40px', marginRight: '10px' }}></img>
                    <div className={styles.userDetails}>
                      <h4>{review.accName || "No Name"}</h4>
                      <p>{review.sktName || "Unknown Skin Type"}</p>
                    </div>
                  </div>

                  <div className={styles.reviewHeader}>
                    <span className={styles.stars}>
                      {[...Array(5)].map((_, index) => (
                        <svg key={index} width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 0L12.857 6.91H20.486L14.314 11.18L16.672 18.09L10 13.82L3.328 18.09L5.686 11.18L-0.514 6.91H7.143L10 0Z"
                            fill={index < review.scoreRating ? "#FFE600" : "#E0E0E0"} />
                        </svg>
                      ))}
                    </span>
                    <span className={styles.date}>{new Date(review.rvdate).toLocaleDateString()}</span>
                  </div>

                  <div className={styles.reviewText}>
                    <p>{review.textReview || "No review text available"}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No reviews available.</p>
            )}
            <div className={styles.paginationControls}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              <span> Page {currentPage} of {totalPages} </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* add review */}
      {isReviewModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsReviewModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setIsReviewModalOpen(false)}>✖</button>
            <h2>Write a Review</h2>
            <form onSubmit={handleSubmitReview}>
              <label>
                Rating:
                <select value={rating} onChange={(e) => setRating(e.target.value)}>
                  <option value="5">5 ★</option>
                  <option value="4">4 ★</option>
                  <option value="3">3 ★</option>
                  <option value="2">2 ★</option>
                  <option value="1">1 ★</option>
                </select>
              </label>
              <br />
              <label>
                Review:
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write your review here..."
                  rows="4"
                ></textarea>
              </label>
              <br />
              <button type="submit" className={styles.submitButton}>Submit</button>
            </form>
          </div>
        </div>
      )}

      {showCompareModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Compare Products?</h3>
            <p>Do you want to compare these 2 products now?</p>
            <p className={styles.modalNote}>Or you can add one more product for a 3-way comparison</p>
            <div className={styles.modalButtons}>
              <button
                onClick={() => {
                  const existingCompared = JSON.parse(localStorage.getItem('comparedProducts') || '[]');
                  const newCompared = [...existingCompared, pdid];
                  localStorage.setItem('comparedProducts', JSON.stringify(newCompared));
                  router.push({
                    pathname: '/compareResult',
                    query: { products: newCompared.join(',') }
                  });
                }}
              >
                Yes, Compare Now
              </button>
              <button
                onClick={() => {
                  const existingCompared = JSON.parse(localStorage.getItem('comparedProducts') || '[]');
                  const newCompared = [...existingCompared, pdid];
                  localStorage.setItem('comparedProducts', JSON.stringify(newCompared));
                  setShowCompareModal(false);
                  alert('Product added. You can select one more product for a 3-way comparison.');
                }}
              >
                No, Add One More Product
              </button>
              <button
                onClick={() => {
                  setShowCompareModal(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div >
  );
}

import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';
import styles from "../styles/compare/compareResult.module.css";
import Footer from "/components/Footer";
import NavBar from "/components/NavBar";
import { calculateProductScore } from '../utils/calculateScore';

export default function CompareResult() {
    const [products, setProducts] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [productWarnings, setProductWarnings] = useState({});
    const scrollContainerRef = useRef(null);
    const router = useRouter();
    const [currentCategory, setCurrentCategory] = useState(null);
    const [userSkinType, setUserSkinType] = useState('Normal');

    const fetchSimilarProducts = async (category, comparedProductIds) => {
        try {
            console.log('Category:', category);
            console.log('Compared Products:', comparedProductIds);
            
            const response = await fetch(`/api/api_compare?category=${category}&products=${comparedProductIds}`);
            const data = await response.json();
            console.log('API Response:', data);
            
            if (data.similarProducts && data.similarProducts.length > 0) {
                setRecommendations(data.similarProducts);
            } else {
                console.log('No similar products found');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchProductWarnings = async (productId) => {
        const accid = localStorage.getItem('user_acc_id');
        if (!accid) return;
      
        try {
          const response = await fetch(`/api/product/api_product_warnings?pdid=${productId}&accid=${accid}`);
          const data = await response.json();
          setProductWarnings(prev => ({...prev, [productId]: data}));
        } catch (error) {
          console.error('Error fetching warnings:', error);
        }
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const productIds = urlParams.get("products");
        if (productIds) {
            fetchProducts(productIds);
            productIds.split(',').forEach(id => {
                fetchProductWarnings(id);
            });
            localStorage.removeItem('comparedProducts');
        }
    }, []);
    
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const productIds = urlParams.get("products");
        console.log('Initial products:', products);
        
        if (products.length > 0 && products[0].category) {
            console.log('Found category:', products[0].category);
            fetchSimilarProducts(products[0].category, productIds);
        } else {
            console.log('No category found in products');
        }
    }, [products]);
    
    useEffect(() => {
        const accid = localStorage.getItem('user_acc_id');
        if (!accid) return;
      
        const fetchSkinType = async () => {
          try {
            const res = await fetch(`/api/user/skintype?accId=${accid}`);
            const data = await res.json();
            if (res.ok && data.skinType) {
              setUserSkinType(data.skinType);
            } else {
              console.warn("Skin type fallback to default.");
            }
          } catch (error) {
            console.error("Error fetching skin type:", error);
          }
        };
      
        fetchSkinType();
    }, []);      

    const getGradeText = (score) => {
        if (score >= 81) return 'A';
        if (score >= 61) return 'B';
        if (score >= 41) return 'C';
        if (score >= 21) return 'D';
        return 'E';
    };

    const getGradeColor = (score) => {
        if (score >= 81) return styles.darkGreen;
        if (score >= 61) return styles.lightGreen;
        if (score >= 41) return styles.yellow;
        if (score >= 21) return styles.orange;
        return styles.red;
    };

    const fetchProducts = async (productIds) => {
        try {
            const idsArray = productIds.split(",");
            const productsData = await Promise.all(
                idsArray.map(async (id) => {
                    try {
                        // Fetch product details
                        const productRes = await fetch(`/api/product/api_product?pdid=${id}`);
                        if (!productRes.ok) throw new Error(`HTTP error! status: ${productRes.status}`);
                        const productData = await productRes.json();

                        // Fetch ingredients
                        const ingredientsRes = await fetch(`/api/product/api_ingredients?pdid=${id}`);
                        if (!ingredientsRes.ok) throw new Error(`HTTP error! status: ${ingredientsRes.status}`);
                        const ingredientsData = await ingredientsRes.json();
                        
                        // Calculate score
                        const productSkinTypes = productData.product.skinTypes?.split(',').map(s => s.trim()) || [];
                        const calculatedScore = calculateProductScore(ingredientsData.ingredients || [], userSkinType, productSkinTypes);

                        // Format ingredients list
                        const ingredientsList = ingredientsData.ingredients
                            ? ingredientsData.ingredients.map(ing => ing.name).join(", ")
                            : "No ingredients available";

                        return {
                            ...productData.product,
                            score: calculatedScore ? calculatedScore.score : null,
                            grade: calculatedScore ? getGradeText(calculatedScore.score) : null,
                            ingredients: ingredientsList
                        };
                    } catch (error) {
                        console.error(`Error fetching product ${id}:`, error);
                        return null;
                    }
                })
            );

            // Filter out any failed requests
            setProducts(productsData.filter(product => product !== null));
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const fetchRecommendations = async (category) => {
        try {
            const response = await fetch(`/api/product/api_product?category=${category}&limit=10`);
            const data = await response.json();
            if (data.mysqlData) {
                // Filter out products that are already in comparison
                const filteredRecommendations = data.mysqlData.filter(
                    rec => !products.some(p => p.pd_id === rec.pd_id)
                ).slice(0, 10);
                setRecommendations(filteredRecommendations);
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        }
    };

    useEffect(() => {
        if (products.length > 0) {
            // Use the category of the first product for recommendations
            fetchRecommendations(products[0].category);
        }
    }, [products]);

    useEffect(() => {
        if (products.length > 0) {
            const categories = products.map(p => p.category);
            const sharedCategory = categories.every(cat => cat === categories[0]) ? categories[0] : null;
            setCurrentCategory(sharedCategory);
    
            if (sharedCategory) {
                fetchSimilarProducts(sharedCategory, products.map(p => p.pd_id).join(','));
            }
        }
    }, [products]);    

    // Add this useEffect for fetching recommendations
    useEffect(() => {
        const fetchRecommendations = async () => {
          if (products.length > 0) {
            const productIds = products.map(p => p.pd_id).join(',');
            const category = products[0].category; 
            
            try {
              const response = await fetch(`/api/api_compare?category=${category}&products=${productIds}`);
              const data = await response.json();
              
              if (data.similarProducts) {
                setRecommendations(data.similarProducts);
              }
            } catch (error) {
              console.error('Error fetching recommendations:', error);
            }
          }
        };
      
        fetchRecommendations();
      }, [products]);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300; 
            const container = scrollContainerRef.current;
            const scrollPosition = direction === 'left' 
                ? container.scrollLeft - scrollAmount 
                : container.scrollLeft + scrollAmount;
            
            container.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className={styles.container}>
            <NavBar />
            <main className={styles.main}>
                <div className={styles.compareHeader}>
                    <h1>Comparison Results</h1>
                </div>

                <div className={styles.comparisonTable}>
                    {products.length > 0 ? (
                        products.map((product) => (
                            <div key={product.pd_id} className={styles.productCard}>
                                {productWarnings[product.pd_id]?.hasWarning && (
                                    <div className={styles.warningSection}>
                                        {productWarnings[product.pd_id].allergens.length > 0 && (
                                            <div className={styles.allergyWarning}>
                                                🚫 Contains ingredients you're allergic to:
                                                {productWarnings[product.pd_id].allergens.map(allergen => (
                                                    <span key={allergen} className={styles.allergyItem}>
                                                        {allergen}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                <img src={product.photo || "/image/ProductImage/notfoundProduct.png"} alt={product.name} className={styles.productImage} />
                                <div className={styles.productInfo}>
                                    <h2 className={styles.productName}>{product.name}</h2>
                                    <div className={styles.brandName}>{product.brand}</div>
                                    
                                    <div className={styles.scoreSection}>
                                        <div className={styles.scoreInfo}>
                                            <span className={styles.scoreNumber}>
                                                {product.score !== null ? `${Math.round(product.score)}%` : 'No score'}
                                            </span>
                                            <div className={`${styles.grade} ${product.score !== null ? getGradeColor(product.score) : ''}`}>
                                                {product.score !== null ? product.grade : '-'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.productDetails}>
                                        {/* Add Category section */}
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>Category</span>
                                            <span className={styles.detailValue}>
                                                <span className={styles.categoryItem}>
                                                    {product.category || "No Category Available"}
                                                </span>
                                            </span>
                                        </div>

                                        {/* Benefits section */}
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>Benefits</span>
                                            <span className={styles.detailValue}>
                                                {product.benefits?.split(', ').map(benefit => (
                                                    <span key={benefit} className={styles.benefitItem}>
                                                        {benefit}
                                                    </span>
                                                ))}
                                            </span>
                                        </div>

                                        {/* Concerns with highlighting */}
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>Concerns</span>
                                            <span className={styles.detailValue}>
                                                {product.concerns.split(', ').map(concern => {
                                                    const isMatching = productWarnings[product.pd_id]?.concerns.includes(concern);
                                                    return (
                                                        <span 
                                                            key={concern} className={isMatching ? styles.highlighted : styles.concernItem}>
                                                            {isMatching && <span className={styles.checkIcon}>✅</span>}
                                                            {concern}
                                                        </span>
                                                    );
                                                })}
                                            </span>
                                        </div>

                                        {/* Update ingredients section to use scrolling with highlighting */}
                                        <div className={styles.ingredientSection}>
                                            <h3>Ingredients</h3>
                                            <div className={styles.ingredientsList}>
                                                {product.ingredients?.split(',').map((ingredient, index) => (
                                                    <span 
                                                        key={`${product.pd_id}-${index}`} 
                                                        className={
                                                            productWarnings[product.pd_id]?.allergens.includes(ingredient.trim())
                                                            ? styles.allergenHighlighted
                                                            : styles.ingredientItem
                                                        }
                                                    >
                                                        {ingredient.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No products selected for comparison.</p>
                    )}
                </div>

                <div className={styles.recommendationSection}>
                    <h2>
                        Similar Products You Might Like
                        {currentCategory && ` in ${products[0]?.category}`}
                    </h2>
                    <div className={styles.scrollWrapper}>
                        <button 
                            className={`${styles.scrollButton} ${styles.leftButton}`}
                            onClick={() => scroll('left')}>
                            ‹
                        </button>
                        <div className={styles.recommendationContainer} ref={scrollContainerRef}>
                            {recommendations.length > 0 ? (
                                recommendations.map((product) => (
                                    <div 
                                        key={product.pd_id} 
                                        className={styles.recommendationCard}
                                        onClick={() => router.push(`/productInfo?pdid=${product.pd_id}`)}
                                    >
                                        <img 
                                            src={product.photo || "/image/ProductImage/notfoundProduct.png"} 
                                            alt={product.name} 
                                            className={styles.recommendationImage}
                                        />
                                        <div className={styles.recommendationInfo}>
                                            <h3>{product.brand}</h3>
                                            <p>{product.name}</p>
                                            <div className={styles.matchInfo}>
                                                {product.benefit_matches > 0 && (
                                                    <span className={styles.matchLabel}>
                                                        {product.benefit_matches} matching benefits 
                                                    </span>
                                                )}
                                                {product.ingredient_matches > 0 && (
                                                    <span className={styles.matchLabel}>
                                                        {product.ingredient_matches} matching ingredients
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No similar products found</p>
                            )}
                        </div>
                        <button 
                            className={`${styles.scrollButton} ${styles.rightButton}`}
                            onClick={() => scroll('right')}>
                            ›
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
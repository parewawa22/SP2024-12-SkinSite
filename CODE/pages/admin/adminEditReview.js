import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "/styles/admin/adminEditReview.module.css";
import NavBar from "/components/NavBar";
import AdminBar from "./adminBar";
import Footer from "/components/Footer";

export default function adminEditReview() {
  const [reviews, setReviews] = useState([]);
  const [sortOption, setSortOption] = useState("date"); 
  const router = useRouter();
  const { pdid } = router.query; 

  useEffect(() => {
    console.log("Product ID from URL:", pdid); 
    if (pdid) {
      fetchProductReviews(pdid);
    }
  }, [pdid]);

  const fetchProductReviews = async (pdid) => {
    try {
      console.log(`Fetching reviews for product ID: ${pdid}`);
      const response = await fetch(`/api/review/api_review?pdid=${pdid}`);
      const data = await response.json();
      console.log("Fetched reviews data:", data);
      setReviews(data);

      data.forEach((review) => {
        console.log("Date from API:", review.rvdate, "Parsed date:", Date.parse(review.rvdate));
      });

    } catch (error) {
      console.error("Error fetching product reviews:", error);
    }
  };

  const sortReviews = (option) => {
    const sortedReviews = [...reviews];
    if (option === "date") {
      sortedReviews.sort((a, b) => {
        return new Date(b.rvdate).getTime() - new Date(a.rvdate).getTime();
      });
    } else if (option === "star") {
      sortedReviews.sort((a, b) => b.scoreRating - a.scoreRating);
    }
    setSortOption(option);
    setReviews(sortedReviews);
  };

  const deleteReview = async (pdid, accid) => {
    try {
      console.log("Deleting review with pdid:", pdid, "and accid:", accid);
      if (!pdid || !accid) {
        console.error("Invalid pdid or accid:", { pdid, accid });
        alert("Error: Unable to delete the review. Invalid product or account ID.");
        return;
      }

      const response = await fetch(`/api/review/api_review?pdid=${pdid}&accid=${accid}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete review: ${response.statusText}`);
      }

      setReviews((prevReviews) =>
        prevReviews.filter((review) => !(review.pdid === pdid && review.accid === accid))
      );

      console.log("Review deleted successfully");
      alert("Review deleted successfully");
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Error deleting review. Please try again.");
    }
  };

  return (
    <div className={styles.main}>
      <NavBar />
      <div className={styles.body}>
        <AdminBar />
        <div className={styles.head}>
          <h2>User Review Management</h2>

          <div className={styles.editReview}>
            <div className={styles.sort}>
              <label> Sort By : </label>
              <select value={sortOption} onChange={(e) => sortReviews(e.target.value)} className={styles.sortDropdown}>
                <option value="date"> Date (New-Old) </option>
                <option value="star"> Star Rating </option>
              </select>
            </div>

            <div className={styles.reviewList}>
              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <div key={index} className={styles.ReviewItem}>
                    <div className={styles.deleteButton} onClick={() => deleteReview(review.pdid, review.accid)}>
                      <button> Delete </button>
                    </div>


                    <div className={styles.userInfo}>
                      <img src="/image/profile.png" alt="User" style={{ width: "40px", height: "40px", marginRight: "10px" }} />
                      <div className={styles.userDetails}>
                        <h4>{review.accName || "No Name"}</h4>
                        <p>{review.sktName || "Unknown Skin Type"}</p>
                      </div>
                    </div>

                    <div className={styles.reviewDateRate}>
                      <span className={styles.stars}>
                        {[...Array(5)].map((_, index) => (
                          <svg key={index} width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 0L12.857 6.91H20.486L14.314 11.18L16.672 18.09L10 13.82L3.328 18.09L5.686 11.18L-0.514 6.91H7.143L10 0Z" fill={index < review.scoreRating ? "#FFE600" : "#E0E0E0"} />
                          </svg>
                        ))}
                      </span>
                      <span className={styles.date}>
                        {new Date(review.rvdate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className={styles.reviewText}>
                      <p>{review.textReview || "No review text available"}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No reviews available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

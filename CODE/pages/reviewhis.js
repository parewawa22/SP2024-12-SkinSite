import { useState, useEffect } from "react";
import NavBar from "/components/NavBar";
import UserBar from "/components/UserSidebar";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from '/styles/reviewhis.module.css';
import Footer from "/components/Footer";
import { FaTrashAlt, FaEdit } from "react-icons/fa";

export default function MyReviews() {
    const [reviews, setReviews] = useState([]);
    const [userAccid, setUserAccid] = useState(null);
    const router = useRouter();
    const [sortOption, setSortOption] = useState("");
    const [isDesktop, setIsDesktop] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const sortedReviews = [...reviews].sort((a, b) => {
        switch (sortOption) {
            case "az":
                return a.pdName.localeCompare(b.pdName);
            case "za":
                return b.pdName.localeCompare(a.pdName);
            case "newest":
                return new Date(b.rvdate) - new Date(a.rvdate);
            case "oldest":
                return new Date(a.rvdate) - new Date(b.rvdate);
            default:
                return 0;
        }
    });

    const handleDelete = async (pdid) => {
        if (confirm("Are you sure you want to delete this review?")) {
            try {
                const res = await fetch(`/api/review/api_review_delete`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ pdid, accid: userAccid }),
                });
                const data = await res.json();
                if (res.ok) {
                    setReviews(reviews.filter((r) => r.pd_id !== pdid));
                } else {
                    alert(data.error || "Failed to delete review");
                }
            } catch (err) {
                console.error("Delete Error:", err);
            }
        }
    };

    const [editingReview, setEditingReview] = useState(null);
    const [newRating, setNewRating] = useState(5);
    const [newText, setNewText] = useState("");

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/review/api_review_update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pdid: editingReview.pd_id,
                    accid: userAccid,
                    textReview: newText,
                    scoreRating: newRating,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update review');
            }

            alert("Review updated successfully!");
            setEditingReview(null);
            // Refresh reviews
            const updated = reviews.map(r =>
                r.pd_id === editingReview.pd_id ? { ...r, textReview: newText, scoreRating: newRating } : r
            );
            setReviews(updated);
        } catch (err) {
            console.error("Error updating review:", err);
            alert("Error updating review.");
        }
    };

    const handleEditClick = (review) => {
        setEditingReview(review);
        setNewRating(review.scoreRating);
        setNewText(review.textReview);
    };

    useEffect(() => {
        const storedId = localStorage.getItem("user_acc_id");
        if (storedId) {
            setUserAccid(storedId);
        } else {
            router.push("/login"); 
        }
    }, []);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!userAccid) return;

            try {
                const response = await fetch(`/api/review/api_review_all_by_accid?accid=${userAccid}`);
                if (!response.ok) throw new Error("Failed to fetch data from server");

                const data = await response.json();
                setReviews(data);
            } catch (error) {
                console.error("Error fetching reviews:", error);
                alert("There was an issue loading your reviews. Please try again later.");
            }
        };

        fetchReviews();
    }, [userAccid]); // wait until userAccid is set    


    const [currentPage, setCurrentPage] = useState(1);
    const reviewsPerPage = 5;

    const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);
    const startIndex = (currentPage - 1) * reviewsPerPage;
    const endIndex = startIndex + reviewsPerPage;
    const currentReviews = sortedReviews.slice(startIndex, endIndex);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    useEffect(() => {
        const checkScreenSize = () => {
            setIsDesktop(window.innerWidth >= 768);
        };

        checkScreenSize();

        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    return (
        <div className={styles.main}>
            <NavBar />
            <div className={styles.mobileUserBarToggle}>
                <button onClick={() => setSidebarOpen(!sidebarOpen)}>User Bar ▾</button>
            </div>

            <div className={styles.body}>
                {/* <UserBar /> */}
                {(sidebarOpen || isDesktop) && <UserBar />}
                <div className={styles.content}>
                    <h2>My Reviews</h2>
                    <div className={styles.filter}>
                        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className={styles.sortSelect}>
                            <option value="">Sort By</option>
                            <option value="az">A - Z</option>
                            <option value="za">Z - A</option>
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>

                    <div className={styles.reviewSection}>
                        <div className={styles.reviewsList}>
                            {currentReviews.length > 0 ? (
                                currentReviews.map((review, index) => (
                                    <div key={index} className={styles.reviewItem}>
                                        <div className={styles.reviewHeaderRow}>
                                            <Link href={`/productInfo?pdid=${review.pd_id}`}>
                                                <img src={review.photo} alt={`Product ${index}`} />
                                            </Link>
                                            <div className={styles.reviewActions}>
                                                <FaEdit
                                                    onClick={() => {
                                                        setEditingReview(review);
                                                        setNewText(review.textReview);
                                                    }}
                                                    style={{ cursor: "pointer", color: "rgb(158, 158, 158)" }}
                                                />
                                                <FaTrashAlt
                                                    onClick={() => handleDelete(review.pd_id)}
                                                    style={{ cursor: "pointer", color: " #EB4848" }}
                                                />
                                            </div>
                                        </div>
                                        <div className={styles.reviewDetails}>
                                            <Link href={`/productInfo?pdid=${review.pd_id}`}>
                                                <h4>{review.pdName}</h4>
                                            </Link>
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
                                            <p>{review.textReview}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No reviews found.</p>
                            )}
                        </div>
                    </div>
                    {sortedReviews.length > reviewsPerPage && (
                        <div className={styles.paginationWrapper}>
                            <div className={styles.pagination}>
                                <button onClick={handlePrevPage} disabled={currentPage === 1}>
                                    ← Previous
                                </button>
                                <span>Page {currentPage} of {totalPages}</span>
                                <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {editingReview && (
                <div className={styles.modalOverlay} onClick={() => setEditingReview(null)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeButton} onClick={() => setEditingReview(null)}>✖</button>
                        <h2>Edit Your Review</h2>
                        <form onSubmit={(e) => handleEditSubmit(e)}>
                            <label>
                                Rating:
                                <select value={newRating} onChange={(e) => setNewRating(Number(e.target.value))}>
                                    <option value="5">5 ★</option>
                                    <option value="4">4 ★</option>
                                    <option value="3">3 ★</option>
                                    <option value="2">2 ★</option>
                                    <option value="1">1 ★</option>
                                </select>
                            </label>
                            <br />
                            <label>Review:</label>
                            <textarea
                                rows="4"
                                value={newText}
                                onChange={(e) => setNewText(e.target.value)}
                            />
                            <br />
                            <button type="submit" className={styles.submitButton}>Save Changes</button>
                        </form>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
}

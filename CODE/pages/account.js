import { useState, useEffect } from "react";
import NavBar from "/components/NavBar";
import UserBar from "/components/UserSidebar";
import Footer from "/components/Footer";
import styles from '/styles/user/account.module.css'; 
import Link from "next/link";
import { useRouter } from "next/router";
import ModalComponent from "../components/ModalComponent";
import { getLoggedInUserId, getLoggedInUserRole } from "../utils/auth";

export default function Account() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [account, setAccount] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const acc_id = getLoggedInUserId();
  const role = getLoggedInUserRole();

  const [accid, setAccid] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAccid(localStorage.getItem("user_acc_id"));
    }
  }, []);


  const profileLink = acc_id
    ? (role === "Admin" ? "/admin/adminAccount" : "/account")
    : "/login";

  const [skinGoal, setSkinGoal] = useState([]);
  const [preferenceConcern, setPreferenceConcern] = useState([]);
  const [allergyIngredients, setAllergyIngredients] = useState([]);
  const [skinType, setSkinType] = useState("");
  const [favBrands, setFavBrands] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [modal, setModal] = useState({ open: false, type: "", title: "" });
  const router = useRouter();

  useEffect(() => {
    if (!acc_id) {
      console.log("No acc_id found yet. Waiting...");
      return;
    }

    const fetchData = async () => {
      try {
        console.log("Fetching account for acc_id:", acc_id);

        const accResponse = await fetch(`/api/account/api_account?acc_id=${acc_id}`);
        const accData = await accResponse.json();

        if (!accResponse.ok || accData.error) {
          setError(accData.error || "Failed to fetch account data.");
          return;
        }
        setAccount(accData.account || {});

        // Fetch Wishlist
        const wishlistResponse = await fetch(`/api/api_wishlist?accid=${acc_id}`);
        const wishlistData = await wishlistResponse.json();

        if (!wishlistResponse.ok || !wishlistData.data) {
          setWishlist([]);
          console.error("Wishlist data error:", wishlistData);
        } else {
          setWishlist(wishlistData.data);
        }
      } catch (err) {
        console.error("Error fetching account or wishlist:", err);
        setError("Failed to load account data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [acc_id]);

  const fetchFavBrands = async () => {
    const res = await fetch(`/api/account/api_favbrand?accid=${accid}`);
    const data = await res.json();
    setFavBrands(data);
  };

  const fetchAllBrands = async () => {
    const res = await fetch("/api/product/api_brands");
    const data = await res.json();
    setAllBrands(data);
  };

  const addBrand = async () => {
    if (!selectedBrand) return;
    await fetch("/api/account/api_favbrand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accid, brandid: selectedBrand }),
    });
    setSelectedBrand("");
    fetchFavBrands();
  };

  const removeBrand = async (brandid) => {
    await fetch("/api/account/api_favbrand", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accid, brandid }),
    });
    fetchFavBrands();
  };

  useEffect(() => {
    if (accid) {
      fetchFavBrands();
      fetchAllBrands();
    }
  }, [accid]);

  useEffect(() => {
    const fetchSkinProfile = async () => {
      if (!acc_id) return;

      try {
        const res = await fetch(`/api/account/api_account_skinprofile?acc_id=${acc_id}`);
        const data = await res.json();

        if (res.ok) {
          setSkinGoal(data.skinGoals || []);
          setPreferenceConcern(data.concerns || []);
          setAllergyIngredients(data.ingredients || []);
          setSkinType(data.skinType || "Unknown");
        } else {
          console.error("Failed to fetch skin profile:", data.message);
        }
      } catch (error) {
        console.error("Error fetching skin profile:", error);
      }
    };

    fetchSkinProfile();
  }, [acc_id]);

  useEffect(() => {
    const accid = localStorage.getItem("user_acc_id");
    if (accid) {
      fetch(`/api/account/api_favbrand?accid=${accid}`)
        .then(res => res.json())
        .then(data => setFavBrands(data))
        .catch(err => console.error("Failed to fetch favorite brands", err));
    }
  }, []);

  useEffect(() => {
    const acc_id = localStorage.getItem("user_acc_id");
    if (!acc_id) {
      router.push("/login");
    }
  }, []);


  const handleAdd = (type, title) => {
    setModal({ open: true, type, title });
  };

  const handleDelete = async (type, name) => {
    try {
      const res = await fetch("/api/account/delete_user_concern", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accid: acc_id, type, name }),
      });

      if (res.ok) {
        alert("Deleted successfully");
        location.reload(); 
      } else {
        alert("Failed to delete");
      }
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_acc_id");
    localStorage.removeItem("user_role");
    router.push("/login");
  };


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles.main}>
      <NavBar />
      <div className={styles.mobileUserBarToggle}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>User Bar ▾</button>
      </div>

      <div className={styles.body}>
        {/* <UserBar/> */}
        {(typeof window !== "undefined" && (sidebarOpen || window.innerWidth >= 768)) && <UserBar />}

        <div className={styles.content}>
          <h2> My Account </h2>
          <div className={styles.editBtnWrapper}>
            <Link href="/editAccount">
              <button className={styles.editButton}>
                ✎ Edit Profile
              </button>
            </Link>
          </div>

          <div className={styles.profile}>
            <div className={styles.squareProfile}>
              <div className={styles.circlePosition}>
                <div className={styles.circleProfile}>
                  <img src="/image/user.png" alt="profile" style={{ width: '90px', height: '90px' }} />
                </div>
              </div>

              <div className={styles.infoUser}>
                <h3> {account?.accName || "No Name"} </h3>
                <h5> Email : {account?.email || "No Email"} </h5>
                <h5> Gender: {account?.gender || "No Gender"} </h5>
                <h5> Birth Date: {account?.dob ? new Date(account.dob).toLocaleDateString() : "No Date"}  </h5>
              </div>
            </div>


            <div className={styles.squareSkinProfile}>
              <h2> Skin Profile </h2>
              <div className={styles.showProfile}>
                <h4> Skin Goal </h4>
                <div className={styles.result}>
                  {skinGoal.length > 0 ? (
                    skinGoal.map((goal, index) => (
                      <h5 key={index} className={styles.clickableTag}>
                        {goal}
                        <span className={styles.deleteX} onClick={() => handleDelete("benefit", goal)}> ✕</span>
                      </h5>
                    ))
                  ) : (
                    <h5>No Skin Goal</h5>
                  )}

                  <button className={styles.add} onClick={() => handleAdd("benefit", "Skin Goal")}>
                    <svg width="12" height="12" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M21.3571 13.1429H13.1429V21.3571C13.1429 21.7929 12.9698 22.2107 12.6617 22.5188C12.3536 22.8269 11.9357 23 11.5 23C11.0643 23 10.6464 22.8269 10.3383 22.5188C10.0302 22.2107 9.85714 21.7929 9.85714 21.3571V13.1429H1.64286C1.20714 13.1429 0.789278 12.9698 0.481182 12.6617C0.173087 12.3536 0 11.9357 0 11.5C0 11.0643 0.173087 10.6464 0.481182 10.3383C0.789278 10.0302 1.20714 9.85714 1.64286 9.85714H9.85714V1.64286C9.85714 1.20714 10.0302 0.789277 10.3383 0.481181C10.6464 0.173086 11.0643 0 11.5 0C11.9357 0 12.3536 0.173086 12.6617 0.481181C12.9698 0.789277 13.1429 1.20714 13.1429 1.64286V9.85714H21.3571C21.7929 9.85714 22.2107 10.0302 22.5188 10.3383C22.8269 10.6464 23 11.0643 23 11.5C23 11.9357 22.8269 12.3536 22.5188 12.6617C22.2107 12.9698 21.7929 13.1429 21.3571 13.1429Z"
                        fill="#90745b"
                      />
                    </svg>
                  </button>
                </div>

                <h4> Preferences Concern </h4>
                <div className={styles.result}>
                  {preferenceConcern.length > 0 ? (
                    preferenceConcern.map((goal, index) => (
                      <h5 key={index} className={styles.clickableTag}>
                        {goal}
                        <span className={styles.deleteX} onClick={() => handleDelete("concern", goal)}> ✕</span>
                      </h5>
                    ))
                  ) : (
                    <h5>No Preferences Concern</h5>
                  )}
                  <button className={styles.add} onClick={() => handleAdd("concern", "Preferences Concern")}>
                    <svg width="12" height="12" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M21.3571 13.1429H13.1429V21.3571C13.1429 21.7929 12.9698 22.2107 12.6617 22.5188C12.3536 22.8269 11.9357 23 11.5 23C11.0643 23 10.6464 22.8269 10.3383 22.5188C10.0302 22.2107 9.85714 21.7929 9.85714 21.3571V13.1429H1.64286C1.20714 13.1429 0.789278 12.9698 0.481182 12.6617C0.173087 12.3536 0 11.9357 0 11.5C0 11.0643 0.173087 10.6464 0.481182 10.3383C0.789278 10.0302 1.20714 9.85714 1.64286 9.85714H9.85714V1.64286C9.85714 1.20714 10.0302 0.789277 10.3383 0.481181C10.6464 0.173086 11.0643 0 11.5 0C11.9357 0 12.3536 0.173086 12.6617 0.481181C12.9698 0.789277 13.1429 1.20714 13.1429 1.64286V9.85714H21.3571C21.7929 9.85714 22.2107 10.0302 22.5188 10.3383C22.8269 10.6464 23 11.0643 23 11.5C23 11.9357 22.8269 12.3536 22.5188 12.6617C22.2107 12.9698 21.7929 13.1429 21.3571 13.1429Z"
                        fill="#90745b"
                      />
                    </svg>
                  </button>
                </div>

                <h4> Skin Type </h4>
                <div className={styles.result}>
                  <h5 className={styles.clickableTag}>
                    {skinType}
                    <span className={styles.editX} onClick={() => handleAdd("sktype", "Skin Type")}> ✎</span>
                  </h5>
                </div>

                <h4> Allergy Ingredients </h4>
                <div className={styles.result}>
                  {allergyIngredients.length > 0 ? (
                    allergyIngredients.map((goal, index) => (
                      <h5 key={index} className={styles.clickableTag}>
                        {goal}
                        <span className={styles.deleteX} onClick={() => handleDelete("ingredient", goal)}> ✕</span>
                      </h5>

                    ))
                  ) : (
                    <h5>No Allergy Ingredients</h5>
                  )}
                  <button className={styles.add} onClick={() => handleAdd("ingredient", "Allergy Ingredients")}>
                    <svg width="12" height="12" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M21.3571 13.1429H13.1429V21.3571C13.1429 21.7929 12.9698 22.2107 12.6617 22.5188C12.3536 22.8269 11.9357 23 11.5 23C11.0643 23 10.6464 22.8269 10.3383 22.5188C10.0302 22.2107 9.85714 21.7929 9.85714 21.3571V13.1429H1.64286C1.20714 13.1429 0.789278 12.9698 0.481182 12.6617C0.173087 12.3536 0 11.9357 0 11.5C0 11.0643 0.173087 10.6464 0.481182 10.3383C0.789278 10.0302 1.20714 9.85714 1.64286 9.85714H9.85714V1.64286C9.85714 1.20714 10.0302 0.789277 10.3383 0.481181C10.6464 0.173086 11.0643 0 11.5 0C11.9357 0 12.3536 0.173086 12.6617 0.481181C12.9698 0.789277 13.1429 1.20714 13.1429 1.64286V9.85714H21.3571C21.7929 9.85714 22.2107 10.0302 22.5188 10.3383C22.8269 10.6464 23 11.0643 23 11.5C23 11.9357 22.8269 12.3536 22.5188 12.6617C22.2107 12.9698 21.7929 13.1429 21.3571 13.1429Z"
                        fill="#90745b"
                      />
                    </svg>
                  </button>
                </div>
                <div >
                  <h4>Favorite Brands</h4>
                  {favBrands.length > 0 ? (
                    <ul>
                      {favBrands.map((brand) => (
                        <li key={brand.brand_id} style={{ marginBottom: "10px" }}>
                          {brand.brandName}
                          <button onClick={() => removeBrand(brand.brand_id)} style={{ marginLeft: "10px", color: "red" }}>
                            ❌
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No favorite brands selected.</p>
                  )}
                </div>
                <div style={{ marginTop: "45px" }}>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    style={{ padding: "5px", marginRight: "10px", fontFamily: "'Inria Serif', serif" }}
                  >
                    <option value="">Select Brand</option>
                    {allBrands
                      .filter(b => !favBrands.find(fb => fb.brand_id === b.brand_id)) // filter out selected ones
                      .map((brand) => (
                        <option key={brand.brand_id} value={brand.brand_id}>
                          {brand.brandName}
                        </option>
                      ))}
                  </select>
                  <button style={{ fontFamily: "'Inria Serif', serif" }} onClick={addBrand} disabled={!selectedBrand}>Add</button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div >
      {
        modal.open && (
          <ModalComponent
            type={modal.type}
            title={modal.title}
            accId={acc_id}
            onClose={(shouldReload) => {
              setModal({ open: false, type: "", title: "" });
              if (shouldReload) location.reload(); 
            }}
          />
        )
      }
      <Footer />
    </div >
  );

}

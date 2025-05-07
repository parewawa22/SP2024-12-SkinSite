import { useState, useEffect } from "react";
import UserBar from "/components/UserSidebar";
import styles from '/styles/user/editAccount.module.css'; 
import NavBar from "/components/NavBar";
import Footer from "/components/Footer";
import { useRouter } from "next/router";
import { getLoggedInUserId, getLoggedInUserRole } from "../utils/auth";

export default function EditAccount() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const accid = getLoggedInUserId();
  const role = getLoggedInUserRole();
  const profileLink = accid
    ? (role === "Admin" ? "/admin/adminAccount" : "/account")
    : "/login";

  const [account, setAccount] = useState({
    accName: "",
    email: "",
    pwd: "",
    gender: "",
    dob: "",
  });
  const [message, setMessage] = useState("");
  const router = useRouter();

  const [skinGoal, setSkinGoal] = useState([]);
  const [preferenceConcern, setPreferenceConcern] = useState([]);
  const [skinType, setSkinType] = useState("");

  const [allergyIngredients, setAllergyIngredients] = useState([]);

  useEffect(() => {
    const acc_id = localStorage.getItem("user_acc_id");
    if (!acc_id) {
      alert("Please log in first.");
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      const res = await fetch(`/api/account/api_account?acc_id=${acc_id}`);
      const data = await res.json();
      if (res.ok && data.account) {
        setAccount({
          accName: data.account.accName,
          email: data.account.email,
          pwd: "",
          gender: data.account.gender,
          dob: data.account.dob?.split("T")[0],
        });
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    const fetchSkinProfile = async () => {
      const acc_id = localStorage.getItem("user_acc_id"); 
      if (!acc_id) {
        alert("Please log in first.");
        router.push("/login");
        return;
      }

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
  }, []);

  const handleChange = (e) => {
    setAccount({ ...account, [e.target.name]: e.target.value });
  };
  const handleUpdate = async (e) => {
    const acc_id = localStorage.getItem("user_acc_id"); 
    if (!acc_id) {
      alert("Please log in first.");
      router.push("/login");
      return;
    }

    e.preventDefault();

    if (!account.accName || !account.email || !account.pwd || !account.gender || !account.dob) {
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      const res = await fetch("/api/account/api_editAccount", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...account, acc_id }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("User updated successfully!");
        alert("🎉 Your account has been updated successfully!");
        router.push("/account");
      } else {
        setMessage(data.message || "Update failed.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error updating account.");
    }
  };

  const handleDelete = async () => {
    const confirmed = confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!confirmed) return;

    const acc_id = localStorage.getItem("user_acc_id");
    if (!acc_id) {
      alert("User ID not found.");
      return;
    }

    try {
      const res = await fetch("/api/account/api_editAccount", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acc_id }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Account deleted successfully.");
        localStorage.removeItem("user_acc_id");
        localStorage.removeItem("user_role");
        router.push("/login");
      } else {
        alert(`Failed to delete account: ${data.message}`);
      }
    } catch (error) {
      console.error("❌ Error deleting account:", error);
      alert("An error occurred while deleting the account.");
    }
  };

  return (
    <div className={styles.main}>
      <NavBar />
      <div className={styles.mobileUserBarToggle}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>User Bar ▾</button>
      </div>

      <div className={styles.body}>
        {(typeof window !== "undefined" && (sidebarOpen || window.innerWidth >= 768)) && <UserBar />}
        
        <div className={styles.Account}>
          <h2> My Account </h2>

          <div className={styles.EditProfile}>
            <div className={styles.text}>
              <h3> Edit Profile </h3>
              <img src="/image/editProfile.png" alt="editProfile" style={{ width: '27px', height: '27px', marginLeft: '6px', }} />
            </div>


            <div className={styles.edit}>
              <form className={styles.editUserContainer} onSubmit={handleUpdate}>
                <div className={styles.editUser}>
                  <label>Username</label>
                  <input type="text" name="accName" value={account.accName} onChange={handleChange} required />

                  <label>Email</label>
                  <input type="email" name="email" value={account.email} onChange={handleChange} required />

                  <label>Password</label>
                  <input type="password" name="pwd" value={account.pwd} onChange={handleChange} required />

                  <label>Gender</label>
                  <select name="gender" value={account.gender} onChange={handleChange} required>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Not prefer to say">Not prefer to say</option>
                  </select>

                  <label>Birthdate</label>
                  <input type="date" name="dob" value={account.dob} onChange={handleChange} required />
                </div>

                <div className={styles.buttonWrapper}>
                  <button type="submit" className={`${styles.actionButton} ${styles.updateButton}`}>
                    Update
                  </button>
                  <button type="button" onClick={handleDelete} className={`${styles.actionButton} ${styles.deleteButton}`}>
                    Delete Account
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>

        {message && <p>{message}</p>}
      </div >
      <Footer />
    </div >

  );
}

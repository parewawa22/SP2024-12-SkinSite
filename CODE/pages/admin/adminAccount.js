import { useState, useEffect } from "react";
import styles from '/styles/admin/adminAccount.module.css';
import Link from "next/link";
import NavBar from "/components/NavBar";
import Footer from "/components/Footer";
import AdminBar from "./adminBar";
import { useRouter } from "next/router";

export default function AdminAccount() {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const acc_id = localStorage.getItem("user_acc_id");
    if (!acc_id) {
      router.push("/login");
      return;
    }
  
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/admin/api_admin_account?acc_id=${acc_id}`);
        const data = await res.json();
  
        if (res.ok && data.account) {
          if (data.account.accRoles !== "Admin") {
            router.push("/account");
            return;
          }
          setAccount(data.account);
        } else {
          router.push("/account"); 
        }
      } catch (err) {
        console.error("Error fetching admin data:", err);
        router.push("/account"); 
      }
    };
  
    fetchData();
  }, []);
  

  return (
    <div className={styles.main}>
      <NavBar />
      <div className={styles.body}>
        <AdminBar />

        <div className={styles.account}>
          <h2>Admin Account</h2>

          <div className={styles.profile}>
            <div className={styles.squareProfile}>
              <div className={styles.circlePosition}>
                <div className={styles.circleProfile}>
                  <img src="/image/profile.png" alt="admin profile" style={{ width: '90px', height: '90px' }} />
                </div>
              </div>

              {account ? (
                <div className={styles.infoAdmin}>
                  <h3>{account.accName}</h3>
                  <h4>Email: {account.email}</h4>
                  <h4>Role: {account.accRoles}</h4>
                </div>
              ) : (
                <div className={styles.infoAdmin}>
                  <p>Loading admin info...</p>
                  {error && <p style={{ color: "red" }}>{error}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

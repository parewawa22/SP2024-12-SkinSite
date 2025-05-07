import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "/styles/admin/adminUser.module.css";
import AdminBar from "./adminBar";
import NavBar from "/components/NavBar";
import Footer from "/components/Footer";

export default function AdminUser() {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [query, setQuery] = useState("");

    const fetchUsers = async () => {
        const res = await fetch("/api/api_user");
        const data = await res.json();
        setUsers(data);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (acc_id, newRole) => {
        const mappedRole = newRole === "User" ? "Member" : "Admin";

        await fetch("/api/api_user", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ acc_id, accRoles: mappedRole }),
        });

        const currentUserId = localStorage.getItem("user_acc_id");
        if (acc_id.toString() === currentUserId) {
            localStorage.setItem("user_role", mappedRole);
            router.push(mappedRole === "Admin" ? "/admin/adminAccount" : "/account");
        } else {
            fetchUsers();
        }
    };

    const filteredUsers = users.filter(
        (u) =>
            u.acc_id.toLowerCase().includes(query) ||
            u.accName.toLowerCase().includes(query)
    );

    const handleDeleteUser = async (acc_id) => {
        const confirmDelete = window.confirm("⚠️ Are you sure you want to delete this user?");
        if (!confirmDelete) return;

        await fetch("/api/api_user", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ acc_id }),
        });

        fetchUsers();
    };


    return (
        <div className={styles.main}>
            <NavBar />
            <div className={styles.body}>
                <AdminBar />
                <div className={styles.AllUser}>
                    <div className={styles.head}>
                        <h2>User Management</h2>
                    </div>
                    <div className={styles.userList}>
                        <div className={styles.searchBox}>
                            <img src="\image\search.png" alt="search" style={{ height: "17px" }} />
                            <input
                                type="text"
                                placeholder="Search by ID or name"
                                onChange={(e) => setQuery(e.target.value.toLowerCase())}
                                style={{ border: "none", outline: "none" }}
                            />
                        </div>
                        <div className={styles.gridHeader}>
                            <h3>ID</h3>
                            <h3>Name</h3>
                            <h3>Email</h3>
                            <h3>Password</h3>
                            <h3>Role</h3>
                            <h3>Actions</h3>
                        </div>
                        {filteredUsers.map((user) => (
                            <div className={styles.gridRow} key={user.acc_id}>
                                <p style={{ fontWeight: "bold" }}>{user.acc_id}</p>
                                <p>{user.accName}</p>
                                <p>{user.email}</p>
                                <p>{user.pwd}</p>
                                <select
                                    className={styles.roleSelect}
                                    value={user.accRoles === "Member" ? "User" : "Admin"}
                                    onChange={(e) => handleRoleChange(user.acc_id, e.target.value)}
                                >
                                    <option value="User">User</option>
                                    <option value="Admin">Admin</option>
                                </select>
                                <div className={styles.editUser}>
                                    <button onClick={() => handleDeleteUser(user.acc_id)}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

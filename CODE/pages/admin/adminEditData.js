import { useEffect, useState } from "react";
import styles from "/styles/admin/adminEditData.module.css";
import AdminBar from "./adminBar";
import NavBar from "/components/NavBar";
import Footer from "/components/Footer";

const TABS = ["Brand", "SkinType", "Ingredient", "Category", "Size", "Benefit", "Concern"];

export default function AdminEditData() {
    const [query, setQuery] = useState("");
    const [activeTab, setActiveTab] = useState("Brand");
    const [data, setData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newItem, setNewItem] = useState({});
    const [editItem, setEditItem] = useState(null);

    useEffect(() => {
        fetch(`/api/admin/api_admin_edit_data?type=${activeTab}`)
            .then((res) => res.json())
            .then(setData);
    }, [activeTab]);

    const openModal = () => {
        setNewItem({}); 
        setShowModal(true);
    };
    const closeModal = () => {
        setShowModal(false);
        setEditItem(null); 
        setNewItem({});
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(`Are you sure to delete this ${activeTab}?`);
        if (!confirmDelete) return;
        await fetch("/api/admin/api_admin_edit_data", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: activeTab, id }),
        });
        setData(data.filter((item) => Object.values(item)[0] !== id));
    };

    const getPrimaryKey = (type) => {
        switch (type) {
            case "Brand": return "brand_id";
            case "SkinType": return "skt_id";
            case "Ingredient": return "ingd_id";
            case "Category": return "cat_id";
            case "Size": return "size_id";
            case "Benefit": return "benefit_id";
            case "Concern": return "concern_id";
            default: return "id";
        }
    };

    const getSearchKeyByType = (type) => {
        switch (type.toLowerCase()) {
            case "brand": return "brandName";
            case "skintype": return "sktName";
            case "ingredient": return "ingdName";
            case "category": return "catName";
            case "size": return "volumn";
            case "benefit": return "benefitName";
            case "concern": return "concernName";
            default: return "name";
        }
    };

    const filteredItems = data.filter((item) => {
        const nameKey = getSearchKeyByType(activeTab);
        const idKey = Object.keys(item)[0]; 

        const nameVal = item[nameKey]?.toString().toLowerCase() || "";
        const idVal = item[idKey]?.toString().toLowerCase() || "";

        return nameVal.includes(query.toLowerCase()) || idVal.includes(query.toLowerCase());
    });

    const handleSubmitNewItem = async () => {
        const payload = {
            type: activeTab,
            values: newItem,
        };

        console.log("🟡 Submitting:", payload);
        console.log("🟨 ActiveTab type:", activeTab);

        const url = "/api/admin/api_admin_edit_data";
        const method = editItem ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const result = await res.json();
        console.log("🟢 API Response:", result);

        closeModal();
        fetch(`/api/admin/api_admin_edit_data?type=${activeTab}`)
            .then((res) => res.json())
            .then(setData);
    };

    return (
        <div className={styles.main}>
            <NavBar />
            <div className={styles.body}>
                <AdminBar />
                <div className={styles.container}>
                    <h2>Edit Management</h2>
                    <div className={styles.tabs}>
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={activeTab === tab ? styles.active : ""}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className={styles.searchBox}>
                        <div className={styles.searchLeft}>
                            <img src="/image/search.png" alt="search" style={{ height: "17px" }} />
                            <input
                                type="text"
                                placeholder={`Search by ID and ${getSearchKeyByType(activeTab)}`}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>
                        <button className={styles.addButton} onClick={openModal}>+ Add {activeTab}</button>
                    </div>
                    <div className={styles.table}>
                        <div className={styles.gridHeader}>
                            {data.length > 0 &&
                                Object.keys(data[0]).map((key) => (
                                    <h3 key={key}>{key}</h3>
                                ))}
                            <h3>Actions</h3>
                        </div>
                        
                        {filteredItems.map((item, index) => (
                            <div className={styles.gridRow} key={index}>
                                {Object.values(item).map((val, idx) => (
                                    <p key={idx}>{val}</p>
                                ))}
                                <div className={styles.actions}>
                                    <button
                                        className={styles.edit}
                                        onClick={() => {
                                            setEditItem(item); 
                                            setNewItem(item); 
                                            setShowModal(true);
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button className={styles.delete} onClick={() => handleDelete(Object.values(item)[0])}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {showModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <h3>{editItem ? `Edit ${activeTab}` : `Add ${activeTab}`}</h3>

                            {Object.keys(data[0] || {})
                                .filter(key => key !== getPrimaryKey(activeTab)) 
                                .map((field) => (
                                    <div key={field}>
                                        <label>{field}</label>
                                        <input
                                            type="text"
                                            value={newItem[field] || ""}
                                            onChange={(e) =>
                                                setNewItem({ ...newItem, [field]: e.target.value })
                                            }
                                        />
                                    </div>
                                ))}
                            <div className={styles.modalButtons}>
                                <button onClick={handleSubmitNewItem}>Save</button>
                                <button onClick={closeModal}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
            <Footer />
        </div>
    );
}

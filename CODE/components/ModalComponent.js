import { useState, useEffect, useRef } from "react";
import styles from "../styles/Modal.module.css";

export default function ModalComponent({ onClose, title, type, accId }) {
    const [options, setOptions] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [selected, setSelected] = useState(null);
    const dropdownRef = useRef();
    const modalRef = useRef(null);

    useEffect(() => {
        const fetchOptions = async () => {
            const res = await fetch(`/api/account/options?type=${type}`);
            const data = await res.json();
            if (res.ok) {
                setOptions(data.options || []);
                setFilteredOptions(data.options || []);
            }
        };
        fetchOptions();
    }, [type]);

    useEffect(() => {
        setFilteredOptions(
            options.filter((opt) =>
                opt.name.toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [searchText, options]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [modalRef, onClose]);

    useEffect(() => {
        const fetchOptions = async () => {
            const endpoint = type === "sktype" ? "/api/account/skintypes" : `/api/account/options?type=${type}`;
            const res = await fetch(endpoint);
            const data = await res.json();
            if (res.ok) {
                setOptions(data.options || []);
                setFilteredOptions(data.options || []);
            }
        };
        fetchOptions();
    }, [type]);

    const handleSelect = (option) => {
        setSelected(option);
        setSearchText(option.name);
        setFilteredOptions([]);
    };

    const handleSubmit = async () => {
        let body = { accid: accId };

        if (type === "benefit") {
            body.benefitid = selected.id;
        } else if (type === "concern") {
            body.concernid = selected.id;
        } else if (type === "ingredient") {
            body.ingdid = selected.id;
        } else if (type === "sktype") {
            body.sktid = selected.id;
        }

        const res = await fetch(
            type === "sktype" ? "/api/account/update_skin_type" : "/api/account/add_user_concern",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            }
        );

        if (res.ok) {
            alert(type === "sktype" ? "Skin Type updated!" : "Added successfully");
            onClose(true);
        } else {
            alert("Failed to save");
            onClose(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} ref={modalRef}>
                <div className={styles.titleWithInfo}>
                    <h3>Add {title}</h3>
                    <div className={styles.infoWrapper}>
                        <div className={styles.infoIcon}>ℹ️</div>
                        <div className={styles.tooltipBox}>
                            <div className={styles.tooltipTitle}>Available Options:</div>
                            <div className={styles.optionGrid}>
                                {options.map((opt, index) => (
                                    <span key={index}>{opt.name}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <input
                    type="text"
                    value={searchText}
                    placeholder="Search..."
                    onChange={(e) => {
                        setSearchText(e.target.value);
                        setSelected(null);
                    }}
                    className={styles.inputBox}
                />
                {searchText.trim() !== "" && filteredOptions.length > 0 && (
                    <ul className={styles.dropdown}>
                        {filteredOptions.map((opt) => (
                            <li key={opt.id} onClick={() => handleSelect(opt)}>
                                {opt.name}
                            </li>
                        ))}
                    </ul>
                )}
                <div className={styles.modalActions}>
                    <button
                        onClick={handleSubmit}
                        disabled={!selected}
                        className={`${styles.modalButton} ${styles.saveButton}`}
                    >
                        Save
                    </button>
                    <button
                        onClick={() => onClose(false)}
                        className={`${styles.modalButton} ${styles.cancelButton}`}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
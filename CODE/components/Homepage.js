import Image from "next/image";
import SearchHome from "./SearchHome";
import { useEffect, useState } from "react";

export default function Homepage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSearchResults = (data, searchQuery) => {
    console.log(data, searchQuery);
  };

  return (
    <>
      <section
        style={{
          position: "relative",
          padding: isMobile ? "200px 20px" : "220px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          src="/image/bg.jpeg"
          alt="Background"
          layout="fill"
          objectFit="cover"
        />
        <div
          style={{
            position: "absolute",
            top: isMobile ? "15%" : "10%",
            right: isMobile ? "auto" : "5%",
            left: isMobile ? "10%" : "auto",
            width: isMobile ? "80%" : "auto",
            color: "white",
            textAlign: isMobile ? "left" : "right",
            marginTop: "20px",
            zIndex: 2,
          }}
        >
          <h1
            style={{
              fontSize: isMobile ? "2rem" : "2.5rem",
              fontWeight: "700",
              fontStyle: "italic",
              color: "black",
            }}
          >
            SKINSITE
          </h1>
          <p
            style={{
              fontWeight: "300",
              color: "black",
              margin: "10px 0",
              fontSize: isMobile ? "0.9rem" : "1rem",
            }}
          >
            Skincare website for searching information for brands in Thailand <br />
            only, such as product name, brand name, ingredient name, etc.
          </p>
          <SearchHome onSearch={handleSearchResults}/>
          <a
            href="/search"
            style={{
              display: "inline-block",
              marginTop: "10px",
              fontSize: isMobile ? "16px" : "16px",
              fontWeight: "300",
              textDecoration: "underline",
              color: "#A8A59D",
            }}
            onMouseOver={(e) => (e.target.style.color = "#7B7A70")}
            onMouseOut={(e) => (e.target.style.color = "#A8A59D")}
          >
            Go to search
          </a>
        </div>
      </section>
      <div
        style={{
          textAlign: "center",
          marginTop: "20px",
        }}
      >
        <p
          style={{
            fontSize: isMobile ? "1.5rem" : "1.8rem",
            fontWeight: "300",
            fontStyle: "italic",
            color: "black",
            marginBottom: "10px",
          }}
        >
          Let us be your skin's refuge.
        </p>
        <hr
          style={{
            width: "80%",
            borderTop: "2px solid #AFA997",
            margin: "30px auto",
          }}
        />
      </div>
    </>
  );
}

import { useState } from "react";

export default function Routine() {
  const [morningOpen, setMorningOpen] = useState(false);
  const [nightOpen, setNightOpen] = useState(false);

  const cardStyle = {
    fontFamily:"Inria Serif",
    maxWidth: "600px",
    margin: "20px auto",
    padding: "20px",
    borderRadius: "15px",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease",
    cursor: "pointer",
  };

  const titleStyle = {
    fontSize: "20px",
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: "10px",
    color: "#333",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const detailsStyle = {
    textAlign: "left",
    fontSize: "16px",
    color: "#444",
    lineHeight: "1.6",
    marginTop: "10px",
  };

  return (
    <div style={{ padding: "10px 20px", fontFamily: "'Inria Serif', sans-serif" }}>
      {/* Morning */}
      <div style={cardStyle} onClick={() => setMorningOpen(!morningOpen)}>
        <div style={titleStyle}>
          <span>🌞 Morning Skincare Routine</span>
          <span>{morningOpen ? "▲" : "▼"}</span>
        </div>
        {morningOpen && (
          <div style={detailsStyle}>
            <p>1. <strong>Cleanser</strong> – Gently cleanse to remove overnight oils.</p>
            <p>2. <strong>Eye cream</strong> – Hydrate and reduce puffiness around the eyes.</p>
            <p>3. <strong>Toner</strong> – Refresh and prep your skin.</p>
            <p>4. <strong>Serum</strong> – Deliver concentrated ingredients to target skin concerns like dullness or fine lines.</p>
            <p>5. <strong>Moisturizer</strong> – Lock in hydration with a lightweight cream.</p>
            <p>6. <strong>Sunscreen</strong> – Don’t skip SPF 50+ even on cloudy days!</p>
          </div>
        )}
      </div>

      {/* Night */}
      <div style={cardStyle} onClick={() => setNightOpen(!nightOpen)}>
        <div style={titleStyle}>
          <span>🌙 Night Skincare Routine</span>
          <span>{nightOpen ? "▲" : "▼"}</span>
        </div>
        {nightOpen && (
          <div style={detailsStyle}>
            <p>1. <strong>Makeup Remover/ Cleansing</strong> – Remove makeup and sunscreen.</p>
            <p>2. <strong>Cleanser</strong> – Deep cleanse your skin.</p>
            <p>3. <strong>Exfoliator/ Scrub</strong> – 2–3 times/week to renew skin surface.</p>
            <p>4. <strong>Toner</strong> – Balance and calm your skin.</p>
            <p>5. <strong>Essence</strong> – Hydrate and prep your skin to better absorb the next skincare steps.</p>
            <p>6. <strong>Eye cream/ Eye Serum</strong> – Target dark circles, puffiness, and fine lines with lightweight hydration.</p>      
            <p>7. <strong>Serum</strong> – Target issues like dryness or fine lines.</p>           
            <p>8. <strong>Eye Mask, Mask</strong> – Refresh tired eyes and deeply treat your skin with targeted hydration or brightening benefits.</p>
            <p>9. <strong>Moisturizer/ Cream</strong> – Seal in hydration and keep your skin soft, smooth, and protected throughout the day or night.</p>
            <p>10. <strong>Sleeping Mask</strong> (Optional) – An overnight treatment that deeply hydrates and revitalizes your skin while you sleep.</p>
          </div>
        )}
      </div>
    </div>
  );
}

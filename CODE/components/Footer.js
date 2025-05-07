export default function Footer() {
  return (
    <footer className="footer">
      <img src="/image/footer.png" alt="Footer Image" className="footer-image" />
      <div className="footer-text">&copy; 2024 SkinSite. All rights reserved.</div>
      <style jsx>{`
        @media (max-width: 768px) {
          .footer {
            padding: 30px 10px;
          }

          .footer-image {
            width: 30%;
          }

          .footer-text {
          display: none;
          }
        }
      `}</style>
    </footer>
    
  );
}

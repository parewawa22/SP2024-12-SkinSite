import NavBar from "../components/NavBar"
import Footer from "/components/Footer";

export default function Contact() {
  const navStyles = {
    link: {
      fontFamily: 'Inria Serif',
      fontSize: '16px',
      fontWeight: 'normal',  
      color: '#90745B',
      textDecoration: 'none'
    }
  };

  const styles = {
    container: {
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#FFF8F3',
    },
    content: {
      marginTop: '80px',
      padding: '40px',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    pageTitle: {
      color: '#90745B',
      textAlign: 'center',
      marginBottom: '3rem',
      fontSize: '40px',
      fontWeight: 'bold',
      fontFamily: 'Inria Serif',
    },
    missionBox: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '10px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      textAlign: 'center',
      marginBottom: '3rem',
    },
    missionTitle: {
      color: '#90745B',
      marginBottom: '1rem',
      fontSize: '20px',
      fontWeight: 'bold',
      fontFamily: 'Inria Serif',
    },
    missionText: {
      color: '#333333',
      fontSize: '16px',
      lineHeight: '1.5',
      fontWeight: 'normal',
      fontFamily: 'Inria Serif',
    },
    teamGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '2rem',
      margin: '2rem 0',
    },
    memberCard: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '10px',
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    memberImage: {
      width: '200px',
      height: '250px',
      borderRadius: '10%',
      marginBottom: '1rem',
      objectFit: 'cover',
    },
    memberName: {
      color: '#333333',
      marginBottom: '0.5rem',
      fontSize: '18px',
      fontWeight: 'normal',
      fontFamily: 'Inria Serif',
    },
    memberRole: {
      color: '#333333',
      fontSize: '16px',
      marginBottom: '1rem',
      fontFamily: 'Inria Serif',
    },
    memberContact: {
      color: '#333333',
      fontSize: '15px',
      lineHeight: '1.4',
      fontFamily: 'Inria Serif',
    },
    advisorSection: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '10px',
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginTop: '3rem',
    },
  };

  return (
    <div style={styles.container}>
      <NavBar customStyles={navStyles} />
      
      <div style={styles.content}>
        <h1 style={styles.pageTitle}>Contact Us</h1>
        
        <div style={styles.missionBox}>
          <h2 style={styles.missionTitle}>Our Mission</h2>
          <p style={styles.missionText}>
          The Thai skincare business grows yearly, but limited access to product information reduces its popularity. Many websites focus on international brands, with little to no presence of Thai products. Existing platforms 
          also have usability issues, making it difficult for users to find key information. To address this problem, SkinSite is being developed to improve access to Thai skincare details, enhance trust in product quality, 
          and provide features like product comparison, quality scoring, ingredient warnings, and personalized routine creation.
          </p>
        </div>

        <div style={styles.advisorSection}>
          <img src="/image/advisor.jpg" alt="Advisor" style={styles.memberImage} />
          <h3 style={styles.memberName}>Asst.Prof.Dr.Jidapa Kraisangka</h3>
          <p style={styles.memberRole}>Project Advisor</p>
          <p style={styles.memberContact}>
            Email: jidapa.kramahidol.ac.th
          </p>
        </div>

        <h2 style={{...styles.missionTitle, marginTop: '3rem', marginBottom: '2rem'}}>Team Members</h2>
        
        <div style={styles.teamGrid}>
          <div style={styles.memberCard}>
            <img src="/image/member1.jpg" alt="Team Member 1" style={styles.memberImage} />
            <h3 style={styles.memberName}>6488152</h3>
            <p style={styles.memberRole}>MISS. WARINTORN JIRATHIPWANGLAD</p>          </div>

          <div style={styles.memberCard}>
            <img src="/image/member2.jpg" alt="Team Member 2" style={styles.memberImage} />
            <h3 style={styles.memberName}>6488187</h3>
            <p style={styles.memberRole}> MISS. TAYAPA SANTIPAP</p>
            
          </div>

          <div style={styles.memberCard}>
            <img src="/image/member3.jpg" alt="Team Member 3" style={styles.memberImage} />
            <h3 style={styles.memberName}>6488207</h3>
            <p style={styles.memberRole}>MISS. SARANPORN CHIRANAKORN</p>
            
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
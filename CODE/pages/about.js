import NavBar from "/components/NavBar";
import styles from '../styles/about.module.css';
import Footer from "/components/Footer";

export default function About() {
  return (
    <div className={styles.main}>
      <NavBar />
      
      <div className={styles.content}>
        <h1 className={styles.pageTitle}>About SkinSite</h1>
        
        <div className={styles.aboutSection}>
          <div className={styles.missionBox}>
            <h2 className={styles.missionTitle}>Our Mission</h2>
            <p className={styles.missionText}>
              SkinSite is dedicated to helping you make informed decisions about your skincare products.
              We provide detailed ingredient analysis, personalized recommendations, and a comprehensive
              database of skincare products to ensure you find the perfect match for your skin.
            </p>
          </div>

          <div className={styles.mainFeatures}>
            <div className={styles.featureCard}>
              <img src="/image/EWG.png" alt="EWG Verified" className={styles.featureImage} />
              <h3 className={styles.featureTitle}>EWG Rating System</h3>
              <div className={styles.featureText}>
                <p>
                The Environmental Working Group is a nonprofit, nonpartisan organization dedicated 
                to helping you live your healthiest life. The Environmental Working Group’s (EWG) 
                Skin Deep® database evaluates personal care products using two rating systems 
                including Hazard Score and Data Availability. </p>
                
                <p> Hazard Score ranges from 1 to 10, 
                indicating the potential health risks associated with a product’s ingredients. 
                A lower score suggests fewer known hazards, while a higher score indicates greater concern. </p>
                
                <p> Data Availability reflects the extent of scientific research available on a product’s 
                ingredients, categorized as none, limited, fair, good, or robust. A higher data availability 
                rating signifies that more information is available to assess the ingredient’s safety. </p>
                
                <p> Moreover,  EWG Verified is the highest standard EWG awards for products that avoid chemicals of concern, 
                disclose all ingredients (including fragrance components), and meet EWG’s strictest health and 
                transparency criteria. EWG’s scientists evaluate products with the EWG VERIFIED® mark to ensure 
                adherence to the highest health Standards. When evaluating products, it’s ideal to look for 
                those with a low hazard score, high data availability, and, if possible, the EWG VERIFIED® mark 
                for additional assurance of safety and transparency.
                </p>

                <ul>
                  <li>Avoid chemicals of concern</li>
                  <li>Provide full transparency in ingredients</li>
                  <li>Follow good manufacturing practices</li>
                  <li>Use enhanced labeling and transparency</li>
                </ul>
              </div>
            </div>

            <div className={styles.featureCard}>
              <img src="/image/risk.png" alt="Hazard Score" className={styles.hazard} />
              <h3 className={styles.featureTitle}>Hazard Score System</h3>
              <div className={styles.featureText}>
              <p>The Environmental Working Group (EWG) assesses the safety of chemical ingredients in 
                cosmetics and skincare products by giving hazard scores, which are ranked from 1-10, 
                with 1 representing the safest and 10 representing the most possible 
                risk of harm. The hazard score system accounts for several factors, including toxicity, 
                allergenicity, bioaccumulation, and environmental effects on humans and ecosystems. For example, 
                higher level 9-10 hazard score ingredients may cause increased skin irritation, endocrine disruption, 
                or longer-term health consequences. By using hazard scores, hazard-scoring organizations like 
                EWG present information about chemical ingredients so consumers can make informed decisions about the products 
                they use and, as a result, whether or which products to purchase. EWG believes this rating system keeps ingredient 
                safety and users' exposure to chemical ingredients more transparent and considered over time. </p>

                <ul className={styles.hazardList}>
                  <li className={styles.safe}>1-3: Low hazard (generally safe)</li>
                  <li className={styles.moderate}>4-6: Moderate hazard (use caution)</li>
                  <li className={styles.high}>7-10: High hazard (potentially unsafe)</li>
                </ul>
              </div>
            </div>

            <div className={styles.featureCard}>
              <img src="/image/data.png" alt="Data Availability" className={`${styles.featureImage} ${styles.largeImage}`} />
              <h3 className={styles.featureTitle}>Data Availability</h3>
              <div className={styles.featureText}>
              <p>This metric reflects the extent of scientific research available for a product’s ingredients. 
                  The scores represent the safety level of each ingredient based on the available data in the database 
                  and the number of scientific studies related to it. This ranking also reflects the extent of scientific 
                  understanding of each substance. Some cosmetic ingredients may not have been thoroughly researched, while 
                  they may show low hazard scores, this could be due to a lack of sufficient data. Therefore, the less 
                  information available, the greater the uncertainty regarding their safety. According to the Environmental Working Group (EWG), 
                  consumers are advised to choose products with low hazard ratings and at least a “fair” level of available information. 
                  To determine the level of data availability, EWG evaluates scientific research using two primary data sources. 
                  The first set, accounting for 50% of the assessment, is based on the scope of data available in the Skin Deep database,
                  which compiles information from approximately 60 public government sources. The second 50% is 
                  derived from the number of studies indexed in PubMed (www.pubmed.gov), a government-supported scientific publication database.
                  </p>
                <ul className={styles.dataList}>
                  <li>Robust: Extensive research available</li>
                  <li>Good: Adequate research support</li>
                  <li>Fair: Some research exists</li>
                  <li>Limited: Very little research</li>
                  <li>None: No research available</li>
                </ul>
              </div>
            </div>
          </div>

          <div className={styles.teamSection}>
            <h2 className={styles.teamTitle}>Our Team</h2>
            <p className={styles.teamText}>
              We are a dedicated team of skincare enthusiasts, developers, and researchers
              working together to provide you with the most accurate and helpful skincare
              information possible.
            </p>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
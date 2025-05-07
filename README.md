# SP2024-12-SkinSite
A skincare web app for Thai products with product comparison, ingredient risk scoring (EWG), personalized routines, and smart search. Supports user reviews and admin product management.

# 🌐 Project Overview
The skincare industry in Thailand is growing, yet many products lack visibility and detailed information on existing platforms. SkinSite fills this gap by providing the following:

- Detailed product and ingredient information
- Safety scores and personalized alerts based on skin concerns
- Product comparisons (up to 3 items)
- Personalized skincare routine creation
- Admin dashboard for data and review management

# 📁 Project Structure
All source code is located in the `CODE` directory.

CODE/
├── components/              # Reusable React components (Navbar, Footer, etc.)
├── database/                # SQL schema files for MySQL database setup
├── pages/                   # Next.js pages (routes)
│   ├── index.js             # Home page
│   ├── Compare.js           # Product comparison page
│   └── ...                  # Other route components
├── public/                  # Static assets like images and icons
├── styles/                  # CSS or module.css files
├── utils/                   # Helper functions
├── next.config.js           # Next.js configuration
├── package.json             # Node dependencies and scripts
├── package-lock.json        # Automatically generated lockfile for exact dependency versions
├── tsconfig.json            # TypeScript config 

# 🚀 Getting Started

## 1. Clone the Repository
git clone https://github.com/yourusername/skinsite.git
cd skinsite/CODE

## 2. Install Dependencies
npm install react react-dom next
npm install

## 3. Database
Go to folder database and open all file in folder and run them

## 4. User and Privileges
Open file .env and change the DB_USER & DB_PASSWORD make sure that DB_HOST is localhost
Note: Make sure you already have the account

## 5. Run the Project
npm run dev

The application will run on http://localhost:3000

# 🧪 Features
- Advanced Search with filters (brand, skin type, concerns)
- Product Score System based on EWG guidelines
- Comparison Tool for up to 3 products
- Wishlist and Routine Set
- Concern Notifications based on user skin profile
- Admin Panel for managing brands, ingredients, and reviews

# 🛠 Tech Stack
- Frontend: React.js, Next.js, CSS
- Backend: Node.js 
- Database: MySQL

# 📈 Future Development
- Include and highlight small and medium enterprise (SME) skincare brands.
- From a website to a fully 100% mobile friendly.
- Provide better product personalization with product recommendations and tools for ingredient exploration.
- Implement more features for improved function and superior user experience.

# 👩‍💻 Authors
Warintorn Jirathipwanglad
Tayapa Santipap
Saranporn Chirannakorn
Advised by: Asst. Prof. Jidapa Kraisangka
Faculty of ICT, Mahidol University
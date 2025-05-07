# SP2024-12 SkinSite

**SkinSite** is a skincare web application designed to promote Thai facial skincare products. It features ingredient transparency, EWG-based safety scores, product comparisons, smart search, personalized routines, and admin controls.

---

## 🌐 Overview

The skincare industry in Thailand is growing, yet many products lack visibility and detailed information on existing platforms. SkinSite fills this gap by providing the following:

- 🌿 Detailed product & ingredient information
- 🚨 Safety scores and personalized alerts based on skin concerns
- 🔍 Smart search with filters (brand, skin type, concern)
- 🧴 Product comparison (up to 3 items)
- 🧑‍💻 Personalized skincare routine creation
- 🛠️ Admin dashboard for managing content

---

## 📁 Project Structure

```
CODE/
├── components/           # Reusable UI components (NavBar, Footer, etc.)
├── database/             # SQL files to initialize MySQL database
├── pages/                # Next.js routing (Compare.js, index.js, etc.)
├── public/               # Static files and assets
├── styles/               # CSS / module styles
├── utils/                # Utility functions
├── next.config.js        # Next.js configuration
├── package.json          # Project metadata and dependencies
├── package-lock.json     # Locked versions of dependencies
└── tsconfig.json         # TypeScript configuration
```

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/skinsite.git
cd CODE
```

### 2️⃣ Install Dependencies

```bash
npm install react react-dom next
npm install
```

### 3️⃣ Setup Database

1. Open the `database/` folder.
2. Run the SQL files in the following **strict order**:

```
1. skinsite.sql
2. Brand.sql
3. SkinType.sql
4. Ingredient.sql
5. Category.sql
6. Size.sql
7. Benefit.sql
8. Concern.sql
9. account_skin.sql
10. Product.sql
11. review.sql
12. step.sql
13. routineset.sql
14. routineStep.sql
15. wishlist.sql
16. price.sql
17. favBrand.sql
18. userConcern.sql
19. productSkinType.sql
20. ingdInProduct.sql
21. concernInProduct.sql
22. benefitInProduct.sql
23. productInBrand.sql
```

### 4️⃣ Configure Environment Variables

Create a `.env` file and define your DB connection:

```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=skinsite
```

> ⚠️ Ensure the user has proper privileges in MySQL.

### 5️⃣ Run the App

```bash
npm run dev
```

Then visit: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Features

- 🔍 **Smart Search** with filters
- 📊 **Score system** based on EWG safety data
- ⚖️ **Comparison tool** for side-by-side product viewing
- ❤️ **Wishlist** & **Routine** creation
- 📋 **Ingredient & concern alerts**
- 🧑‍⚕️ **Admin interface** for managing products and reviews

---

## 🛠 Tech Stack

- **Frontend**: React.js, Next.js
- **Backend**: Node.js
- **Database**: MySQL

---

## 📈 Future Improvements

- Highlight SME (small/medium) Thai skincare brands
- Mobile-first UI/UX design
- Ingredient-based product recommendations
- Implement more features for improved function and superior user experience

---

## 👥 Authors

- Warintorn Jirathipwanglad  
- Tayapa Santipap  
- Saranporn Chirannakorn  

**Advisor**: Asst. Prof. Jidapa Kraisangka  
Faculty of ICT, Mahidol University

---

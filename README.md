# WriteFlow

WriteFlow is a feature-rich blogging platform built with **Next.js 15**, **PostgreSQL**, and **Clerk authentication**. It enables seamless blog creation, management, and sharing with powerful features like **full-text search, likes & comments, bookmarks, analytics, and dark mode**.

## 🚀 Features
- **User Authentication** (Clerk-based login/signup)
- **Create, Edit, and Delete Blogs**
- **Public & Private Blog Management**
- **Full-Text Search (PostgreSQL `tsvector`)**
- **Likes & Comments System**
- **Bookmarks for Saving Blogs**
- **Image Upload (Cloudinary Integration)**
- **User Dashboard with Analytics**
- **Dark Mode Support**
- **Mobile Responsive UI**

## 🛠️ Tech Stack
- **Frontend:** Next.js 15 (App Router), Tailwind CSS
- **Backend:** Next.js API Routes, PostgreSQL
- **Auth:** Clerk
- **Storage:** Cloudinary (for images)
- **Deployment:** Vercel

## 📂 Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/writeflow.git
cd writeflow
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Set Up Environment Variables
Create a `.env.local` file in the root directory and configure the following:
```env
NEXT_PUBLIC_SUPABASE_URL=supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=supabase_anonkey
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=clerk_key
CLERK_SECRET_KEY=clerk_secret_key
CLOUDINARY_CLOUD_NAME=cloudinary_cloud_name
CLOUDINARY_API_KEY=cloudinary_api_key
CLOUDINARY_API_SECRET=cloudinary_secret_key
GEMINI_API_KEY=gemini_api_key
```

### 4️⃣ Run Database Migrations
If using PostgreSQL, ensure you apply migrations:
```bash
npx prisma migrate dev --name init
```

### 5️⃣ Start the Development Server
```bash
npm run dev
```
Your app will be running at `http://localhost:3000`

## 🌍 Deployment (Vercel)
1. Push your code to **GitHub**.
2. Connect your repository to **Vercel**.
3. Add the **same environment variables** in Vercel.
4. Deploy and enjoy 🚀.

## 📜 License
This project is open-source and available under the **MIT License**.

---
### 💡 Contributing
Pull requests are welcome! Feel free to open an issue for feature requests or bug fixes.

Made with ❤️ by Ayush

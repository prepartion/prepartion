# 🎓 Prepartion - EdTech Platform
> **Your Path to Achievement** | Premium Study Materials for Boards, JEE, NEET & CUET.


Prepartion is a full-stack, modern EdTech platform built to provide students with high-quality, expert-curated PDF notes, mind maps, and MCQ Test Series. It features a seamless Student Dashboard for purchasing and accessing materials, alongside a highly secure, OTP-protected Admin Portal for content management.

## ✨ Key Features

### 👨‍🎓 For Students
* **Modern Landing Page**: SEO-optimized, fast-loading, and mobile-responsive UI with animations.
* **Smart Authentication**: Phone OTP & Google Login powered by Firebase.
* **Interactive Dashboard**: Explore study materials by Class ➔ Stream ➔ Subject.
* **My Library**: Secure vault for purchased notes and test series.
* **Instant Access**: View PDFs directly in the browser or download them for offline use.
* **Payment Integration**: Smooth checkout experience (Razorpay).

### 🛡️ For Admins (Highly Secure)
* **Gatekeeper Login**: Hardcoded environment-level security restricting admin access to specific phone numbers/emails only.
* **Analytics Dashboard**: Real-time stats for Total Students, Uploaded Notes, Classes, and Revenue.
* **Content Management**: Full CRUD operations for Classes, Streams, Subjects, and Chapters.
* **Direct Cloudinary Uploads**: Fast, unsigned image and PDF uploads directly from the frontend.
* **Cache-Busting Architecture**: Ensures the admin always sees the 100% fresh data without manual page refreshes.

## 💻 Tech Stack

* **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Lucide Icons
* **Backend**: Next.js API Routes (Serverless)
* **Database**: MongoDB (Mongoose) with connection caching
* **Authentication**: Firebase Auth (Phone & Google)
* **Storage**: Cloudinary (for PDFs and Thumbnails)
* **Payments**: Razorpay
* **Deployment**: Vercel

## ⚙️ Prerequisites

Before you begin, ensure you have met the following requirements:
* Node.js v18+ installed
* A MongoDB Atlas Account (with Network Access set to `0.0.0.0/0` for Vercel)
* Firebase Project Setup (Phone & Google Auth enabled)
* Cloudinary Account (Unsigned Upload Preset configured for PDFs)



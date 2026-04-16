# CivicPulse: Smart Civic Issue Reporting Platform

CivicPulse is a dynamic, browser-based web application that connects citizens, regional administrators, and field workers into a single, unified civic issue reporting pipeline. Built on Vite and Vanilla JavaScript, with a Supabase backend for real-time tracking and database architecture.

## 🚀 Key Features

*   **Robust User/Admin/Worker Hierarchy:** Users can document issues, Admins can route complaints, and Workers own actionable completion flows.
*   **Worker Platform & Geotagging:** A modular interface for field workers to upload "Before/After" pictures via mobile Web-Camera integration tied to background hardware Geolocation telemetry to prove fixes.
*   **AI Analytics Engine (Simulated):** Advanced heuristic tracking that automatically interprets descriptions to generate severity tags, categorize domains (e.g. `[Public Health]`), and draft in-depth analytical reasoning paragraphs.
*   **Premium Glassmorphism Aesthetic:** A highly responsive, slick, floating-card UI with high-contrast elements tailored for readability and performance.

---

## 💻 Tech Stack
*   **Frontend:** Vanilla JS (ES Modules) + HTML5 + CSS3 Variables
*   **Build Tool:** Vite
*   **Backend / Database:** [Supabase](https://supabase.com/) (PostgreSQL & Storage) 
*   **Maps:** Leaflet JS Integration

---

## 🛠️ Step-by-Step Implementation & Run Guide

### 1. Prerequisites
Before beginning, ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v16.0 or better)
*   A package manager like `npm` or `yarn`
*   A free account at [Supabase](https://supabase.com/)

### 2. Connect Your Backend (Supabase)
To establish the live database, you need to configure your Supabase server so the front-end can communicate with it securely.

1.  Log in to Supabase and create a **New Project**.
2.  Once your project builds, navigate to the **SQL Editor** on the left-hand rail.
3.  Copy the entirety of the following SQL script and paste it into the Supabase SQL editor:
    ```sql
    -- ============================================
    -- CivicPulse Full Database Schema
    -- ============================================

    -- 1. USERS TABLE
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'worker')),
      language TEXT NOT NULL DEFAULT 'en',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- 2. REPORTS TABLE
    CREATE TABLE reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      image_url TEXT,
      description TEXT,
      location TEXT,
      issue_type TEXT,
      severity TEXT,
      status TEXT NOT NULL DEFAULT 'Reported',
      estimated_time TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      location_lat DOUBLE PRECISION,
      location_lng DOUBLE PRECISION,
      assigned_worker TEXT,
      completion_proof_url TEXT,
      worker_before_pic_url TEXT,
      worker_after_pic_url TEXT,
      worker_action_lat DOUBLE PRECISION,
      worker_action_lng DOUBLE PRECISION,
      worker_action_time TIMESTAMPTZ
    );

    -- Indexes
    CREATE INDEX idx_reports_user_id ON reports(user_id);
    CREATE INDEX idx_reports_status ON reports(status);

    -- Enable Row Level Security & Policies
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Allow all access on users" ON users FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Allow all access on reports" ON reports FOR ALL USING (true) WITH CHECK (true);
    ```
4.  **Run the script.** This script creates the `users` and `reports` structures automatically, while also establishing the Role Checks (including the `worker` assignment constraints).
5.  Go to the **Storage** section in Supabase and create the required bucket for uploading pictures (e.g., `reports`). Ensure that the Bucket is set up for **Public** access.

### 3. Setup Environment Variables
The application needs to know *where* to talk to your Supabase instance.
1.  Inside the project folder (`civic`), ensure you have a `.env` file containing the following code structure:
    ```env
    VITE_SUPABASE_URL=your_project_url_here
    VITE_SUPABASE_ANON_KEY=your_project_anon_key_here
    VITE_GEMINI_API_KEY=your_gemini_vision_api_key_here
    ```
2.  Retrieve your `URL` and `anon key` values from your Supabase dashboard by going to **Settings > API**.
3.  *(Optional but Recommended)* Create a free Gemini Vision API Key in Google AI Studio to unlock true Live Image capabilities. If left blank, the app gracefully falls back to a simulated keyword-based AI.

### 4. Install Dependencies
Open your terminal, navigate to the `civic` directory, and run the dependency installation process:
```bash
npm install
```

### 5. Start the Development Server
With everything cleanly initialized, fire up Vite:
```bash
npm run dev
```
Open the provided `localhost` link in your web browser. 

---

## 📸 Workflow Test Guide

To get a hang of the pipeline, follow this scenario:

1.  **Be a User:** Click 'User' on the login page > Click an arbitrary name/number > Generate OTP. Enter `Dashboard` and file a report with a camera photo. Note the AI's deep assessment. Log out.
2.  **Be an Admin:** Return to login > Click 'Admin' > Log in. View your submitted report. Click it, assign it to a worker from the dropdown list, and log out. Note the exact worker name you utilized.
3.  **Be a Worker:** Return to login > Click 'Worker' (Camera icon) > Enter the exact Name you designated that worker. Log in. Find the active issue, use the Before and After camera functionalities, mark as 'Completed,' and observe the physical Geotag tracking.

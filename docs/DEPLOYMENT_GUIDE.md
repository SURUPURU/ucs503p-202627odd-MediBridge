# 🚀 MediBridge 2.0 — Production Deployment Guide

This guide walks you through deploying MediBridge to **Render** (Backend API & Ambient Scribe) and **Vercel** (Frontend UI) for free.

---

## 🏗️ Architecture Overview

```
                      ┌───────────────────────────────────────┐
                      │          Vercel (Frontend)            │
                      │   https://medibridge.vercel.app       │
                      └──────────────────┬────────────────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
   ┌─────────────────────────────────┐       ┌─────────────────────────────────┐
   │       Render Web Service 1      │       │       Render Web Service 2      │
   │         medibridge-api          │       │        medibridge-scribe        │
   │  https://...onrender.com/api/v1 │       │      https://...onrender.com    │
   │      (Node.js / Express)        │       │       (Python / FastAPI)        │
   └─────────────────────────────────┘       └─────────────────────────────────┘
```

---

## Part 1: Deploy Backend & Scribe on Render (Free)

Render reads the root `render.yaml` specification and automatically provisions both web services.

### Steps:
1. Go to **[dashboard.render.com](https://dashboard.render.com)** and sign in with GitHub (`SURUPURU`).
2. Click **"New +"** in the top navigation bar and select **"Blueprint"**.
3. Connect your repository: **`SURUPURU/ucs503p-202627odd-MediBridge`** (branch: `main`).
4. Render will detect `render.yaml` and show 2 services:
   - `medibridge-api` (Node.js web service)
   - `medibridge-scribe` (Python web service)
5. Under Environment Variables, fill in your secrets:
   - **`GROQ_API_KEY`**: Your Groq API key (used for fast clinical history summaries and Whisper speech transcription).
   - **`HF_API_TOKEN`**: (Optional) Your HuggingFace token for Bio_ClinicalBERT differential diagnosis.
   - **`CLIENT_URL`**: Leave blank for now (or set to `*`), update it after Vercel gives you your frontend URL.
6. Click **"Apply"**. Render will build and deploy both services!
7. Once deployed, note down your two service URLs:
   - Example Backend: `https://medibridge-api.onrender.com`
   - Example Scribe: `https://medibridge-scribe.onrender.com`

---

## Part 2: Deploy Frontend on Vercel (Free)

### Steps:
1. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub (`SURUPURU` or `kunal-motwani`).
2. Click **"Add New..."** → **"Project"**.
3. Select your repository: **`ucs503p-202627odd-MediBridge`**.
4. In the Project Configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`client`** (or leave as root since `vercel.json` is configured).
5. Open **Environment Variables** and add:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | **`VITE_API_URL`** | `https://medibridge-api.onrender.com` | Your Render Backend API URL |
   | **`VITE_SCRIBE_URL`** | `https://medibridge-scribe.onrender.com` | Your Render Scribe URL |
6. Click **"Deploy"**. Vercel will install dependencies, build with Vite, and assign you a live HTTPS domain (e.g., `https://medibridge-five.vercel.app`).

---

## Part 3: Connect Frontend & Backend CORS

1. Return to the **Render Dashboard** → click `medibridge-api` → **Environment**.
2. Update **`CLIENT_URL`** with your exact Vercel frontend URL:
   ```
   CLIENT_URL=https://medibridge-five.vercel.app
   ```
3. Click **"Save Changes"**. Render will automatically restart the backend with CORS configured for your live site.

---

## ✅ Verification Checklist

- [ ] Open your live Vercel URL in your browser.
- [ ] Log in with demo credentials:
  - Doctor: `doctor@demo.com` / `password123`
  - Patient: `patient@demo.com` / `password123` (PIN: `1234`)
- [ ] Test AI Clinical Summary (Grok sub-second extraction).
- [ ] Test Diagnostic Decision Copilot (Bio_ClinicalBERT ICD-10 suggestions).
- [ ] Test Ambient Scribe (voice microphone capture & live SOAP generation).

# GradeIQ UPSA — Frontend

A student academic management platform built for the University of Professional Studies, Accra (UPSA). GradeIQ gives students a centralised dashboard to track grades, manage their academic profile, and receive system notifications — with a clean, responsive interface designed for everyday use.

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react) ![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite) ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?style=flat&logo=tailwindcss) ![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat&logo=vercel)

---

## Features

- Student authentication with email verification
- Student dashboard with grade overview and GPA tracking
- Student profile page with editable personal information
- Password reset flow via email (Resend API)
- Admin panel for managing students, courses, and results
- Fully responsive UI built with Tailwind CSS

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| HTTP Client | Axios |
| Routing | React Router |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites
- Node.js v18 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/liltymer/upsa-frontend.git
cd upsa-frontend

# Install dependencies
npm install

# environment file
cp .env.example .env

# Start the development server
npm run dev
```

The app will run at `http://localhost:5173`

---

## Environment Variables

```env
VITE_API_BASE_URL=**********
```

---

## Project Structure

```
src/
├── components/      # Reusable UI components
├── pages/           # Route-level page components
├── hooks/           # Custom React hooks
├── services/        # API call functions
└── assets/          # Static assets
```

---

## Related

- [GradeIQ Backend](https://github.com/liltymer/upsa-backend) — FastAPI + PostgreSQL API

---

## Author

**Ahenkora** — IT Management Student & Fullstack Developer  
[LinkedIn](https://www.linkedin.com/in/ahenkora-joshua-owusu-42a691320) · [GitHub](https://github.com/liltymer)

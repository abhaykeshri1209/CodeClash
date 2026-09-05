<div align="center">

# `<CodeClash/>`

### A full-stack, production-style LeetCode clone — built from scratch with the MERN stack

**Solve problems. Get instant judged results. Ask an AI tutor when you're stuck. Manage everything from an admin panel.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Redis](https://img.shields.io/badge/Redis-Token_Blacklist-DC382D?logo=redis&logoColor=white)](https://redis.io)
[![Gemini](https://img.shields.io/badge/Google_Gemini-AI_Tutor-4285F4?logo=googlegemini&logoColor=white)](https://ai.google.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-DaisyUI-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## 🚀 What is CodeClash?

CodeClash is a **complete coding-judge platform** — the kind of product you'd find behind LeetCode or HackerRank — built end-to-end to demonstrate real system design: authentication with token revocation, an online code-execution pipeline, role-based access control, and an integrated AI doubt-solving assistant.

It isn't a UI mockup. Every problem is **actually compiled and executed against test cases**, every submission is **persisted and judged**, and every admin action is **protected by middleware**, not just hidden buttons.

---

## ✨ Feature Highlights

| | |
|---|---|
| 🧩 **Problem Catalog** | Browse problems with difficulty & tag filters, track solved status per user |
| ⚡ **Online Judge** | Run & Submit code in **C++, Java, and JavaScript** via a real compiler API, with visible + hidden test cases |
| 🔐 **Secure Auth** | JWT-based auth in HTTP-only cookies, bcrypt password hashing, and **Redis-backed token blacklisting** on logout |
| 🛡️ **Role-Based Admin Panel** | Dedicated `admin` role can create, update, and delete problems — enforced server-side via middleware, not just the UI |
| 🤖 **AI DSA Tutor** | Google Gemini-powered chat assistant that gives hints and Socratic guidance instead of spoiling the answer |
| 🎬 **Video Editorials** | Admins can upload solution walkthrough videos via signed Cloudinary uploads |
| 📜 **Submission History** | Every run/submit is stored per user, per problem, for later review |
| 🎨 **Modern Editor UX** | Monaco Editor (the engine behind VS Code) for a real IDE feel in the browser |

---

## 🖥️ A Look Inside

<table>
<tr>
<td width="50%">

**Problem Workspace**
Split view with description, tags, and a Monaco-powered code editor supporting multiple languages, plus Run/Submit against real test cases.

</td>
<td width="50%">

**Dashboard**
Clean problem list with difficulty/tag filters and per-user solved badges.

</td>
</tr>
<tr>
<td width="50%">

**Admin Panel**
Create, update, and delete problems — fully gated behind an `admin`-only middleware layer.

</td>
<td width="50%">

**Auth Flow**
Polished signup/login screens with client-side validation (React Hook Form + Zod).

</td>
</tr>
</table>

---

## 🏗️ Architecture

```
┌──────────────────────┐        REST + Cookies        ┌───────────────────────┐
│   React 19 Frontend  │ ────────────────────────────▶ │   Express 5 API       │
│   Redux Toolkit       │ ◀──────────────────────────── │   (JWT + Middleware)  │
│   Monaco Editor       │                               └──────────┬────────────┘
│   TailwindCSS/DaisyUI │                                          │
└──────────────────────┘                     ┌────────────────────┼─────────────────────┐
                                              ▼                    ▼                     ▼
                                     ┌────────────────┐   ┌────────────────┐   ┌──────────────────┐
                                     │   MongoDB       │   │   Redis         │   │  External APIs    │
                                     │  (Mongoose)     │   │ Token Blacklist │   │ OneCompiler (judge)│
                                     │  Users/Problems/│   │                 │   │ Google Gemini (AI) │
                                     │  Submissions    │   │                 │   │ Cloudinary (video) │
                                     └────────────────┘   └────────────────┘   └──────────────────┘
```

**How the judge works:** when a problem is created, the reference solution is executed against every visible test case through the compiler service *before* the problem is ever saved — so no problem goes live with a broken reference solution. User submissions follow the same pipeline against both visible and hidden test cases, and results are normalized into Judge0-style status codes for a consistent frontend experience regardless of the underlying execution provider.

---

## 🛠️ Tech Stack

**Frontend**
- React 19 + React Router v7
- Redux Toolkit for global auth/app state
- Monaco Editor for in-browser code editing
- React Hook Form + Zod for validated forms
- TailwindCSS + DaisyUI for styling
- Vite build tooling

**Backend**
- Node.js + Express 5
- MongoDB with Mongoose ODM
- Redis for JWT blacklist / logout invalidation
- JWT (HTTP-only cookies) + bcrypt for authentication
- Google GenAI SDK (Gemini 2.5 Flash) for the AI tutor
- Cloudinary signed uploads for solution videos
- OneCompiler API as the code-execution/judge engine

---

## 📂 Project Structure

```
Backend/
├── config/            # MongoDB & Redis connections
├── controllers/        # Auth, Problems, Submissions, AI Chat, Video
├── middleware/         # userMiddleware (JWT auth) & adminMiddleware (RBAC)
├── Models/             # user, problem, submission, solutionVideo
├── routes/              # /user, /problem, /submit, /ai, /video
├── utils/               # validator, problemUtility (judge integration)
└── server.js

frontend/
├── src/
│   ├── components/     # AdminPanel, AdminUpload, AdminVideo, ChatAi, Editorial, SubmissionHistory
│   ├── pages/           # HomePage, Login, Signup, ProblemPage, Admin, AdminPanel
│   ├── store/           # Redux store
│   ├── utils/            # axiosClient
│   └── authSlice.js
```

---

## ⚙️ API Overview

| Method | Route | Description | Access |
|---|---|---|---|
| `POST` | `/user/register` | Register a new user | Public |
| `POST` | `/user/login` | Login & receive JWT cookie | Public |
| `POST` | `/user/logout` | Logout & blacklist token in Redis | Authenticated |
| `GET`  | `/user/check` | Validate current session | Authenticated |
| `GET`  | `/problem/getAllProblem` | List all problems | Authenticated |
| `GET`  | `/problem/problemById/:id` | Get problem details | Authenticated |
| `POST` | `/problem/create` | Create a problem (tests reference solution first) | Admin |
| `PUT`  | `/problem/update/:id` | Update a problem | Admin |
| `DELETE` | `/problem/delete/:id` | Delete a problem | Admin |
| `POST` | `/submit/run/:id` | Run code against visible test cases | Authenticated |
| `POST` | `/submit/submit/:id` | Submit code against all test cases | Authenticated |
| `GET`  | `/submit/history/:id` | Get submission history for a problem | Authenticated |
| `POST` | `/ai/chat` | Chat with the Gemini-powered DSA tutor | Authenticated |
| `GET`  | `/video/create/:problemId` | Get signed Cloudinary upload credentials | Admin |
| `POST` | `/video/save` | Save uploaded video metadata | Admin |

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance (local or Atlas)
- Redis instance (local or cloud)
- API keys: OneCompiler, Google Gemini, Cloudinary

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd codeclash

# Backend
cd Backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file inside `Backend/`:

```env
PORT=5000
DB_CONNECT_STRING=your_mongodb_connection_string
JWT_KEY=your_jwt_secret
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASS=your_redis_password
ONECOMPILER_API_KEY=your_onecompiler_api_key
GEMINI_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. Run the App

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd Backend
npm start

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

Visit **`http://localhost:5173`** and sign up to start solving! 🎉

---

## 🔮 Roadmap

- [ ] Global leaderboard & user rating system
- [ ] Contest mode with timed submissions
- [ ] Discussion threads per problem
- [ ] More languages in the judge pipeline (Python, Go)

---

<div align="center">

**Built with ❤️ using the MERN stack**

</div>

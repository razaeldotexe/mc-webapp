# ⛏️ ELFox — Minecraft Content Platform

<div align="center">

**A modern, self-hosted web application for managing and distributing Minecraft content.**

Built with **Next.js 16** · **React 19** · **TypeScript** · **SQLite**

</div>

---

## 📖 Overview

ELFox is a full-stack content management platform designed for Minecraft creators and communities. It provides a sleek, modern interface for uploading, organizing, browsing, and downloading Minecraft content such as **Mods**, **Skins**, **Worlds**, **Texture Packs**, **Add-ons**, and **Templates**.

### ✨ Key Features

- **🗂️ Content Management** — Upload, organize, and manage Minecraft files with metadata (title, description, category, supported versions, Minecraft type)
- **📤 Chunked File Upload** — Supports large files up to **5 GB** with chunked upload for reliability
- **🖼️ Thumbnail Support** — Attach custom thumbnails (JPG, PNG, WebP) to each content entry
- **📊 Admin Dashboard** — Analytics overview with storage usage, content count, category breakdown, and pie charts
- **🔐 Authentication** — Secure admin login with session-based authentication and middleware-protected routes
- **⚙️ Admin Settings** — Change admin username, password, icon, and customize theme colors
- **🎨 Theme Customization** — Choose from multiple accent colors for both admin and visitor dashboards
- **📥 Download & Visit Tracking** — Track download counts and visit statistics per content
- **💾 Storage Management** — Monitor storage usage with configurable limits (default: 1 TB)
- **📄 Content Detail Pages** — Dedicated pages for each content with visit tracking and download links
- **🔍 Search & Filter** — Search content by title and filter by category on the public homepage
- **📱 Responsive Design** — Mobile-friendly layout with collapsible sidebar navigation

---

## 🛠️ Tech Stack

| Layer               | Technology                                                   | Version | Description                                      |
| ------------------- | ------------------------------------------------------------ | ------- | ------------------------------------------------ |
| **Framework**       | [Next.js](https://nextjs.org)                                | 16.1.6  | React-based full-stack framework with App Router |
| **UI Library**      | [React](https://react.dev)                                   | 19.2.3  | Component-based UI library                       |
| **Language**        | [TypeScript](https://www.typescriptlang.org)                 | 5.x     | Static type checking for JavaScript              |
| **Styling**         | [Tailwind CSS](https://tailwindcss.com)                      | 4.x     | Utility-first CSS framework                      |
| **Database**        | [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | 12.6.x  | Fast, synchronous SQLite3 driver for Node.js     |
| **Charts**          | [Recharts](https://recharts.org)                             | 3.7.x   | Composable charting library for React            |
| **Icons**           | [Lucide React](https://lucide.dev)                           | 0.575.x | Beautiful, customizable SVG icon library         |
| **ID Generation**   | [UUID](https://github.com/uuidjs/uuid)                       | 13.x    | RFC-compliant unique ID generation               |
| **Process Manager** | [PM2](https://pm2.keymetrics.io)                             | 6.x     | Production process manager for Node.js           |
| **Linting**         | [ESLint](https://eslint.org)                                 | 9.x     | Pluggable JavaScript/TypeScript linter           |
| **CSS Processing**  | [PostCSS](https://postcss.org)                               | —       | CSS transformation toolchain                     |

---

## 📁 Project Structure

```
elfox/
├── data/                        # SQLite database (auto-created)
│   └── mc-content.db
├── public/
│   └── uploads/                 # Uploaded content & thumbnails
├── src/
│   ├── app/
│   │   ├── page.tsx             # Public homepage (content browsing)
│   │   ├── layout.tsx           # Root layout
│   │   ├── globals.css          # Global styles & theme variables
│   │   ├── content/
│   │   │   └── [id]/page.tsx    # Content detail page
│   │   ├── upload/              # Public upload page
│   │   ├── admin/
│   │   │   ├── page.tsx         # Admin dashboard (analytics)
│   │   │   ├── login/           # Admin login page
│   │   │   ├── contents/        # Content management page
│   │   │   ├── upload/          # Admin file upload page
│   │   │   └── settings/        # Admin settings (account & theme)
│   │   └── api/
│   │       ├── auth/            # Login, logout, session endpoints
│   │       ├── contents/        # CRUD API for content
│   │       ├── upload/          # Chunked file upload API
│   │       ├── download/        # File download endpoint
│   │       ├── storage/         # Storage info endpoint
│   │       ├── settings/        # Settings read/write API
│   │       └── thumbnails/      # Thumbnail serving API
│   ├── components/
│   │   ├── AdminLayoutClient.tsx  # Admin layout wrapper
│   │   ├── ContentCard.tsx        # Reusable content card
│   │   ├── FileUploader.tsx       # Chunked file uploader
│   │   ├── MobileSidebarToggle.tsx# Mobile sidebar control
│   │   ├── Sidebar.tsx            # Admin sidebar navigation
│   │   ├── StorageBar.tsx         # Storage usage indicator
│   │   └── ThemeApplier.tsx       # Dynamic theme color provider
│   ├── lib/
│   │   ├── auth.ts              # Authentication & session logic
│   │   ├── db.ts                # Database schema & helpers
│   │   ├── storage.ts           # Storage calculation utilities
│   │   └── validation.ts        # File & thumbnail validation
│   └── middleware.ts            # Route protection middleware
├── package.json
├── tsconfig.json
├── next.config.ts
└── eslint.config.mjs
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or later
- **npm**, **yarn**, **pnpm**, or **bun**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/razaeldotexe/mc-webapp.git
   cd elfox
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Default Admin Credentials

| Field    | Value      |
| -------- | ---------- |
| Username | `razael`   |
| Password | `admin123` |

> [!CAUTION]
> Change the default admin credentials immediately after first login via **Admin Settings** (`/admin/settings`).

---

## 📜 Available Scripts

| Command         | Description                                  |
| --------------- | -------------------------------------------- |
| `npm run dev`   | Start the development server with hot reload |
| `npm run build` | Build the application for production         |
| `npm run start` | Start the production server                  |
| `npm run lint`  | Run ESLint for code quality checks           |

---

## 🗄️ Database

ELFox uses **SQLite** via `better-sqlite3` for zero-configuration, file-based data storage. The database is automatically created at `data/mc-content.db` on first run.

### Tables

| Table      | Description                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| `contents` | Stores all content metadata (title, description, category, file path, file size, download/visit counts, etc.) |
| `settings` | Key-value store for app configuration (storage limits, admin credentials, theme settings)                     |

The database runs in **WAL mode** for improved concurrent read performance. Schema migrations are handled automatically on startup.

---

## 📦 Supported File Formats

### Content Files

| Extension     | Description                              |
| ------------- | ---------------------------------------- |
| `.mcpack`     | Minecraft Bedrock resource/behavior pack |
| `.mcworld`    | Minecraft Bedrock world export           |
| `.mctemplate` | Minecraft Bedrock world template         |
| `.mcaddon`    | Minecraft Bedrock add-on bundle          |
| `.zip`        | Generic archive                          |
| `.tar`        | Tar archive                              |

### Thumbnail Images

`.jpg` · `.jpeg` · `.png` · `.webp`

**Max file size:** 5 GB per upload

---

## 🎨 Content Categories

| Category       | Label        |
| -------------- | ------------ |
| `mod`          | Mod          |
| `skin`         | Skin         |
| `world`        | World        |
| `texture-pack` | Texture Pack |
| `addon`        | Add-on       |
| `template`     | Template     |
| `other`        | Other        |

---

## 🔒 Authentication

The admin panel is protected by session-based authentication:

- **Middleware** intercepts all `/admin/*` routes (except `/admin/login`)
- Sessions are stored **in-memory** with a **24-hour** expiration
- Passwords are hashed using **SHA-256**
- Admin credentials can be updated via the Settings page

> [!NOTE]
> Sessions are stored in memory and will be cleared on server restart. Users will need to log in again after a restart.

---

## 🌐 Deployment

### Using PM2 (Recommended for Production)

```bash
# Build the application
npm run build

# Start with PM2
npx pm2 start npm --name "elfox" -- start

# Monitor
npx pm2 monit
```

### Using Vercel

Deploy seamlessly to [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)

> [!WARNING]
> SQLite is file-based and may not persist across serverless deployments. For Vercel or similar platforms, consider migrating to a hosted database solution.

---

## 📄 License

This project is private and not licensed for public distribution.

---

<div align="center">

Made with ❤️ by **razael**

</div>

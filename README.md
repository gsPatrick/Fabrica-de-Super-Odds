# Telegram Bot Admin Panel (Frontend)

Interactive, high-end administrative interface for the Telegram Financial Bot.
Built with Next.js 14, CSS Modules, and Framer Motion.

## Design Philosophy
"Silent Sophistication" - Dark Carbon aesthetic, focus on data, cinematic feel.

## Getting Started

1.  **Install Dependencies:**
    ```bash
    cd frontend
    npm install
    ```

2.  **Run Development Server:**
    ```bash
    npm run dev
    ```

3.  **Access:**
    Open `http://localhost:3000` (or `3001` if API is on 3000).
    *Note: Next.js might default to 3000. Ensure API and Frontend don't conflict ports. You might want to run API on 3001 or Frontend on 3001.*

    **Recommended:** Run API on 3001 or modify Frontend `package.json` dev script:
    `"dev": "next dev -p 3001"`

## Features
-   **Login:** Secure entry (verifies against Admin Secret).
-   **Dashboard:** User overview, status indicators.
-   **Actions:** Pre-authorize users, revoke access, remove users.

## Structure
-   `src/app`: App Router pages.
-   `src/components`: UI components (Card, Sidebar).
-   `src/app/globals.css`: Design system variables.

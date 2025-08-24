St. Bakhita Youths - Nkoroi

A production-ready full-stack React application with an integrated Express server, built to support youth-focused digital initiatives. This project leverages modern tooling and best practices to provide a scalable, type-safe, and efficient web platform.

🚀 Tech Stack

Frontend: React 18 + React Router 6 (SPA) + TypeScript + Vite + TailwindCSS 3

Backend: Express server integrated with Vite dev server

Testing: Vitest

UI: Radix UI + TailwindCSS 3 + Lucide React icons

📂 Project Structure

client/                   # React SPA frontend

├── pages/                # Route components (Index.tsx = home)

├── components/ui/        # Pre-built UI component library

├── App.tsx               # SPA routing setup

└── global.css            # TailwindCSS theming and global styles


server/                   # Express API backend

├── index.ts              # Main server setup (express config + routes)

└── routes/               # API handlers


shared/                   # Types used by both client & server

└── api.ts                # Shared API interfaces


🌐 SPA Routing System

The app uses React Router 6 in SPA mode:

client/pages/Index.tsx → Home page

Routes are configured inside client/App.tsx

Catch-all route (*) handles 404 pages

Example route config:

import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";

<Routes>
  <Route path="/" element={<Index />} />
  <Route path="*" element={<NotFound />} />
</Routes>

🎨 Styling System

TailwindCSS 3 utility-first styling

Theme customization in client/global.css and tailwind.config.ts

Reusable UI components in client/components/ui/

Utility: cn() function combines clsx + tailwind-merge

className={cn(
  "base-styles",
  { "active-class": condition },
  props.className
)}

⚡ Express Server Integration

Runs on a single port (8080) in development

Full hot reload (client + server)

API routes are prefixed with /api/

Example Routes

GET /api/ping → Health check

GET /api/demo → Demo endpoint

🔄 Shared Types

Consistent client-server communication using shared types:

import { DemoResponse } from "@shared/api";


Path Aliases:

@/* → Client folder

@shared/* → Shared folder

📜 Development Commands
npm run dev        # Start dev server (client + server)
npm run build      # Build production bundle
npm run start      # Run production server
npm run typecheck  # Run TypeScript checks
npm test           # Run Vitest tests

✨ Adding Features
New API Route

(Optional) Define interface in shared/api.ts:

export interface MyRouteResponse {
  message: string;
}


Create route handler server/routes/my-route.ts:

import { RequestHandler } from "express";
import { MyRouteResponse } from "@shared/api";

export const handleMyRoute: RequestHandler = (req, res) => {
  const response: MyRouteResponse = { message: "Hello from my endpoint!" };
  res.json(response);
};


Register in server/index.ts:

import { handleMyRoute } from "./routes/my-route";
app.get("/api/my-endpoint", handleMyRoute);


Use in React with type safety:

const response = await fetch("/api/my-endpoint");
const data: MyRouteResponse = await response.json();

New Page

Create client/pages/MyPage.tsx

Add route in client/App.tsx:

<Route path="/my-page" element={<MyPage />} />

☁️ Production Deployment

Standard:

npm run build
npm run start


Cloud: Deploy easily to Vercel or Netlify with MCP integrations

Binary builds available for Linux, macOS, and Windows

🏗️ Architecture Notes

Unified dev experience (single port, hot reload)

TypeScript-first (client, server, shared)

Modern UI with Radix + Tailwind + Lucide

Type-safe API communication via shared interfaces

Scalable for youth-focused community projects

✝️ Built for St. Bakhita Youths - Nkoroi to empower digital creativity and innovation by Almark Tech Solutions as Farewell gift.

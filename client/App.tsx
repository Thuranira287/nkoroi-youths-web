import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Context Providers
import { AuthProvider } from "./contexts/AuthContext";

// Layout Component
import Layout from "./components/Layout";

// Pages
import HomePage from "./pages/Index";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import SundayReadingsPage from "./pages/SundayReadings";
import HolyRosaryPage from "./pages/HolyRosary";
import CatholicBiblePage from "./pages/CatholicBible";
import AboutPage from "./pages/About";
import ContactPage from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AnnouncementsPage from "./pages/Announcements";
import TripsPage from "./pages/Trips";
import PlaceholderPage from "./pages/PlaceholderPage";

// Icons for placeholder pages
import { BookOpen, Users, Camera, Cross, Book, Phone } from "lucide-react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes (no layout) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Main Routes (with layout) */}
            <Route
              path="/"
              element={
                <Layout>
                  <HomePage />
                </Layout>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <Layout>
                  <AdminDashboard />
                </Layout>
              }
            />

            {/* Sunday Readings */}
            <Route
              path="/readings"
              element={
                <Layout>
                  <SundayReadingsPage />
                </Layout>
              }
            />

            {/* Announcements */}
            <Route
              path="/announcements"
              element={
                <Layout>
                  <AnnouncementsPage />
                </Layout>
              }
            />

            {/* Trips & Albums */}
            <Route
              path="/trips"
              element={
                <Layout>
                  <TripsPage />
                </Layout>
              }
            />

            {/* Holy Rosary */}
            <Route
              path="/rosary"
              element={
                <Layout>
                  <HolyRosaryPage />
                </Layout>
              }
            />

            {/* Catholic Bible */}
            <Route
              path="/bible"
              element={
                <Layout>
                  <CatholicBiblePage />
                </Layout>
              }
            />

            {/* About Page */}
            <Route
              path="/about"
              element={
                <Layout>
                  <AboutPage />
                </Layout>
              }
            />

            {/* Contact Page */}
            <Route
              path="/contact"
              element={
                <Layout>
                  <ContactPage />
                </Layout>
              }
            />

            {/* 404 Not Found */}
            <Route
              path="*"
              element={
                <Layout>
                  <NotFound />
                </Layout>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);

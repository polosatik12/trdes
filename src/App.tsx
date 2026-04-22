import React, { Suspense, lazy } from "react";
import { suzdalRegistration, igoraRegistration, pushkinRegistration } from "./data/eventRegistrationData";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import CookieBanner from "./components/CookieBanner";

// Eagerly load only the homepage
import IndexPrototype6 from "./pages/IndexPrototype6";

// Retry wrapper for lazy imports (handles stale chunks after redeploy)
function lazyRetry(factory: () => Promise<any>) {
  return lazy(() => factory());
}

// Lazy-load everything else
const Reglament = lazyRetry(() => import("./pages/Reglament"));
const Partners = lazyRetry(() => import("./pages/Partners"));
const Contact = lazyRetry(() => import("./pages/Contact"));
const CorporateLiga = lazyRetry(() => import("./pages/CorporateLiga"));
const Calendar = lazyRetry(() => import("./pages/Calendar"));
const Auth = lazyRetry(() => import("./pages/Auth"));
const YandexCallback = lazyRetry(() => import("./pages/Auth/YandexCallback"));
const Dashboard = lazyRetry(() => import("./pages/Dashboard"));
const Profile = lazyRetry(() => import("./pages/Dashboard/Profile"));
const Participations = lazyRetry(() => import("./pages/Dashboard/Participations"));
const Documents = lazyRetry(() => import("./pages/Dashboard/Documents"));
const HealthCertificate = lazyRetry(() => import("./pages/Dashboard/HealthCertificate"));
const Insurance = lazyRetry(() => import("./pages/Dashboard/Insurance"));
const Payments = lazyRetry(() => import("./pages/Dashboard/Payments"));
const Cart = lazyRetry(() => import("./pages/Dashboard/Cart"));
const CorporateMembers = lazyRetry(() => import("./pages/Dashboard/CorporateMembers"));
const CorporateProfile = lazyRetry(() => import("./pages/Dashboard/CorporateProfile"));
const CorporateRegistration = lazyRetry(() => import("./pages/Dashboard/CorporateRegistration"));
const NotFound = lazyRetry(() => import("./pages/NotFound"));
const Suzdal = lazyRetry(() => import("./pages/Events/Suzdal"));
const Igora = lazyRetry(() => import("./pages/Events/Igora"));
const Pushkin = lazyRetry(() => import("./pages/Events/Pushkin"));

const EventRegistration = lazyRetry(() => import("./pages/Events/EventRegistration"));
const NewsPage = lazyRetry(() => import("./pages/News"));
const NewsArticle = lazyRetry(() => import("./pages/News/NewsArticle"));
const Results = lazyRetry(() => import("./pages/Results"));
const ChuchaWorld = lazyRetry(() => import("./pages/ChuchaWorld"));
const MediaPage = lazyRetry(() => import("./pages/Media"));
const MediaPhotoGallery = lazyRetry(() => import("./pages/Media/MediaPhotoGallery"));
const MediaVideoGallery = lazyRetry(() => import("./pages/Media/MediaVideoGallery"));
const ProtectedRoute = lazyRetry(() => import("./components/auth/ProtectedRoute"));

// CMS Admin pages
const CMSLogin = lazyRetry(() => import("./pages/CMS/CMSLogin"));
const CMSPagesList = lazyRetry(() => import("./pages/CMS/CMSPagesList"));
const CMSEditor = lazyRetry(() => import("./pages/CMS/CMSEditor"));
const CMSNews = lazyRetry(() => import("./pages/CMS/CMSNews"));
const CMSMedia = lazyRetry(() => import("./pages/CMS/CMSMedia"));
const CMSPageRenderer = lazyRetry(() => import("./pages/CMS/CMSPageRenderer"));
const CMSPromoCodes = lazyRetry(() => import("./pages/CMS/CMSPromoCodes"));
const CMSDistances = lazyRetry(() => import("./pages/CMS/CMSDistances"));
const CMSGallery = lazyRetry(() => import("./pages/CMS/CMSGallery"));
const CRM = lazyRetry(() => import("./pages/CRM"));

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
            <Route path="/" element={<IndexPrototype6 />} />
            <Route path="/reglament" element={<Reglament />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/corporate" element={<CorporateLiga />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:slug" element={<NewsArticle />} />
            <Route path="/events/suzdal" element={<Suzdal />} />
            <Route path="/events/igora" element={<Igora />} />
            <Route path="/events/pushkin" element={<Pushkin />} />

            <Route path="/results" element={<Results />} />
            <Route path="/chucha-world" element={<ChuchaWorld />} />
            <Route path="/media" element={<MediaPage />} />
            <Route path="/media/photo/:eventSlug" element={<MediaPhotoGallery />} />
            <Route path="/media/video/:eventSlug" element={<MediaVideoGallery />} />
            <Route path="/events/suzdal/registration" element={<EventRegistration {...suzdalRegistration} />} />
            <Route path="/events/igora/registration" element={<EventRegistration {...igoraRegistration} />} />
            <Route path="/events/pushkin/registration" element={<EventRegistration {...pushkinRegistration} />} />

            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/yandex/callback" element={<YandexCallback />} />
            <Route path="/auth/yandex/success" element={<YandexCallback />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/dashboard/participations" element={<ProtectedRoute><Participations /></ProtectedRoute>} />
            <Route path="/dashboard/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
            <Route path="/dashboard/health" element={<ProtectedRoute><HealthCertificate /></ProtectedRoute>} />
            <Route path="/dashboard/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
            <Route path="/dashboard/payments/success" element={<ProtectedRoute><Payments status="success" /></ProtectedRoute>} />
            <Route path="/dashboard/payments/failed" element={<ProtectedRoute><Payments status="failed" /></ProtectedRoute>} />
            <Route path="/dashboard/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/dashboard/members" element={<ProtectedRoute><CorporateMembers /></ProtectedRoute>} />
            <Route path="/dashboard/corporate-profile" element={<ProtectedRoute><CorporateProfile /></ProtectedRoute>} />
            <Route path="/dashboard/corporate-registration" element={<ProtectedRoute><CorporateRegistration /></ProtectedRoute>} />

            {/* CRM Admin */}
            <Route path="/crm/*" element={<CRM />} />

            {/* CMS Admin */}
            <Route path="/cms/login" element={<CMSLogin />} />
            <Route path="/cms" element={<CMSPagesList />} />
            <Route path="/cms/pages/:id" element={<CMSEditor />} />
            <Route path="/cms/news" element={<CMSNews />} />
            <Route path="/cms/media" element={<CMSMedia />} />
            <Route path="/cms/promo-codes" element={<CMSPromoCodes />} />
            <Route path="/cms/distances" element={<CMSDistances />} />
            <Route path="/cms/gallery" element={<CMSGallery />} />

            {/* CMS-rendered pages */}
            <Route path="/p/:slug" element={<CMSPageRenderer />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <CookieBanner />
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

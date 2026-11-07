import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  RequestSolutionPage, SolutionDetailPage, SolutionsLibraryPage,
} from "./features/solutions";
import Layout from "./site/Layout";
import About from "./site/pages/About";
import Contact from "./site/pages/Contact";
import Faq from "./site/pages/Faq";
import Home from "./site/pages/Home";
import Legal from "./site/pages/Legal";
import NotFound from "./site/pages/NotFound";
import Pricing from "./site/pages/Pricing";
import Products from "./site/pages/Products";
import Services from "./site/pages/Services";
import Waitlist from "./site/pages/Waitlist";
import { watchSystemTheme } from "./theme";
import "./site/site.css"; // must come after the features' CSS

import {
  CategoryPage, ExploreSolutions, IntegrationsPage, SolutionPage, ToolPage, WorkspaceHome, WorkspaceLayout,
} from "./workspace/lazyPages";

watchSystemTheme();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Suspense fallback={<p style={{ padding: 24 }} role="status">Loading…</p>}>
      <Routes>
        <Route path="app" element={<WorkspaceLayout />}>
          <Route index element={<WorkspaceHome />} />
          <Route path="solutions" element={<ExploreSolutions />} />
          <Route path="solutions/:slug" element={<SolutionPage />} />
          <Route path="tools/:slug" element={<ToolPage />} />
          <Route path="category/:category" element={<CategoryPage />} />
          <Route path="integrations" element={<IntegrationsPage />} />
          <Route path="*" element={<WorkspaceHome />} />
        </Route>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="solutions" element={<SolutionsLibraryPage />} />
          <Route path="solutions/request" element={<RequestSolutionPage />} />
          <Route path="solutions/:slug" element={<SolutionDetailPage />} />
          <Route path="services" element={<Services />} />
          <Route path="products" element={<Products />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="waitlist" element={<Waitlist />} />
          <Route path="about" element={<About />} />
          <Route path="faq" element={<Faq />} />
          <Route path="contact" element={<Contact />} />
          <Route path="terms" element={<Legal doc="terms" />} />
          <Route path="privacy" element={<Legal doc="privacy" />} />
          <Route path="refunds" element={<Legal doc="refunds" />} />
          <Route path="cookies" element={<Legal doc="cookies" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);

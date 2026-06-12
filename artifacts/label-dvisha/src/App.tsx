import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import CartPage from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import OrdersPage from "@/pages/orders";
import OrderDetailPage from "@/pages/order-detail";
import GalleryPage from "@/pages/gallery";
import CustomOrderPage from "@/pages/custom-order";
import AboutPage from "@/pages/about";
import ContactPage from "@/pages/contact";
import CollectionPage from "@/pages/collection";
import BlogsPage from "@/pages/blogs";
import BlogPostPage from "@/pages/blog-post";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminCategories from "@/pages/admin/categories";
import AdminOrders from "@/pages/admin/orders";
import AdminCustomOrders from "@/pages/admin/custom-orders";
import AdminUsers from "@/pages/admin/users";
import AdminGallery from "@/pages/admin/gallery";
import AdminBanners from "@/pages/admin/banners";
import AdminSizes from "@/pages/admin/sizes";
import AdminContactMessages from "@/pages/admin/contact-messages";
import AdminBlogs from "@/pages/admin/blogs";
import { ScrollToTop } from "@/components/ScrollToTop";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Redirect to="/login" />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAdmin } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Redirect to="/login" />;
  if (!isAdmin) return <Redirect to="/" />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  setAuthTokenGetter(() => localStorage.getItem("ld_token"));

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/collections/:slug" component={CollectionPage} />
      <Route path="/blogs/:slug" component={BlogPostPage} />
      <Route path="/blogs" component={BlogsPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/checkout">
        <RequireAuth><Checkout /></RequireAuth>
      </Route>
      <Route path="/orders">
        <RequireAuth><OrdersPage /></RequireAuth>
      </Route>
      <Route path="/orders/:id">
        <RequireAuth><OrderDetailPage /></RequireAuth>
      </Route>
      <Route path="/gallery" component={GalleryPage} />
      <Route path="/custom-order" component={CustomOrderPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/login">
        {user ? <Redirect to="/" /> : <Login />}
      </Route>
      <Route path="/signup">
        {user ? <Redirect to="/" /> : <Signup />}
      </Route>

      {/* Admin routes */}
      <Route path="/admin">
        <RequireAdmin><AdminDashboard /></RequireAdmin>
      </Route>
      <Route path="/admin/products">
        <RequireAdmin><AdminProducts /></RequireAdmin>
      </Route>
      <Route path="/admin/categories">
        <RequireAdmin><AdminCategories /></RequireAdmin>
      </Route>
      <Route path="/admin/orders">
        <RequireAdmin><AdminOrders /></RequireAdmin>
      </Route>
      <Route path="/admin/custom-orders">
        <RequireAdmin><AdminCustomOrders /></RequireAdmin>
      </Route>
      <Route path="/admin/contact-messages">
        <RequireAdmin><AdminContactMessages /></RequireAdmin>
      </Route>
      <Route path="/admin/users">
        <RequireAdmin><AdminUsers /></RequireAdmin>
      </Route>
      <Route path="/admin/gallery">
        <RequireAdmin><AdminGallery /></RequireAdmin>
      </Route>
      <Route path="/admin/banners">
        <RequireAdmin><AdminBanners /></RequireAdmin>
      </Route>
      <Route path="/admin/sizes">
        <RequireAdmin><AdminSizes /></RequireAdmin>
      </Route>
      <Route path="/admin/blogs">
        <RequireAdmin><AdminBlogs /></RequireAdmin>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <ScrollToTop />
            <AppRoutes />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

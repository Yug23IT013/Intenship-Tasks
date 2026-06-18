import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import TrackOrder from './pages/TrackOrder';
import Support from './pages/Support';
import './index.css';

const Layout = ({ children }) => (
  <>
    <Navbar />
    <main className="main-wrap">{children}</main>
    <Footer />
  </>
);

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#1e293b',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/products" element={<Layout><Products /></Layout>} />
          <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
          <Route path="/cart" element={<Layout><Cart /></Layout>} />
          <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
          <Route path="/track" element={<Layout><TrackOrder /></Layout>} />
          <Route path="/support" element={<Layout><Support /></Layout>} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;

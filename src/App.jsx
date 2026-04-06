import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { 
  ShoppingBag, Search, User, Heart, Menu, X, 
  Star, Truck, ShieldCheck, Repeat, Gem, 
  ChevronRight, Twitter, Instagram, Facebook, 
  Mail, Phone, MapPin, Sparkles, Plus, Edit2, Trash2, XCircle
} from 'lucide-react';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMhxO5hlxUBpZDuPa4PQkJ4EkIFfzxqf8",
  authDomain: "toko-mas-sri-ayu.firebaseapp.com",
  projectId: "toko-mas-sri-ayu",
  storageBucket: "toko-mas-sri-ayu.firebasestorage.app",
  messagingSenderId: "195511507670",
  appId: "1:195511507670:web:7c373950b65995d8f00777",
  measurementId: "G-1BJ26ZSB0F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const App = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    originalPrice: '',
    rating: 5,
    reviews: 0,
    badge: '',
    image: ''
  });

  // Fetch products from Firestore
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = [];
      querySnapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products: ", error);
      alert('Gagal memuat data produk');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // Update product
        const productRef = doc(db, 'products', editingProduct.id);
        await updateDoc(productRef, formData);
        alert('Produk berhasil diupdate!');
      } else {
        // Add new product
        await addDoc(collection(db, 'products'), formData);
        alert('Produk berhasil ditambahkan!');
      }
      setShowModal(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        category: '',
        price: '',
        originalPrice: '',
        rating: 5,
        reviews: 0,
        badge: '',
        image: ''
      });
      fetchProducts(); // Refresh data
    } catch (error) {
      console.error("Error saving product: ", error);
      alert('Gagal menyimpan produk');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        alert('Produk berhasil dihapus!');
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product: ", error);
        alert('Gagal menghapus produk');
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice || '',
      rating: product.rating,
      reviews: product.reviews,
      badge: product.badge || '',
      image: product.image
    });
    setShowModal(true);
  };

  // Product Modal Form
  const ProductModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h3 className="text-xl font-bold">
            {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h3>
          <button onClick={() => {
            setShowModal(false);
            setEditingProduct(null);
            setFormData({
              name: '', category: '', price: '', originalPrice: '',
              rating: 5, reviews: 0, badge: '', image: ''
            });
          }} className="text-gray-500 hover:text-gray-700">
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Produk *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kategori *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Pilih Kategori</option>
              <option value="Cincin">Cincin</option>
              <option value="Kalung">Kalung</option>
              <option value="Gelang">Gelang</option>
              <option value="Anting">Anting</option>
              <option value="Liontin">Liontin</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Harga *</label>
              <input
                type="text"
                required
                placeholder="Rp 10.000.000"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Harga Original (opsional)</label>
              <input
                type="text"
                placeholder="Rp 12.000.000"
                value={formData.originalPrice}
                onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Jumlah Review</label>
              <input
                type="number"
                value={formData.reviews}
                onChange={(e) => setFormData({...formData, reviews: parseInt(e.target.value)})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Badge (Best Seller/New)</label>
            <input
              type="text"
              placeholder="Best Seller atau New"
              value={formData.badge}
              onChange={(e) => setFormData({...formData, badge: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL Gambar *</label>
            <input
              type="url"
              required
              placeholder="https://images.unsplash.com/..."
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="w-full bg-amber-600 text-white py-3 rounded-xl font-semibold hover:bg-amber-700 transition"
            >
              {editingProduct ? 'Update Produk' : 'Tambah Produk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="font-sans antialiased bg-white text-gray-800">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-amber-800 to-amber-600 text-white py-2 text-center text-sm font-medium">
        <div className="container mx-auto px-4 flex justify-center items-center gap-4 flex-wrap">
          <span>✨ FREE shipping all around Indonesia</span>
          <span className="hidden sm:inline-block">|</span>
          <span>💰 Ready Stock</span>
          <span className="hidden sm:inline-block">|</span>
          <span>🛡️ Money back guarantee</span>
          <span className="hidden sm:inline-block">|</span>
          <span>🔄 Re-sell & Return</span>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Gem className="h-8 w-8 text-amber-600" />
            <span className="text-2xl font-serif font-bold tracking-tight bg-gradient-to-r from-amber-700 to-amber-500 bg-clip-text text-transparent">
              Toko Mas Sri Ayu
            </span>
          </div>

          <nav className="hidden md:flex space-x-8 text-gray-700 font-medium">
            <a href="#" className="hover:text-amber-600 transition">Home</a>
            <a href="#" className="hover:text-amber-600 transition">Koleksi</a>
            <a href="#" className="hover:text-amber-600 transition">Emas Batangan</a>
            <a href="#" className="hover:text-amber-600 transition">Perhiasan</a>
            <a href="#" className="hover:text-amber-600 transition">Custom Order</a>
            <a href="#" className="hover:text-amber-600 transition">About</a>
          </nav>

          <div className="flex items-center gap-4">
            <Search className="h-5 w-5 text-gray-600 cursor-pointer hover:text-amber-600" />
            <User className="h-5 w-5 text-gray-600 cursor-pointer hover:text-amber-600" />
            <Heart className="h-5 w-5 text-gray-600 cursor-pointer hover:text-amber-600" />
            <div className="relative">
              <ShoppingBag className="h-5 w-5 text-gray-600 cursor-pointer hover:text-amber-600" />
              <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {products.length}
              </span>
            </div>
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 flex flex-col space-y-3">
            <a href="#" className="py-2 hover:text-amber-600">Home</a>
            <a href="#" className="py-2 hover:text-amber-600">Koleksi</a>
            <a href="#" className="py-2 hover:text-amber-600">Emas Batangan</a>
            <a href="#" className="py-2 hover:text-amber-600">Perhiasan</a>
            <a href="#" className="py-2 hover:text-amber-600">Custom Order</a>
            <a href="#" className="py-2 hover:text-amber-600">About</a>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-50 via-white to-amber-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1610375461246-83df859d849d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm mb-6">
              <Sparkles className="h-4 w-4" />
              <span>Koleksi Terbaru 2026</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-gray-900 leading-tight">
              Keanggunan Abadi dalam <span className="text-amber-600">Setiap Gram</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-lg">
              Perhiasan emas asli 24K & 18K dengan desain eksklusif. Sertifikat keaslian, garansi resmi, dan layanan custom sesuai impian Anda.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-full font-medium flex items-center justify-center gap-2 transition">
                Belanja Sekarang <ChevronRight className="h-4 w-4" />
              </button>
              <button className="border border-amber-600 text-amber-700 hover:bg-amber-50 px-8 py-3 rounded-full font-medium transition">
                Konsultasi Gratis
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Banner */}
      <section className="py-10 border-y border-gray-100 bg-white">
        <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4">
            <Truck className="h-8 w-8 text-amber-600" />
            <div>
              <h3 className="font-semibold">Gratis Ongkir</h3>
              <p className="text-sm text-gray-500">Seluruh Indonesia</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ShieldCheck className="h-8 w-8 text-amber-600" />
            <div>
              <h3 className="font-semibold">Garansi 100% Asli</h3>
              <p className="text-sm text-gray-500">Sertifikat resmi</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Repeat className="h-8 w-8 text-amber-600" />
            <div>
              <h3 className="font-semibold">Beli Kembali</h3>
              <p className="text-sm text-gray-500">Resell & Return</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Star className="h-8 w-8 text-amber-600" />
            <div>
              <h3 className="font-semibold">Pelanggan Puas</h3>
              <p className="text-sm text-gray-500">Rating 4.9/5</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section with Admin Controls */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">Koleksi Premium</h2>
            <p className="text-gray-500 mt-2">Emas asli dengan sertifikat</p>
          </div>
          
          {/* Admin Button - Add Product */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => {
                setEditingProduct(null);
                setFormData({
                  name: '', category: '', price: '', originalPrice: '',
                  rating: 5, reviews: 0, badge: '', image: ''
                });
                setShowModal(true);
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-full flex items-center gap-2 transition shadow-md"
            >
              <Plus className="h-4 w-4" /> Tambah Produk
            </button>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-500">Memuat produk...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition group relative">
                  {/* Admin Action Buttons */}
                  <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleEdit(product)}
                      className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition shadow-lg"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow-lg"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  
                  <div className="relative overflow-hidden h-64">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
                      }}
                    />
                    {product.badge && (
                      <span className="absolute top-3 left-3 bg-amber-600 text-white text-xs px-2 py-1 rounded-full">
                        {product.badge}
                      </span>
                    )}
                    <button className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-amber-50">
                      <Heart className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-amber-600 mb-1">{product.category}</div>
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-amber-700 font-bold">{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-gray-400 line-through text-sm">{product.originalPrice}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}`} />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
                    </div>
                    <button className="mt-4 w-full border border-amber-600 text-amber-700 py-2 rounded-full text-sm font-medium hover:bg-amber-600 hover:text-white transition">
                      Lihat Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!loading && products.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500">Belum ada produk. Klik "Tambah Produk" untuk mulai menambahkan koleksi.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-amber-900 to-amber-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Ingin Cincin Lamaran Khusus?</h2>
          <p className="text-amber-100 max-w-lg mx-auto mb-8">Kami terima custom desain perhiasan sesuai keinginan Anda. Konsultasi gratis dengan desainer kami.</p>
          <button className="bg-white text-amber-800 hover:bg-amber-50 px-8 py-3 rounded-full font-medium transition shadow-lg">
            Pesan Custom Sekarang
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Gem className="h-6 w-6 text-amber-500" />
                <span className="text-xl font-serif font-bold text-white">Toko Mas Sri Ayu</span>
              </div>
              <p className="text-sm">Perhiasan emas premium dengan sertifikat keaslian. Melayani seluruh Indonesia.</p>
              <div className="flex gap-4 mt-4">
                <Instagram className="h-5 w-5 cursor-pointer hover:text-white" />
                <Facebook className="h-5 w-5 cursor-pointer hover:text-white" />
                <Twitter className="h-5 w-5 cursor-pointer hover:text-white" />
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Tautan Cepat</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Tentang Kami</a></li>
                <li><a href="#" className="hover:text-white">Cara Pemesanan</a></li>
                <li><a href="#" className="hover:text-white">Kebijakan Garansi</a></li>
                <li><a href="#" className="hover:text-white">Pengembalian Barang</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Kategori</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Cincin Emas</a></li>
                <li><a href="#" className="hover:text-white">Kalung & Liontin</a></li>
                <li><a href="#" className="hover:text-white">Gelang & Rantai Tangan</a></li>
                <li><a href="#" className="hover:text-white">Anting & Giwang</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Kontak Kami</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +62 812 3456 7890</li>
                <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> tokomas@srlayu.id</li>
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Jakarta, Indonesia</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            &copy; 2026 Toko Mas Sri Ayu - Toko Emas & Perhiasan Terpercaya. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Product Modal */}
      {showModal && <ProductModal />}
    </div>
  );
};

export default App;

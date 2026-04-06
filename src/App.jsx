import React, { useState } from 'react';
// Icons menggunakan lucide-react (install dulu: npm install lucide-react)
import { 
  ShoppingBag, Search, User, Heart, Menu, X, 
  Star, Truck, ShieldCheck, Repeat, Gem, 
  ChevronRight, Twitter, Instagram, Facebook, 
  Mail, Phone, MapPin, Sparkles
} from 'lucide-react';

const App = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="font-sans antialiased bg-white text-gray-800">
      {/* Top Bar - Promosi */}
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

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Gem className="h-8 w-8 text-amber-600" />
            <span className="text-2xl font-serif font-bold tracking-tight bg-gradient-to-r from-amber-700 to-amber-500 bg-clip-text text-transparent">
              AurumLux
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 text-gray-700 font-medium">
            <a href="#" className="hover:text-amber-600 transition">Home</a>
            <a href="#" className="hover:text-amber-600 transition">Koleksi</a>
            <a href="#" className="hover:text-amber-600 transition">Emas Batangan</a>
            <a href="#" className="hover:text-amber-600 transition">Perhiasan</a>
            <a href="#" className="hover:text-amber-600 transition">Custom Order</a>
            <a href="#" className="hover:text-amber-600 transition">About</a>
          </nav>

          {/* Icons kanan */}
          <div className="flex items-center gap-4">
            <Search className="h-5 w-5 text-gray-600 cursor-pointer hover:text-amber-600" />
            <User className="h-5 w-5 text-gray-600 cursor-pointer hover:text-amber-600" />
            <Heart className="h-5 w-5 text-gray-600 cursor-pointer hover:text-amber-600" />
            <div className="relative">
              <ShoppingBag className="h-5 w-5 text-gray-600 cursor-pointer hover:text-amber-600" />
              <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                0
              </span>
            </div>
            {/* Mobile menu button */}
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
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

      {/* Best Seller Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">Best Seller</h2>
            <p className="text-gray-500 mt-2">Pilihan paling diminati bulan ini</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition group">
                <div className="relative overflow-hidden h-64">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-amber-600 text-white text-xs px-2 py-1 rounded-full">{product.badge}</span>
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
                      <Star key={i} className={`h-3 w-3 ${i < product.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}`} />
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
                <span className="text-xl font-serif font-bold text-white">AurumLux</span>
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
                <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@aurumlux.id</li>
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Jakarta, Indonesia</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            &copy; 2026 AurumLux - Toko Emas & Perhiasan Terpercaya. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

// Data produk contoh
const products = [
  {
    id: 1,
    name: "Cincin Solitaire 1ct",
    category: "Cincin",
    price: "Rp 12.500.000",
    originalPrice: "Rp 15.000.000",
    rating: 5,
    reviews: 42,
    badge: "Best Seller",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&auto=format"
  },
  {
    id: 2,
    name: "Kalung Mutiara Emas",
    category: "Kalung",
    price: "Rp 8.900.000",
    rating: 4,
    reviews: 28,
    badge: null,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format"
  },
  {
    id: 3,
    name: "Gelang Rantai Venice",
    category: "Gelang",
    price: "Rp 5.750.000",
    rating: 5,
    reviews: 19,
    badge: "New",
    image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=500&auto=format"
  },
  {
    id: 4,
    name: "Anting Hanging Drop",
    category: "Anting",
    price: "Rp 3.200.000",
    rating: 4,
    reviews: 35,
    badge: null,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format"
  }
];

export default App;

import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Menu, X, Send } from 'lucide-react';

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyCMhxO5hlxUBpZDuPa4PQkJ4EkIFfzxqf8",
  authDomain: "toko-mas-sri-ayu.firebaseapp.com",
  projectId: "toko-mas-sri-ayu",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// KADAR
const KADAR_FORMULA = {
  '8K': { factoryCostRate: 0.46 },
  '16K': { factoryCostRate: 0.70 },
  '24K': { factoryCostRate: 1.00 },
};

export default function App() {
  const [view, setView] = useState('landing');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const [goldPrice, setGoldPrice] = useState(2550000);
  const [margin, setMargin] = useState(15);
  const [buyback, setBuyback] = useState(8);

  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });

  // AUTH
  useEffect(() => {
    signInAnonymously(auth);

    const unsubSettings = onSnapshot(doc(db, "toko_sri_ayu", "settings"), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setGoldPrice(d.goldPrice || 2550000);
        setMargin(d.margin || 15);
        setBuyback(d.buyback || 8);
      }
    });

    const unsubProducts = onSnapshot(doc(db, "toko_sri_ayu", "products"), (snap) => {
      if (snap.exists()) setProducts(snap.data().data || []);
    });

    return () => {
      unsubSettings();
      unsubProducts();
    };
  }, []);

  const prices = useMemo(() => {
    let result = {};
    Object.keys(KADAR_FORMULA).forEach(k => {
      const base = goldPrice * KADAR_FORMULA[k].factoryCostRate;
      const sell = Math.ceil((base * (1 + margin / 100)) / 5000) * 5000;
      result[k] = sell;
    });
    return result;
  }, [goldPrice, margin]);

  const formatRp = (n) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(n);

  const addToCart = (p) => {
    if (p.isSold || p.isPending) return alert('Barang tidak tersedia');
    if (cart.find(c => c.id === p.id)) return alert('Sudah di keranjang');
    setCart([...cart, p]);
  };

  const checkout = async () => {
    if (!customer.name || !customer.phone) {
      alert('Isi data lengkap');
      return;
    }

    const invoice = 'INV-' + Date.now();

    const order = {
      id: invoice,
      customer,
      items: cart.map(i => ({
        ...i,
        lockedPrice: prices[i.kadar]
      })),
      total: cart.reduce((s, i) => s + (i.weight * prices[i.kadar]), 0),
      status: 'Menunggu'
    };

    await setDoc(doc(db, "toko_sri_ayu", "orders"), {
      data: [order]
    });

    const text = `Halo, saya mau order%0A${invoice}%0ATotal: ${order.total}`;
    window.open(`https://wa.me/6282299081829?text=${text}`);

    setCart([]);
    setView('landing');
  };

  return (
    <div className="font-sans bg-white min-h-screen">

      {/* NAVBAR */}
      <div className="flex justify-between p-4 border-b">
        <div className="font-serif text-xl font-bold">Sri Ayu</div>
        <div className="hidden md:flex gap-6 text-sm">
          <button onClick={() => setView('landing')}>Home</button>
          <button onClick={() => setView('catalog')}>Collection</button>
          <button onClick={() => setView('contact')}>Contact</button>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setView('cart')}><ShoppingCart /></button>
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X/> : <Menu/>}
          </button>
        </div>
      </div>

      {/* LANDING */}
      {view === 'landing' && (
        <div className="text-center py-32 px-4">
          <h1 className="text-4xl font-serif mb-4">Perhiasan Emas Elegan</h1>
          <p className="text-gray-500 mb-6">Toko Mas Sri Ayu Wonosobo</p>
          <button onClick={() => setView('catalog')} className="bg-black text-white px-6 py-3 rounded-full">
            Lihat Koleksi
          </button>
        </div>
      )}

      {/* CATALOG */}
      {view === 'catalog' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6">
          {products.map(p => (
            <div key={p.id} className="border rounded-xl overflow-hidden">
              <img src={p.imageUrl} className="h-40 w-full object-cover"/>
              <div className="p-3">
                <h3 className="font-bold text-sm">{p.name}</h3>
                <p className="text-amber-600 font-bold">
                  {formatRp(p.weight * prices[p.kadar])}
                </p>
                <button onClick={() => addToCart(p)} className="mt-2 w-full bg-black text-white py-2 rounded">
                  Beli
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CART */}
      {view === 'cart' && (
        <div className="p-6 max-w-lg mx-auto">
          <h2 className="text-xl font-bold mb-4">Keranjang</h2>
          {cart.map(i => (
            <div key={i.id} className="flex justify-between mb-2">
              <span>{i.name}</span>
              <span>{formatRp(i.weight * prices[i.kadar])}</span>
            </div>
          ))}

          <input placeholder="Nama" className="border p-2 w-full mt-4" onChange={e => setCustomer({...customer, name: e.target.value})}/>
          <input placeholder="No HP" className="border p-2 w-full mt-2" onChange={e => setCustomer({...customer, phone: e.target.value})}/>
          <textarea placeholder="Alamat" className="border p-2 w-full mt-2" onChange={e => setCustomer({...customer, address: e.target.value})}/>

          <button onClick={checkout} className="mt-4 w-full bg-green-500 text-white py-3 flex justify-center gap-2">
            Checkout <Send size={16}/>
          </button>
        </div>
      )}

      {/* CONTACT */}
      {view === 'contact' && (
        <div className="p-10 text-center">
          <h2 className="text-2xl font-serif mb-4">Kunjungi Toko Kami</h2>
          <p>Jl. Pasar 2 No 33, Wonosobo</p>
          <p>WA: 082299081829</p>
        </div>
      )}

    </div>
  );
}

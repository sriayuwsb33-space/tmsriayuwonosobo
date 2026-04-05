import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, ArrowLeft, Send } from 'lucide-react';

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCMhxO5hlxUBpZDuPa4PQkJ4EkIFfzxqf8", 
  authDomain: "toko-mas-sri-ayu.firebaseapp.com",
  projectId: "toko-mas-sri-ayu",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const KADAR_FORMULA = {
  '8K': { factoryCostRate: 0.46 },
  '16K': { factoryCostRate: 0.70 },
  '24K': { factoryCostRate: 1.00 },
};

export default function App() {
  const [view, setView] = useState('landing');
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [cart, setCart] = useState([]);

  const [goldPrice, setGoldPrice] = useState(2550000);
  const [margin, setMargin] = useState(15);

  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    signInAnonymously(auth);

    const unsubSettings = onSnapshot(doc(db, "toko_sri_ayu", "settings"), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setGoldPrice(d.goldPrice || 2550000);
        setMargin(d.margin || 15);
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
    if (!customer.name || !customer.phone) return alert('Isi data lengkap');

    const invoice = 'INV-' + Date.now();

    const order = {
      id: invoice,
      customer,
      items: cart.map(i => ({ ...i, lockedPrice: prices[i.kadar] })),
      total: cart.reduce((s, i) => s + (i.weight * prices[i.kadar]), 0),
      status: 'Menunggu'
    };

    await updateDoc(doc(db, "toko_sri_ayu", "orders"), {
      data: arrayUnion(order)
    });

    const text = `Halo, saya mau order%0A${invoice}%0ATotal: ${order.total}`;
    window.open(`https://wa.me/6282299081829?text=${text}`);

    setCart([]);
    setView('landing');
  };

  return (
    <div className="bg-white min-h-screen font-serif">

      {/* NAVBAR */}
      <div className="flex justify-between items-center p-6 border-b text-sm">
        <div className="text-xl font-bold">Sri Ayu</div>
        <div className="flex gap-8">
          <button onClick={() => setView('landing')}>Home</button>
          <button onClick={() => setView('catalog')}>Collection</button>
          <button onClick={() => setView('cart')}>Cart ({cart.length})</button>
        </div>
      </div>

      {/* LANDING */}
      {view === 'landing' && (
        <div className="relative h-[80vh] w-full overflow-hidden">
          {/* Background Image */}
          <img 
            src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1600&q=80"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Overlay gelap biar elegan */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center items-center h-full text-white text-center px-4">
            <h1 className="text-4xl md:text-6xl mb-6 tracking-wide">
              Elegance in Gold
            </h1>

            <p className="text-sm md:text-lg mb-8 text-gray-200 max-w-xl">
              Koleksi perhiasan emas elegan dari Toko Mas Sri Ayu Wonosobo
            </p>

            <button 
              onClick={() => setView('catalog')} 
              className="border border-white px-8 py-3 hover:bg-white hover:text-black transition"
            >
              View Collection
            </button>
          </div>
        </div>
      )} className="border px-8 py-3">
            View Collection
          </button>
        </div>
      )}

      {/* CATALOG */}
      {view === 'catalog' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 p-10">
          {products.map(p => (
            <div key={p.id} onClick={() => {setSelected(p); setView('detail')}} className="cursor-pointer">
              <img src={p.imageUrl} className="h-64 w-full object-cover mb-4"/>
              <h3 className="text-sm">{p.name}</h3>
              <p className="text-gray-500 text-sm">
                {formatRp(p.weight * prices[p.kadar])}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL */}
      {view === 'detail' && selected && (
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 p-10">
          <img src={selected.imageUrl} className="w-full object-cover"/>

          <div>
            <button onClick={() => setView('catalog')} className="mb-6 flex items-center gap-2 text-sm">
              <ArrowLeft size={16}/> Back
            </button>

            <h2 className="text-3xl mb-4">{selected.name}</h2>

            <p className="text-gray-500 mb-6">
              Perhiasan emas berkualitas tinggi dengan desain elegan, cocok untuk berbagai kesempatan spesial Anda.
            </p>

            <p className="text-2xl mb-6">
              {formatRp(selected.weight * prices[selected.kadar])}
            </p>

            <button onClick={() => addToCart(selected)} className="w-full border py-3 mb-3">
              Add to Cart
            </button>

            <button onClick={() => {addToCart(selected); setView('cart')}} className="w-full bg-black text-white py-3">
              Buy Now
            </button>
          </div>
        </div>
      )}

      {/* CART */}
      {view === 'cart' && (
        <div className="max-w-lg mx-auto p-10">
          <h2 className="text-2xl mb-6">Your Cart</h2> 

          {cart.map(i => (
            <div key={i.id} className="flex justify-between mb-3">
              <span>{i.name}</span>
              <span>{formatRp(i.weight * prices[i.kadar])}</span>
            </div>
          ))}

          <input placeholder="Nama" className="border p-2 w-full mt-6" onChange={e => setCustomer({...customer, name: e.target.value})}/>
          <input placeholder="No HP" className="border p-2 w-full mt-2" onChange={e => setCustomer({...customer, phone: e.target.value})}/>
          <textarea placeholder="Alamat" className="border p-2 w-full mt-2" onChange={e => setCustomer({...customer, address: e.target.value})}/>

          <button onClick={checkout} className="mt-6 w-full bg-black text-white py-3 flex justify-center gap-2">
            Checkout <Send size={16}/>
          </button>
        </div>
      )}

      {/* FOOTER */}
      <div className="text-center text-xs text-gray-500 py-10 border-t mt-20">
        Jl. Pasar 2 No 33, Wonosobo • WA 082299081829
      </div>

    </div>
  );
}

import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, ArrowLeft, Send, Lock } from 'lucide-react';

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";
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
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [cart, setCart] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

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

    const unsubOrders = onSnapshot(doc(db, "toko_sri_ayu", "orders"), (snap) => {
      if (snap.exists()) setOrders(snap.data().data || []);
    });

    return () => {
      unsubSettings();
      unsubProducts();
      unsubOrders();
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

    await setDoc(doc(db, "toko_sri_ayu", "orders"), {
      data: [order, ...orders]
    });

    window.open(`https://wa.me/6282299081829?text=Order%20${invoice}`);

    setCart([]);
    setView('landing');
  };

  const confirmOrder = async (id) => {
    const updated = orders.map(o => o.id === id ? { ...o, status: 'Selesai' } : o);
    await setDoc(doc(db, "toko_sri_ayu", "orders"), { data: updated });
  };

  return (
    <div className="bg-white min-h-screen font-serif">

      {/* NAVBAR */}
      <div className="flex justify-between items-center p-6 border-b text-sm">
        <div className="text-xl font-bold">Sri Ayu</div>
        <div className="flex gap-6">
          <button onClick={() => setView('landing')}>Home</button>
          <button onClick={() => setView('catalog')}>Collection</button>
          <button onClick={() => setView('cart')}>Cart ({cart.length})</button>
          <button onClick={() => {setIsAdmin(true); setView('admin')}}><Lock size={16}/></button>
        </div>
      </div>

      {/* LANDING */}
      {view === 'landing' && (
        <div className="relative h-[80vh]">
          <img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1600&q=80" className="absolute w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-black/40"/>
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
            <h1 className="text-5xl mb-4">Elegance in Gold</h1>
            <button onClick={() => setView('catalog')} className="border px-6 py-3">Shop Now</button>
          </div>
        </div>
      )}

      {/* CATALOG */}
      {view === 'catalog' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 p-10">
          {products.map(p => (
            <div key={p.id} onClick={() => {setSelected(p); setView('detail')}}>
              <img src={p.imageUrl} className="h-64 w-full object-cover"/>
              <h3>{p.name}</h3>
              <p>{formatRp(p.weight * prices[p.kadar])}</p>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL */}
      {view === 'detail' && selected && (
        <div className="p-10 grid md:grid-cols-2 gap-10">
          <img src={selected.imageUrl}/>
          <div>
            <button onClick={() => setView('catalog')}><ArrowLeft/> Back</button>
            <h2 className="text-3xl">{selected.name}</h2>
            <p className="mt-4">{formatRp(selected.weight * prices[selected.kadar])}</p>
            <button onClick={() => addToCart(selected)} className="mt-4 border px-4 py-2">Add</button>
          </div>
        </div>
      )}

      {/* CART */}
      {view === 'cart' && (
        <div className="p-10 max-w-lg mx-auto">
          {cart.map(i => (
            <div key={i.id} className="flex justify-between">
              <span>{i.name}</span>
              <span>{formatRp(i.weight * prices[i.kadar])}</span>
            </div>
          ))}
          <input placeholder="Nama" onChange={e => setCustomer({...customer, name: e.target.value})}/>
          <input placeholder="HP" onChange={e => setCustomer({...customer, phone: e.target.value})}/>
          <button onClick={checkout} className="bg-black text-white w-full mt-4 py-3">Checkout</button>
        </div>
      )}

      {/* ADMIN */}
      {view === 'admin' && isAdmin && (
        <div className="p-10">
          <h2 className="text-2xl mb-6">Admin Panel</h2>
          {orders.map(o => (
            <div key={o.id} className="border p-4 mb-3">
              <p>{o.customer.name}</p>
              <p>{formatRp(o.total)}</p>
              <p>{o.status}</p>
              {o.status === 'Menunggu' && (
                <button onClick={() => confirmOrder(o.id)} className="bg-green-500 text-white px-3 py-1 mt-2">Confirm</button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="text-center py-10 text-xs">
        Jl. Pasar 2 No 33 Wonosobo • WA 082299081829
      </div>

    </div>
  );
}
 

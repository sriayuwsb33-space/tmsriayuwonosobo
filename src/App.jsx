// APP FINAL - TOKO MAS SRI AYU WONOSOBO
// Full fitur: harga dinamis, admin, produk, order, user block, upload gambar

import React, { useState, useEffect, useMemo } from 'react';
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

// KADAR SETTINGS (BISA DIUBAH ADMIN)
const DEFAULT_KADAR = {
  '6K': { sell: 0.34, buy: 0.27 },
  '8K': { sell: 0.445, buy: 0.35 },
  '9K': { sell: 0.49, buy: 0.39 },
};

export default function App() {
  const [view, setView] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);

  const [goldPrice, setGoldPrice] = useState(2550000);
  const [kadar, setKadar] = useState(DEFAULT_KADAR);

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState(null);

  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [newProduct, setNewProduct] = useState({ name: '', weight: '', kadar: '8K', imageUrl: '' });

  // INIT
  useEffect(() => {
    signInAnonymously(auth);

    const unsubSettings = onSnapshot(doc(db, "toko_sri_ayu", "settings"), snap => {
      if (snap.exists()) {
        const d = snap.data();
        setGoldPrice(d.goldPrice || 2550000);
        setKadar(d.kadar || DEFAULT_KADAR);
      }
    });

    const unsubProducts = onSnapshot(doc(db, "toko_sri_ayu", "products"), snap => {
      if (snap.exists()) setProducts(snap.data().data || []);
    });

    const unsubOrders = onSnapshot(doc(db, "toko_sri_ayu", "orders"), snap => {
      if (snap.exists()) setOrders(snap.data().data || []);
    });

    const unsubUsers = onSnapshot(doc(db, "toko_sri_ayu", "users"), snap => {
      if (snap.exists()) setUsers(snap.data().data || []);
    });

    return () => {
      unsubSettings();
      unsubProducts();
      unsubOrders();
      unsubUsers();
    };
  }, []);

  // PRICE ENGINE
  const prices = useMemo(() => {
    let result = {};
    Object.keys(kadar).forEach(k => {
      const sell = Math.ceil((goldPrice * kadar[k].sell) / 5000) * 5000;
      const buy = Math.floor((goldPrice * kadar[k].buy) / 5000) * 5000;
      result[k] = { sell, buy };
    });
    return result;
  }, [goldPrice, kadar]);

  const formatRp = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  // UPLOAD IMAGE
  const uploadImage = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setNewProduct({ ...newProduct, imageUrl: reader.result });
    reader.readAsDataURL(file);
  };

  // ADD PRODUCT
  const addProduct = async () => {
    const data = [...products, { ...newProduct, id: Date.now(), isSold: false, isPending: false }];
    await setDoc(doc(db, "toko_sri_ayu", "products"), { data });
  };

  // ADD TO CART
  const addToCart = (p) => {
    if (p.isSold || p.isPending) return alert('Tidak tersedia');
    setCart([...cart, p]);
  };

  // CHECK USER BLOCK
  const isBlocked = () => {
    const u = users.find(u => u.phone === customer.phone);
    return u?.isBlocked;
  };

  // CHECKOUT
  const checkout = async () => {
    if (isBlocked()) return alert('Anda diblokir');

    const order = {
      id: 'INV-' + Date.now(),
      customer,
      items: cart,
      total: cart.reduce((s, i) => s + (i.weight * prices[i.kadar].sell), 0),
      status: 'Menunggu',
      expiredAt: Date.now() + 3600000
    };

    await setDoc(doc(db, "toko_sri_ayu", "orders"), { data: [order, ...orders] });

    window.open(`https://wa.me/6282299081829?text=Order%20${order.id}`);
    setCart([]);
  };

  // ADMIN ACTIONS
  const confirmOrder = async (id) => {
    const updated = orders.map(o => o.id === id ? { ...o, status: 'Selesai' } : o);
    await setDoc(doc(db, "toko_sri_ayu", "orders"), { data: updated });
  };

  const cancelOrder = async (id) => {
    const updated = orders.map(o => o.id === id ? { ...o, status: 'Dibatalkan' } : o);
    await setDoc(doc(db, "toko_sri_ayu", "orders"), { data: updated });
  };

  const blockUser = async (phone) => {
    const updated = users.map(u => u.phone === phone ? { ...u, isBlocked: true } : u);
    await setDoc(doc(db, "toko_sri_ayu", "users"), { data: updated });
  };

  // SAVE SETTINGS
  const saveSettings = async () => {
    await setDoc(doc(db, "toko_sri_ayu", "settings"), { goldPrice, kadar });
  };

  // UI
  return (
    <div className="p-6">

      {/* NAV */}
      <div className="flex justify-between mb-6">
        <h1 className="text-xl font-bold">Sri Ayu Gold</h1>
        <div className="flex gap-4">
          <button onClick={() => setView('home')}>Home</button>
          <button onClick={() => setView('catalog')}>Catalog</button>
          <button onClick={() => setView('cart')}>Cart ({cart.length})</button>
          <button onClick={() => {setIsAdmin(true); setView('admin')}}>Admin</button>
        </div>
      </div>

      {/* HOME */}
      {view === 'home' && (
        <div className="h-[70vh] bg-black text-white flex items-center justify-center">
          <h2 className="text-4xl">Toko Mas Sri Ayu</h2>
        </div>
      )}

      {/* CATALOG */}
      {view === 'catalog' && products.map(p => (
        <div key={p.id} onClick={() => {setSelected(p); setView('detail')}}>
          <img src={p.imageUrl} width="200"/>
          <p>{p.name}</p>
          <p>{formatRp(p.weight * prices[p.kadar].sell)}</p>
        </div>
      ))}

      {/* DETAIL */}
      {view === 'detail' && selected && (
        <div>
          <button onClick={() => setView('catalog')}>Back</button>
          <img src={selected.imageUrl} width="300"/>
          <h2>{selected.name}</h2>
          <p>{formatRp(selected.weight * prices[selected.kadar].sell)}</p>
          <button onClick={() => addToCart(selected)}>Add</button>
        </div>
      )}

      {/* CART */}
      {view === 'cart' && (
        <div>
          {cart.map(i => (
            <p key={i.id}>{i.name}</p>
          ))}
          <input placeholder="Nama" onChange={e => setCustomer({...customer, name: e.target.value})}/>
          <input placeholder="HP" onChange={e => setCustomer({...customer, phone: e.target.value})}/>
          <button onClick={checkout}>Checkout</button>
        </div>
      )}

      {/* ADMIN */}
      {view === 'admin' && isAdmin && (
        <div>
          <h2>Admin Panel</h2>

          <h3>Harga Emas</h3>
          <input value={goldPrice} onChange={e => setGoldPrice(parseInt(e.target.value))}/>
          <button onClick={saveSettings}>Save</button>

          <h3>Tambah Produk</h3>
          <input placeholder="Nama" onChange={e => setNewProduct({...newProduct, name: e.target.value})}/>
          <input placeholder="Berat" onChange={e => setNewProduct({...newProduct, weight: parseFloat(e.target.value)})}/>
          <input type="file" onChange={uploadImage}/>
          <button onClick={addProduct}>Tambah</button>

          <h3>Orders</h3>
          {orders.map(o => (
            <div key={o.id}>
              <p>{o.customer.name} - {formatRp(o.total)}</p>
              <button onClick={() => confirmOrder(o.id)}>Confirm</button>
              <button onClick={() => cancelOrder(o.id)}>Cancel</button>
              <button onClick={() => blockUser(o.customer.phone)}>Block User</button>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}

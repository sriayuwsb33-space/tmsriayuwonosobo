// FINAL PROFESSIONAL VERSION - TOKO MAS SRI AYU WONOSOBO
// UI lebih rapi + 10 produk contoh + admin login

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

// DEFAULT KADAR
const DEFAULT_KADAR = {
  '6K': { sell: 0.34, buy: 0.27 },
  '8K': { sell: 0.445, buy: 0.35 },
  '9K': { sell: 0.49, buy: 0.39 },
};

// SAMPLE PRODUCTS (10)
const SAMPLE_PRODUCTS = [
  { id: 1, name: 'Cincin Elegan Wanita', weight: 2.1, kadar: '8K', imageUrl: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d', isSold:false, isPending:false },
  { id: 2, name: 'Kalung Emas Simple', weight: 5.2, kadar: '8K', imageUrl: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1', isSold:false, isPending:false },
  { id: 3, name: 'Gelang Bayi Lucu', weight: 1.5, kadar: '6K', imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908', isSold:false, isPending:false },
  { id: 4, name: 'Anting Fashion Korea', weight: 1.2, kadar: '8K', imageUrl: 'https://images.unsplash.com/photo-1588444650733-d0b6c3a5f7f4', isSold:false, isPending:false },
  { id: 5, name: 'Cincin Kawin Polos', weight: 4.0, kadar: '9K', imageUrl: 'https://images.unsplash.com/photo-1622398925373-3f91b1e275f5', isSold:false, isPending:false },
  { id: 6, name: 'Kalung Premium Wanita', weight: 6.5, kadar: '9K', imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f', isSold:false, isPending:false },
  { id: 7, name: 'Gelang Rantai Pria', weight: 7.0, kadar: '9K', imageUrl: 'https://images.unsplash.com/photo-1617038260897-41a1f14a6f84', isSold:false, isPending:false },
  { id: 8, name: 'Anting Anak Karakter', weight: 1.3, kadar: '6K', imageUrl: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e', isSold:false, isPending:false },
  { id: 9, name: 'Cincin Berlian Look', weight: 2.8, kadar: '8K', imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e', isSold:false, isPending:false },
  { id: 10, name: 'Kalung Couple', weight: 3.5, kadar: '8K', imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1', isSold:false, isPending:false },
];

export default function App() {
  const [view, setView] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLogin, setAdminLogin] = useState({ user:'', pass:'' });

  const [goldPrice, setGoldPrice] = useState(2550000);
  const [kadar, setKadar] = useState(DEFAULT_KADAR);

  const [products, setProducts] = useState(SAMPLE_PRODUCTS);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState(null);

  const [customer, setCustomer] = useState({ name:'', phone:'' });

  useEffect(() => { signInAnonymously(auth); }, []);

  const prices = useMemo(() => {
    let r = {};
    Object.keys(kadar).forEach(k => {
      r[k] = Math.ceil((goldPrice * kadar[k].sell)/5000)*5000;
    });
    return r;
  }, [goldPrice]);

  const formatRp = n => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',minimumFractionDigits:0}).format(n);

  const addToCart = p => setCart([...cart, p]);

  const checkout = () => {
    const total = cart.reduce((s,i)=>s+(i.weight*prices[i.kadar]),0);
    window.open(`https://wa.me/6282299081829?text=Order%20Total%20${total}`);
  };

  const loginAdmin = () => {
    if(adminLogin.user==='yuhu' && adminLogin.pass==='admin'){
      setIsAdmin(true);
      setView('admin');
    } else alert('Login salah');
  };

  return (
    <div className="font-serif">

      {/* NAV */}
      <div className="flex justify-between p-6 border-b">
        <h1 className="text-xl font-bold">Sri Ayu Gold</h1>
        <div className="flex gap-6">
          <button onClick={()=>setView('home')}>Home</button>
          <button onClick={()=>setView('catalog')}>Catalog</button>
          <button onClick={()=>setView('cart')}>Cart ({cart.length})</button>
          <button onClick={()=>setView('login')}>Admin</button>
        </div>
      </div>

      {/* HERO */}
      {view==='home' && (
        <div className="relative h-[80vh]">
          <img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e" className="absolute w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-black/40"/>
          <div className="relative text-white flex flex-col items-center justify-center h-full">
            <h1 className="text-5xl mb-4">Toko Mas Sri Ayu</h1>
            <button onClick={()=>setView('catalog')} className="border px-6 py-3">Shop Now</button>
          </div>
        </div>
      )}

      {/* CATALOG */}
      {view==='catalog' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6">
          {products.map(p=>(
            <div key={p.id} onClick={()=>{setSelected(p);setView('detail')}} className="cursor-pointer">
              <img src={p.imageUrl} className="h-48 w-full object-cover"/>
              <h3>{p.name}</h3>
              <p>{formatRp(p.weight*prices[p.kadar])}</p>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL */}
      {view==='detail' && selected && (
        <div className="p-6">
          <button onClick={()=>setView('catalog')}>Back</button>
          <img src={selected.imageUrl} className="w-full max-w-md"/>
          <h2 className="text-2xl">{selected.name}</h2>
          <p>{formatRp(selected.weight*prices[selected.kadar])}</p>
          <button onClick={()=>addToCart(selected)} className="border px-4 py-2">Add to Cart</button>
        </div>
      )}

      {/* CART */}
      {view==='cart' && (
        <div className="p-6">
          {cart.map(i=>(<p key={i.id}>{i.name}</p>))}
          <button onClick={checkout} className="bg-black text-white px-6 py-3 mt-4">Checkout WA</button>
        </div>
      )}

      {/* LOGIN ADMIN */}
      {view==='login' && (
        <div className="p-6 max-w-sm mx-auto">
          <input placeholder="User" onChange={e=>setAdminLogin({...adminLogin,user:e.target.value})}/>
          <input placeholder="Pass" type="password" onChange={e=>setAdminLogin({...adminLogin,pass:e.target.value})}/>
          <button onClick={loginAdmin} className="bg-black text-white w-full mt-3 py-2">Login</button>
        </div>
      )}

      {/* ADMIN */}
      {view==='admin' && isAdmin && (
        <div className="p-6">
          <h2>Admin Panel</h2>
          <p>Harga Emas: {formatRp(goldPrice)}</p>
          <input value={goldPrice} onChange={e=>setGoldPrice(parseInt(e.target.value))}/>
        </div>
      )}

    </div>
  );
}

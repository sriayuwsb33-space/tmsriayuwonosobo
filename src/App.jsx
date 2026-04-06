// PREMIUM CLEAN UI FIX - TOKO MAS SRI AYU
// Fokus: Elegant Minimalis + Fix warna admin

import React, { useState, useMemo, useEffect } from 'react';

export default function App() {
  const [view, setView] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [login, setLogin] = useState({ user:'', pass:'' });

  const [goldPrice, setGoldPrice] = useState(2550000);

  const products = [
    {id:1,name:'Cincin Elegan Wanita',img:'https://images.unsplash.com/photo-1611652022419-a9419f74343d',w:2.1,k:'8K'},
    {id:2,name:'Kalung Emas Simple',img:'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1',w:5.2,k:'8K'},
    {id:3,name:'Gelang Bayi Lucu',img:'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908',w:1.5,k:'6K'},
  ];

  const harga = useMemo(()=>({
    '6K': Math.ceil(goldPrice*0.34/5000)*5000,
    '8K': Math.ceil(goldPrice*0.445/5000)*5000,
    '9K': Math.ceil(goldPrice*0.49/5000)*5000
  }),[goldPrice]);

  const format = n=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',minimumFractionDigits:0}).format(n);

  const loginAdmin=()=>{
    if(login.user==='yuhu' && login.pass==='admin'){
      setIsAdmin(true);
      setView('admin');
    } else alert('Login salah');
  }

  return (
    <div className="bg-[#fafafa] text-gray-800 min-h-screen font-sans">

      {/* NAV */}
      <div className="flex justify-between px-8 py-5 bg-white border-b">
        <h1 className="text-lg font-semibold tracking-wide">Sri Ayu Gold</h1>
        <div className="flex gap-6 text-sm">
          <button onClick={()=>setView('home')}>Home</button>
          <button onClick={()=>setView('catalog')}>Catalog</button>
          <button onClick={()=>setView('login')}>Admin</button>
        </div>
      </div>

      {/* HOME */}
      {view==='home' && (
        <div className="flex items-center justify-center h-[70vh]">
          <h1 className="text-3xl font-light">Toko Mas Sri Ayu</h1>
        </div>
      )}

      {/* CATALOG */}
      {view==='catalog' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-8 max-w-6xl mx-auto">
          {products.map(p=>(
            <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm text-center">
              <img src={p.img} className="w-full h-48 object-cover rounded-lg"/>
              <h3 className="mt-3 font-medium">{p.name}</h3>
              <p className="text-gray-500 text-sm">{format(p.w*harga[p.k])}</p>
            </div>
          ))}
        </div>
      )}

      {/* LOGIN */}
      {view==='login' && (
        <div className="flex items-center justify-center h-[70vh]">
          <div className="bg-white p-8 rounded-xl shadow w-80">
            <h2 className="text-center mb-4 font-medium text-gray-800">Admin Login</h2>
            <input className="w-full border p-2 mb-3" placeholder="Username" onChange={e=>setLogin({...login,user:e.target.value})}/>
            <input type="password" className="w-full border p-2 mb-3" placeholder="Password" onChange={e=>setLogin({...login,pass:e.target.value})}/>
            <button onClick={loginAdmin} className="w-full bg-black text-white py-2 rounded">Login</button>
          </div>
        </div>
      )}

      {/* ADMIN */}
      {view==='admin' && isAdmin && (
        <div className="p-8 max-w-4xl mx-auto space-y-6">

          <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>

          {/* CARD */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="mb-2 font-medium text-gray-700">Harga Emas</h3>
            <input 
              type="number" 
              value={goldPrice} 
              onChange={e=>setGoldPrice(parseInt(e.target.value))} 
              className="border p-2 w-full text-gray-800"/>
          </div>

        </div>
      )}

    </div>
  );
}

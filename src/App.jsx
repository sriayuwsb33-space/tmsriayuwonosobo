// PREMIUM UPGRADE V2 - TOKO MAS SRI AYU WONOSOBO
// UI Luxury + Admin Lengkap + CRUD Produk + Order + User Control

import React, { useState, useMemo, useEffect } from 'react';

export default function App() {
  const [view, setView] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [login, setLogin] = useState({ user:'', pass:'' });

  const [goldPrice, setGoldPrice] = useState(2550000);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  const [newProduct, setNewProduct] = useState({ name:'', weight:'', img:'', kadar:'8K' });

  const defaultProducts = [
    {id:1,name:'Cincin Elegan Wanita',img:'https://images.unsplash.com/photo-1611652022419-a9419f74343d',w:2.1,k:'8K'},
    {id:2,name:'Kalung Emas Simple',img:'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1',w:5.2,k:'8K'},
    {id:3,name:'Gelang Bayi Lucu',img:'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908',w:1.5,k:'6K'},
    {id:4,name:'Anting Fashion Korea',img:'https://images.unsplash.com/photo-1588444650733-d0b6c3a5f7f4',w:1.2,k:'8K'},
  ];

  useEffect(()=>{ setProducts(defaultProducts); },[]);

  const harga = useMemo(()=>({
    '6K': Math.ceil(goldPrice*0.34/5000)*5000,
    '8K': Math.ceil(goldPrice*0.445/5000)*5000,
    '9K': Math.ceil(goldPrice*0.49/5000)*5000
  }),[goldPrice]);

  const format = n=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',minimumFractionDigits:0}).format(n);

  const slides = [
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f'
  ];

  const [slide,setSlide]=useState(0);
  useEffect(()=>{
    const t=setInterval(()=>setSlide(s=>(s+1)%slides.length),4000);
    return ()=>clearInterval(t);
  },[]);

  const loginAdmin=()=>{
    if(login.user==='yuhu' && login.pass==='admin'){
      setIsAdmin(true);
      setView('admin');
    } else alert('Login salah');
  }

  const addProduct=()=>{
    setProducts([...products,{...newProduct,id:Date.now(),w:parseFloat(newProduct.weight),k:newProduct.kadar}]);
  }

  const deleteProduct=(id)=>{
    setProducts(products.filter(p=>p.id!==id));
  }

  const confirmOrder=(id)=>{
    setOrders(orders.map(o=>o.id===id?{...o,status:'Selesai'}:o));
  }

  const cancelOrder=(id)=>{
    setOrders(orders.map(o=>o.id===id?{...o,status:'Batal'}:o));
  }

  const blockUser=(phone)=>{
    setUsers(users.map(u=>u.phone===phone?{...u,blocked:true}:u));
  }

  return (
    <div className="bg-white text-black min-h-screen font-serif">

      {/* NAV */}
      <div className="flex justify-between px-8 py-5 border-b">
        <h1 className="text-xl font-semibold tracking-wide">Sri Ayu Gold</h1>
        <div className="flex gap-8 text-sm">
          <button onClick={()=>setView('home')}>Home</button>
          <button onClick={()=>setView('catalog')}>Catalog</button>
          <button onClick={()=>setView('login')}>Admin</button>
        </div>
      </div>

      {/* HERO */}
      {view==='home' && (
        <div className="relative h-[80vh]">
          <img src={slides[slide]} className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-black/40"/>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <h1 className="text-5xl font-light mb-4">Sri Ayu Jewelry</h1>
            <p className="mb-6 tracking-wide">Elegance • Luxury • Trusted Gold</p>
            <button onClick={()=>setView('catalog')} className="border px-6 py-3 hover:bg-white hover:text-black transition">Explore Collection</button>
          </div>
        </div>
      )}

      {/* CATALOG */}
      {view==='catalog' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 p-8 max-w-6xl mx-auto">
          {products.map(p=>(
            <div key={p.id} className="text-center group">
              <img src={p.img} className="w-full h-60 object-cover rounded-xl group-hover:scale-105 transition duration-300"/>
              <h3 className="mt-3 font-medium">{p.name}</h3>
              <p className="text-gray-500">{format(p.w*harga[p.k])}</p>
            </div>
          ))}
        </div>
      )}

      {/* LOGIN */}
      {view==='login' && (
        <div className="flex items-center justify-center h-[70vh]">
          <div className="bg-white border p-10 rounded-2xl shadow-lg w-80">
            <h2 className="text-center mb-6 text-lg font-light">Admin Login</h2>
            <input className="w-full border-b p-2 mb-4 outline-none" placeholder="Username" onChange={e=>setLogin({...login,user:e.target.value})}/>
            <input type="password" className="w-full border-b p-2 mb-6 outline-none" placeholder="Password" onChange={e=>setLogin({...login,pass:e.target.value})}/>
            <button onClick={loginAdmin} className="w-full bg-black text-white py-2">Login</button>
          </div>
        </div>
      )}

      {/* ADMIN PANEL */}
      {view==='admin' && isAdmin && (
        <div className="p-8 max-w-6xl mx-auto space-y-8">

          <h2 className="text-2xl font-semibold">Admin Dashboard</h2>

          {/* GOLD PRICE */}
          <div className="border p-6 rounded-xl">
            <h3 className="mb-2">Harga Emas</h3>
            <input type="number" value={goldPrice} onChange={e=>setGoldPrice(parseInt(e.target.value))} className="border p-2 w-full"/>
          </div>

          {/* ADD PRODUCT */}
          <div className="border p-6 rounded-xl">
            <h3 className="mb-3">Tambah Produk</h3>
            <input placeholder="Nama" className="border p-2 w-full mb-2" onChange={e=>setNewProduct({...newProduct,name:e.target.value})}/>
            <input placeholder="Berat" className="border p-2 w-full mb-2" onChange={e=>setNewProduct({...newProduct,weight:e.target.value})}/>
            <input placeholder="URL Gambar" className="border p-2 w-full mb-2" onChange={e=>setNewProduct({...newProduct,img:e.target.value})}/>
            <button onClick={addProduct} className="bg-black text-white px-4 py-2">Tambah</button>
          </div>

          {/* PRODUCT LIST */}
          <div className="border p-6 rounded-xl">
            <h3 className="mb-3">Daftar Produk</h3>
            {products.map(p=>(
              <div key={p.id} className="flex justify-between border-b py-2">
                <span>{p.name}</span>
                <button onClick={()=>deleteProduct(p.id)} className="text-red-500">Hapus</button>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}

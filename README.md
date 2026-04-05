import React, { useState, useMemo, useEffect } from 'react';
import {
ShoppingCart, Gem, ChevronRight, ArrowLeft, Plus,
Trash2, Search, User, Phone, Save, Calculator, Shield,
TrendingUp, RefreshCw, Home, Send, LogOut, Receipt,
LogIn, Users, Package, Star
} from 'lucide-react';

// === 1. KONFIGURASI DATABASE FIREBASE ===
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
apiKey: "AIzaSyCMhxO5hlxUBpZDuPa4PQkJ4EkIFfzxqf8",
authDomain: "toko-mas-sri-ayu.firebaseapp.com",
projectId: "toko-mas-sri-ayu",
storageBucket: "toko-mas-sri-ayu.firebasestorage.app",
messagingSenderId: "195511507670",
appId: "1:195511507670:web:7c373950b65995d8f00777",
measurementId: "G-1BJ26ZSB0F"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Formula Kadar Emas
const KADAR_DATA = {
'6K': 0.36, '8K': 0.46, '9K': 0.53, '16K': 0.70, '17K': 0.75, '24K': 1.00
};

const INITIAL_PRODUCTS = [
{ id: 1, code: 'SA-1024', name: 'Cincin Bunga Cantik', weight: 3.5, kadar: '8K', description: 'Desain elegan harian.', imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f66122245?auto=format&fit=crop&w=800&q=80', isSold: false },
{ id: 2, code: 'SA-4421', name: 'Kalung Rantai Polos', weight: 10.0, kadar: '24K', description: 'Emas murni investasi.', imageUrl: 'https://images.unsplash.com/photo-1599643478524-fb66f7200424?auto=format&fit=crop&w=800&q=80', isSold: false },
];

export default function App() {
// Navigation & Auth State
const [view, setView] = useState('home');
const [isAdmin, setIsAdmin] = useState(false);
const [isOnline, setIsOnline] = useState(false);
const [fbUser, setFbUser] = useState(null);
const [loggedInCustomer, setLoggedInCustomer] = useState(null);

// Cloud Data State
const [products, setProducts] = useState(INITIAL_PRODUCTS);
const [orders, setOrders] = useState([]);
const [usersDB, setUsersDB] = useState([]);
const [settings, setSettings] = useState({ goldPrice: 2550000, margin: 15, buyback: 8 });

// Local State
const [cart, setCart] = useState([]);
const [searchQuery, setSearchQuery] = useState('');
const [authForm, setAuthForm] = useState({ name: '', phone: '', address: '', password: '' });
const [adminKey, setAdminKey] = useState({ u: '', p: '' });
const [newProduct, setNewProduct] = useState({ name: '', weight: '', kadar: '8K', description: '', imageUrl: '' });

// --- 🔥 SINKRONISASI REAL-TIME 🔥 ---
useEffect(() => {
// 1. Hubungkan ke Auth Anonim (Agar Izin Tembus)
signInAnonymously(auth).catch(() => console.log("Gunakan mode publik"));

    // 2. Pantau Perubahan Data
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFbUser(user);
      setIsOnline(true);

      // Dengarkan Etalase
      onSnapshot(doc(db, "sri_ayu_v2", "products"), (s) => s.exists() && setProducts(s.data().data || INITIAL_PRODUCTS));
      // Dengarkan Pesanan
      onSnapshot(doc(db, "sri_ayu_v2", "orders"), (s) => s.exists() && setOrders(s.data().data || []));
      // Dengarkan Pelanggan
      onSnapshot(doc(db, "sri_ayu_v2", "users"), (s) => s.exists() && setUsersDB(s.data().data || []));
      // Dengarkan Harga
      onSnapshot(doc(db, "sri_ayu_v2", "settings"), (s) => s.exists() && setSettings(s.data().data || settings));
    });

    return () => unsubscribeAuth();

}, []);

// --- FUNGSI UPDATE CLOUD ---
const saveCloud = async (key, content) => {
try {
await setDoc(doc(db, "sri_ayu_v2", key), { data: content });
} catch (e) {
console.error("Gagal simpan:", e);
alert("Koneksi Firebase terputus atau Rules belum di-Publish!");
}
};

// --- HITUNG HARGA ---
const priceList = useMemo(() => {
let list = {};
Object.keys(KADAR_DATA).forEach(k => {
const base = settings.goldPrice _ KADAR_DATA[k];
const sell = Math.ceil((base _ (1 + settings.margin / 100)) / 5000) _ 5000;
const buy = Math.floor((sell _ (1 - settings.buyback / 100)) / 5000) \* 5000;
list[k] = { sell, buy };
});
return list;
}, [settings]);

const formatRp = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

// --- HANDLER ADMIN ---
const addProduct = async (e) => {
e.preventDefault();
const updated = [{ ...newProduct, id: Date.now(), code: 'SA-'+Math.floor(1000+Math.random()*9000), weight: parseFloat(newProduct.weight), isSold: false }, ...products];
setProducts(updated);
await saveCloud("products", updated);
setNewProduct({ name: '', weight: '', kadar: '8K', description: '', imageUrl: '' });
alert("Produk berhasil masuk etalase!");
};

const markSold = async (id) => {
const updated = products.map(p => p.id === id ? { ...p, isSold: !p.isSold } : p);
setProducts(updated);
await saveCloud("products", updated);
};

const deleteProduct = async (id) => {
if(confirm("Hapus barang ini?")) {
const updated = products.filter(p => p.id !== id);
setProducts(updated);
await saveCloud("products", updated);
}
};

// --- HANDLER CUSTOMER ---
const register = async (e) => {
e.preventDefault();
if(usersDB.find(u => u.phone === authForm.phone)) return alert("Nomor sudah terdaftar!");
const updated = [...usersDB, { ...authForm, isBlocked: false }];
setUsersDB(updated);
await saveCloud("users", updated);
setLoggedInCustomer(authForm);
setView('home');
};

const login = (e) => {
e.preventDefault();
const find = usersDB.find(u => u.phone === authForm.phone && u.password === authForm.password);
if(find) { setLoggedInCustomer(find); setView('home'); }
else { alert("WA atau Password salah"); }
};

const checkout = async () => {
if(!loggedInCustomer) return setView('login');
const inv = 'INV-' + Date.now().toString().slice(-6);
const total = cart.reduce((s,i) => s + (i.weight \* priceList[i.kadar].sell), 0);
const newOrder = { id: inv, customer: loggedInCustomer, items: cart, total, date: new Date().toLocaleString(), status: 'Menunggu' };

    const updatedOrders = [newOrder, ...orders];
    const updatedProducts = products.map(p => cart.find(c => c.id === p.id) ? { ...p, isSold: true } : p);

    setOrders(updatedOrders);
    setProducts(updatedProducts);
    await saveCloud("orders", updatedOrders);
    await saveCloud("products", updatedProducts);

    setCart([]);
    alert("Pesanan Berhasil! Menghubungkan ke WhatsApp Admin...");
    window.open(`https://wa.me/6282299081829?text=Halo Sri Ayu, saya ${loggedInCustomer.name} konfirmasi pesanan ${inv}`, '_blank');

};

// --- TAMPILAN ADMIN ---
if(isAdmin && view === 'admin') {
return (
<div className="min-h-screen bg-stone-100 font-sans pb-20">
<header className="bg-stone-900 text-white p-5 flex justify-between items-center sticky top-0 z-50">
<div className="flex items-center gap-2 font-bold"><Shield className="text-amber-500"/> Admin Sri Ayu {isOnline ? "🟢" : "🔴"}</div>
<button onClick={() => setView('home')} className="bg-stone-700 px-4 py-1.5 rounded-lg text-xs">Keluar</button>
</header>

        <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
           {/* Sidebar Admin: Harga */}
           <section className="bg-white p-6 rounded-[30px] shadow-sm h-fit">
              <h3 className="font-bold mb-5 flex items-center gap-2"><Calculator size={18} className="text-amber-600"/> Kontrol Harga</h3>
              <div className="space-y-4">
                 <div><label className="text-[10px] font-bold text-stone-400 uppercase">Harga Emas Dunia</label>
                 <input type="number" value={settings.goldPrice} onChange={e => setSettings({...settings, goldPrice: parseInt(e.target.value)})} className="w-full p-3 bg-stone-50 border rounded-xl font-bold text-amber-600 outline-none focus:ring-2 focus:ring-amber-200"/></div>
                 <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-[10px] font-bold text-stone-400 uppercase">Margin %</label>
                    <input type="number" value={settings.margin} onChange={e => setSettings({...settings, margin: parseInt(e.target.value)})} className="w-full p-3 bg-stone-50 border rounded-xl outline-none"/></div>
                    <div><label className="text-[10px] font-bold text-stone-400 uppercase">Buyback %</label>
                    <input type="number" value={settings.buyback} onChange={e => setSettings({...settings, buyback: parseInt(e.target.value)})} className="w-full p-3 bg-stone-50 border rounded-xl outline-none"/></div>
                 </div>
                 <button onClick={() => saveCloud("settings", settings)} className="w-full bg-stone-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"><Save size={18}/> Update Cloud</button>
              </div>
           </section>

           {/* Main Admin: Stok & Pesanan */}
           <div className="lg:col-span-2 space-y-6">
              <section className="bg-white p-6 rounded-[30px] shadow-sm">
                 <h3 className="font-bold mb-5 flex items-center gap-2"><Plus size={18} className="text-green-600"/> Tambah Stok</h3>
                 <form onSubmit={addProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input required placeholder="Nama Perhiasan" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="p-3 bg-stone-50 border rounded-xl"/>
                    <div className="flex gap-2">
                       <input required type="number" step="0.01" placeholder="Gram" value={newProduct.weight} onChange={e => setNewProduct({...newProduct, weight: e.target.value})} className="flex-grow p-3 bg-stone-50 border rounded-xl"/>
                       <select value={newProduct.kadar} onChange={e => setNewProduct({...newProduct, kadar: e.target.value})} className="p-3 bg-stone-50 border rounded-xl font-bold">
                          {Object.keys(KADAR_DATA).map(k => <option key={k} value={k}>{k}</option>)}
                       </select>
                    </div>
                    <input placeholder="Link Gambar (Kosongkan jika tidak ada)" value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} className="p-3 bg-stone-50 border rounded-xl md:col-span-2"/>
                    <button type="submit" className="w-full bg-amber-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-amber-200 active:scale-95 transition-all md:col-span-2">Simpan ke Etalase</button>
                 </form>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <section className="bg-white p-6 rounded-[30px] shadow-sm">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Users size={18} className="text-blue-500"/> Pelanggan ({usersDB.length})</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                       {usersDB.map((u, i) => (
                          <div key={i} className="p-4 bg-stone-50 rounded-2xl border flex justify-between items-center">
                             <div><p className="font-bold text-sm">{u.name}</p><p className="text-[10px] text-stone-400 font-mono">{u.phone}</p></div>
                             <a href={`https://wa.me/${u.phone}`} target="_blank" className="bg-green-100 text-green-600 p-2 rounded-full"><Send size={14}/></a>
                          </div>
                       ))}
                    </div>
                 </section>
                 <section className="bg-white p-6 rounded-[30px] shadow-sm">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Package size={18} className="text-purple-500"/> Pesanan Baru</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                       {orders.length === 0 ? <p className="text-center text-stone-400 py-10 italic text-sm">Kosong</p> : orders.map((o, i) => (
                          <div key={i} className="p-4 bg-amber-50 rounded-2xl border border-amber-100 relative">
                             <div className="flex justify-between font-bold text-xs"><span>{o.customer.name}</span><span className="text-amber-700">{formatRp(o.total)}</span></div>
                             <p className="text-[9px] text-stone-400 mt-1">{o.date}</p>
                             <p className="text-[10px] mt-2 text-stone-600 truncate">{o.items.map(it => it.name).join(', ')}</p>
                          </div>
                       ))}
                    </div>
                 </section>
              </div>

              {/* Etalase Manager */}
              <section className="bg-white p-6 rounded-[30px] shadow-sm">
                 <h3 className="font-bold mb-4">Kelola Etalase ({products.length})</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {products.map(p => (
                       <div key={p.id} className={`p-3 border rounded-2xl flex gap-3 items-center ${p.isSold ? 'bg-red-50' : 'bg-stone-50'}`}>
                          <img src={p.imageUrl || "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=200&q=80"} className="w-12 h-12 rounded-lg object-cover grayscale={p.isSold}"/>
                          <div className="flex-grow">
                             <p className="font-bold text-xs truncate w-32">{p.name}</p>
                             <p className="text-[10px] text-stone-400">{p.kadar} • {p.weight}g</p>
                          </div>
                          <div className="flex gap-1">
                             <button onClick={() => markSold(p.id)} className={`p-2 rounded-lg ${p.isSold ? 'text-green-600 bg-white' : 'text-stone-400 bg-white'}`} title="Tandai Terjual"><RefreshCw size={14}/></button>
                             <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-500 bg-white rounded-lg"><Trash2 size={14}/></button>
                          </div>
                       </div>
                    ))}
                 </div>
              </section>
           </div>
        </div>
      </div>
    );

}

// --- TAMPILAN CUSTOMER ---
return (
<div className="min-h-screen bg-stone-50 pb-32 font-sans overflow-x-hidden">
{/_ Header Premium _/}
<nav className="bg-white/80 backdrop-blur-xl border-b p-4 flex justify-between items-center sticky top-0 z-[100]">
<div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
<div className="bg-stone-900 w-10 h-10 rounded-xl flex items-center justify-center text-amber-400 font-serif font-bold text-xl shadow-lg shadow-stone-200">S</div>
<span className="font-serif font-bold text-xl tracking-tighter text-stone-900">Sri Ayu</span>
</div>
<div className="flex items-center gap-2">
{isOnline && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2 shadow-[0_0_10px_green]"></div>}
<button onClick={() => setView(loggedInCustomer ? 'profile' : 'login')} className="bg-stone-900 text-white px-5 py-2.5 rounded-2xl text-[11px] font-bold shadow-xl active:scale-95 transition-all">
{loggedInCustomer ? loggedInCustomer.name.split(' ')[0] : 'LOGIN'}
</button>
</div>
</nav>

      <main className="max-w-xl mx-auto p-4">
        {/* VIEW: HOME */}
        {view === 'home' && (
          <div className="animate-in fade-in duration-1000">
            <div className="relative rounded-[45px] overflow-hidden mb-12 shadow-2xl h-[450px] group border-4 border-white">
               <img src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1200&q=80" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[4000ms]" />
               <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent flex flex-col justify-end p-10 text-white">
                  <div className="flex items-center gap-2 mb-4 bg-amber-500/20 backdrop-blur-md w-fit px-3 py-1 rounded-full border border-amber-500/30">
                     <Star size={12} className="fill-amber-400 text-amber-400"/>
                     <span className="text-amber-400 font-bold text-[9px] tracking-widest uppercase">Pilihan Terbaik 2026</span>
                  </div>
                  <h2 className="text-5xl font-serif font-bold mb-3 leading-[0.95] tracking-tight">Emas Murni<br/>Investasi Abadi.</h2>
                  <p className="text-stone-300 text-sm mb-10 max-w-[280px] leading-relaxed">Koleksi perhiasan eksklusif Toko Mas Sri Ayu untuk keindahan dan masa depan Bapak.</p>
                  <button onClick={() => setView('catalog')} className="bg-amber-500 text-stone-950 py-5 rounded-[22px] font-bold shadow-2xl shadow-amber-500/30 flex items-center justify-center gap-4 active:scale-95 transition-all text-lg">Mulai Jelajahi <ChevronRight size={22}/></button>
               </div>
            </div>

            <div className="flex justify-between items-end mb-8 px-2">
               <div><h3 className="font-bold text-2xl text-stone-900 tracking-tight">Baru di Etalase</h3><p className="text-xs text-stone-400">Koleksi terpopuler minggu ini</p></div>
               <button onClick={() => setView('catalog')} className="text-amber-600 text-xs font-bold border-b border-amber-600/30 pb-1">Lihat Semua</button>
            </div>

            <div className="grid grid-cols-2 gap-5">
               {products.filter(p => !p.isSold).slice(0, 4).map(p => (
                 <div key={p.id} className="bg-white p-3 rounded-[35px] border border-stone-100 shadow-sm hover:shadow-xl transition-shadow group" onClick={() => setView('catalog')}>
                    <div className="relative mb-4 overflow-hidden rounded-[28px]">
                       <img src={p.imageUrl || "https://images.unsplash.com/photo-1605100804763-247f66122245?auto=format&fit=crop&w=800&q=80"} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"/>
                       <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-2xl text-[9px] font-bold text-stone-800 shadow-xl border border-stone-100">{p.kadar}</span>
                    </div>
                    <div className="font-bold text-sm text-stone-900 truncate px-2">{p.name}</div>
                    <div className="text-amber-600 font-bold text-xs px-2 mt-1 mb-2">{formatRp(p.weight * priceList[p.kadar].sell)}</div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* VIEW: CATALOG */}
        {view === 'catalog' && (
          <div className="animate-in fade-in duration-500 space-y-8 pb-10">
            <div className="relative">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400" size={20}/>
               <input placeholder="Cari perhiasan Bapak..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full p-6 pl-14 bg-white rounded-[30px] border-none shadow-xl shadow-stone-100 outline-none font-medium placeholder:text-stone-300"/>
            </div>

            {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
              <div key={p.id} className={`bg-white rounded-[45px] overflow-hidden shadow-2xl shadow-stone-200 border border-stone-50 flex flex-col relative group ${p.isSold ? 'grayscale opacity-60' : ''}`}>
                {p.isSold && <div className="absolute top-8 left-8 z-20 bg-red-600 text-white font-bold text-[11px] px-5 py-2 rounded-full shadow-2xl -rotate-12 border-2 border-white">HABIS TERJUAL</div>}
                <div className="h-80 w-full overflow-hidden relative">
                   <img src={p.imageUrl || "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                   <div className="absolute top-6 right-6 flex flex-col gap-2">
                      <span className="bg-amber-500 text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-lg text-center uppercase tracking-widest">{p.kadar}</span>
                      <span className="bg-stone-900/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-lg text-center">{p.weight} G</span>
                   </div>
                </div>
                <div className="p-10">
                   <h3 className="font-bold text-3xl text-stone-900 mb-2 leading-tight">{p.name}</h3>
                   <p className="text-stone-400 text-sm mb-8 leading-relaxed font-medium">{p.description || "Perhiasan emas eksklusif Sri Ayu dengan kilau abadi untuk menunjang gaya dan investasi Anda."}</p>
                   <div className="flex justify-between items-center bg-stone-50 p-6 rounded-[35px] border border-stone-100">
                      <div><p className="text-[10px] text-stone-400 font-bold uppercase mb-1 tracking-widest">Harga Hari Ini</p><p className="text-3xl font-bold text-stone-950 tracking-tighter">{formatRp(p.weight * priceList[p.kadar].sell)}</p></div>
                      <button
                        onClick={() => {
                          if(!loggedInCustomer) return setView('login');
                          if(p.isSold) return alert("Barang sudah laku terjual!");
                          if(cart.find(c => c.id === p.id)) return setView('cart');
                          setCart([...cart, p]);
                          alert("Berhasil masuk keranjang!");
                        }}
                        disabled={p.isSold}
                        className={`px-10 py-4 rounded-[22px] font-bold text-sm shadow-2xl transition-all active:scale-95 ${p.isSold ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none' : 'bg-stone-900 text-white hover:bg-black'}`}
                      >
                        {p.isSold ? 'LAKU' : 'BELI'}
                      </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW: LOGIN */}
        {view === 'login' && (
          <div className="max-w-sm mx-auto bg-white p-12 rounded-[55px] shadow-2xl border border-stone-50 mt-10 text-center animate-in zoom-in duration-500">
             <div className="bg-amber-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border-[6px] border-white"><LogIn className="text-amber-600" size={40}/></div>
             <h2 className="text-4xl font-serif font-bold mb-3 text-stone-950 leading-tight">Halo, Pak!</h2>
             <p className="text-stone-400 text-sm mb-12 leading-relaxed">Silakan masuk untuk melihat riwayat emas dan koleksi terbaru Bapak.</p>
             <form onSubmit={login} className="space-y-4">
                <input required value={authForm.phone} onChange={e => setAuthForm({...authForm, phone: e.target.value})} type="tel" placeholder="WhatsApp Bapak" className="w-full p-6 bg-stone-50 border-none rounded-3xl text-center font-bold text-stone-800 outline-none focus:ring-2 focus:ring-amber-200 transition-all" />
                <input required value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} type="password" placeholder="Password" className="w-full p-6 bg-stone-50 border-none rounded-3xl text-center outline-none focus:ring-2 focus:ring-amber-200 transition-all" />
                <button type="submit" className="w-full bg-stone-950 text-white py-6 rounded-[28px] font-bold shadow-2xl shadow-stone-300 active:scale-95 transition-all text-lg">MASUK SEKARANG</button>
             </form>
             <div className="mt-12 pt-8 border-t border-stone-50">
               <p className="text-sm text-stone-400 font-medium">Belum jadi member? <button onClick={() => setView('signup')} className="text-amber-600 font-bold underline ml-1 hover:text-amber-700">Daftar Akun</button></p>
             </div>
          </div>
        )}

        {/* VIEW: SIGNUP */}
        {view === 'signup' && (
          <div className="max-w-sm mx-auto bg-white p-12 rounded-[55px] shadow-2xl border border-stone-50 mt-10 animate-in slide-in-from-bottom duration-500">
             <h2 className="text-4xl font-serif font-bold mb-3 text-center text-stone-950">Daftar Member</h2>
             <p className="text-center text-xs text-stone-400 mb-10 leading-relaxed font-medium">Lengkapi data untuk memudahkan pengiriman pesanan perhiasan Bapak.</p>
             <form onSubmit={register} className="space-y-4">
               <input required value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} placeholder="Nama Lengkap Sesuai KTP" className="w-full p-6 bg-stone-50 border-none rounded-3xl text-stone-900 font-medium outline-none focus:ring-2 focus:ring-amber-200" />
               <input required value={authForm.phone} onChange={e => setAuthForm({...authForm, phone: e.target.value})} placeholder="WhatsApp Bapak" className="w-full p-6 bg-stone-50 border-none rounded-3xl outline-none focus:ring-2 focus:ring-amber-200" />
               <textarea required value={authForm.address} onChange={e => setAuthForm({...authForm, address: e.target.value})} placeholder="Alamat Pengiriman Lengkap" className="w-full p-6 bg-stone-50 border-none rounded-3xl h-32 resize-none outline-none focus:ring-2 focus:ring-amber-200" />
               <input required value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} type="password" placeholder="Buat Password Keamanan" className="w-full p-6 bg-stone-50 border-none rounded-3xl outline-none focus:ring-2 focus:ring-amber-200" />
               <button type="submit" className="w-full bg-amber-500 text-stone-950 py-6 rounded-[28px] font-bold shadow-2xl shadow-amber-500/20 active:scale-95 transition-all mt-6 text-lg uppercase tracking-wider">BUAT AKUN MEMBER</button>
             </form>
             <button onClick={() => setView('login')} className="w-full text-center mt-10 text-[10px] text-stone-400 font-black uppercase tracking-[0.3em] hover:text-stone-600 transition-colors">Sudah Ada Akun? MASUK</button>
          </div>
        )}

        {/* VIEW: CART */}
        {view === 'cart' && (
          <div className="animate-in slide-in-from-right duration-500">
             <div className="flex items-center gap-4 mb-10">
               <button onClick={() => setView('catalog')} className="p-3 bg-white rounded-full border shadow-xl active:scale-90 transition-all"><ArrowLeft size={22} className="text-stone-900"/></button>
               <h2 className="text-4xl font-serif font-bold text-stone-900">Keranjang</h2>
             </div>
             {cart.length === 0 ? (
               <div className="text-center py-32 bg-white rounded-[50px] border-2 border-dashed border-stone-100 shadow-inner">
                 <ShoppingCart size={80} className="mx-auto text-stone-100 mb-8"/>
                 <p className="text-stone-300 font-bold text-xl mb-8">Keranjang Bapak kosong</p>
                 <button onClick={() => setView('catalog')} className="bg-stone-900 text-white px-10 py-4 rounded-full font-bold text-sm shadow-xl active:scale-95 transition-all">MULAI BELANJA</button>
               </div>
             ) : (
               <div className="space-y-6">
                 {cart.map(item => (
                   <div key={item.id} className="bg-white p-6 rounded-[40px] flex items-center gap-6 border border-stone-50 shadow-xl shadow-stone-100 relative group transition-all hover:translate-x-2">
                      <div className="w-28 h-28 rounded-[25px] overflow-hidden shrink-0 shadow-lg">
                        <img src={item.imageUrl || "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow">
                         <h4 className="font-bold text-stone-900 text-xl mb-1">{item.name}</h4>
                         <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mb-3">{item.weight}G • {item.kadar}</p>
                         <div className="text-amber-600 font-black text-lg">{formatRp(item.weight * priceList[item.kadar].sell)}</div>
                      </div>
                      <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} className="p-4 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-all duration-300 active:scale-90"><Trash2 size={24}/></button>
                   </div>
                 ))}
                 <div className="mt-16 bg-stone-950 text-white p-12 rounded-[60px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-10 -mt-10 blur-3xl"></div>
                    <div className="flex justify-between mb-3 opacity-50 text-sm font-medium tracking-wide"><span>SUBTOTAL</span><span>{formatRp(cart.reduce((s,i)=>s+(i.weight*priceList[i.kadar].sell),0))}</span></div>
                    <div className="flex justify-between mb-10 border-t border-white/10 pt-6"><span className="text-2xl font-bold font-serif tracking-tight">TOTAL TAGIHAN</span><span className="text-2xl font-black text-amber-400">{formatRp(cart.reduce((s,i)=>s+(i.weight*priceList[i.kadar].sell),0))}</span></div>
                    <button onClick={checkout} className="w-full bg-amber-500 text-stone-950 py-6 rounded-[30px] font-black flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-all text-lg uppercase tracking-tighter">KONFIRMASI PESANAN <Send size={22}/></button>
                    <p className="text-center text-[9px] text-stone-500 font-bold mt-6 tracking-widest">TRANSAKSI AMAN & TERPERCAYA DI SRI AYU</p>
                 </div>
               </div>
             )}
          </div>
        )}

        {/* VIEW: PROFILE & ORDER HISTORY */}
        {view === 'profile' && loggedInCustomer && (
          <div className="animate-in fade-in duration-500 space-y-10 pb-10">
             <div className="bg-white p-10 rounded-[55px] border shadow-2xl shadow-stone-100 text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-amber-500"></div>
                <div className="bg-amber-50 w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border-[8px] border-stone-50"><User className="text-amber-600" size={56}/></div>
                <h2 className="text-4xl font-serif font-bold text-stone-950 mb-2 leading-none">{loggedInCustomer.name}</h2>
                <p className="text-stone-400 text-sm mb-10 font-bold tracking-widest uppercase">{loggedInCustomer.phone}</p>
                <div className="bg-stone-50 p-8 rounded-[35px] text-left border border-stone-100 mb-10"><p className="text-[9px] font-black text-stone-300 mb-3 tracking-[0.2em] uppercase">Alamat Default Pengiriman</p><p className="text-sm text-stone-700 leading-relaxed font-semibold">{loggedInCustomer.address}</p></div>
                <button onClick={() => setLoggedInCustomer(null)} className="flex items-center justify-center gap-3 mx-auto text-red-500 font-black text-xs uppercase tracking-widest hover:text-red-700 transition-colors"><LogOut size={18}/> KELUAR AKUN</button>
             </div>

             <div className="flex items-center justify-between px-4">
                <h3 className="font-bold text-2xl text-stone-950 tracking-tight flex items-center gap-3"><Receipt className="text-amber-500" size={24}/> Riwayat Belanja</h3>
                <span className="bg-stone-900 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">{orders.filter(o => o.customer.phone === loggedInCustomer.phone).length} Transaksi</span>
             </div>

             <div className="space-y-6">
                {orders.filter(o => o.customer.phone === loggedInCustomer.phone).length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-[45px] border-2 border-dashed border-stone-100">
                    <Receipt size={50} className="mx-auto text-stone-50 mb-6"/>
                    <p className="text-stone-300 font-bold italic">Belum ada transaksi dilakukan.</p>
                  </div>
                ) : orders.filter(o => o.customer.phone === loggedInCustomer.phone).map((o, i) => (
                  <div key={i} className="bg-white p-8 rounded-[45px] border border-stone-100 shadow-xl shadow-stone-50 group">
                     <div className="flex justify-between items-start mb-6 pb-6 border-b border-stone-50">
                        <div><p className="text-[10px] text-stone-300 font-black mb-1 tracking-widest uppercase">{o.id}</p><p className="text-sm font-bold text-stone-500 tracking-tight">{o.date}</p></div>
                        <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${o.status === 'Menunggu' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700 shadow-lg shadow-green-100'}`}>{o.status}</span>
                     </div>
                     <div className="space-y-5">
                        {o.items.map((item, idx) => (
                          <div key={idx} className="flex gap-5 items-center">
                             <img src={item.imageUrl || "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=200&q=80"} className="w-14 h-14 rounded-2xl object-cover shadow-md" />
                             <div className="flex-grow"><p className="font-bold text-stone-900 text-base mb-0.5">{item.name}</p><p className="text-[10px] text-stone-400 font-black uppercase tracking-tighter">{item.weight}G ({item.kadar})</p></div>
                             <p className="font-bold text-stone-700 text-sm tracking-tighter">{formatRp(item.weight * priceList[item.kadar].sell)}</p>
                          </div>
                        ))}
                     </div>
                     <div className="mt-8 pt-8 border-t border-stone-50 flex justify-between items-center">
                        <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Total Bayar</span>
                        <span className="text-2xl font-black text-amber-600 tracking-tighter">{formatRp(o.total)}</span>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </main>

      {/* 🚀 TAB BAR MOBILE PREMIUM 🚀 */}
      <div className="fixed bottom-10 inset-x-10 h-24 bg-stone-950/90 backdrop-blur-3xl rounded-[40px] flex justify-around items-center px-6 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] z-[100] border border-white/10 sm:hidden">
         <button onClick={() => {setView('home'); window.scrollTo(0,0)}} className={`p-4 rounded-[26px] transition-all flex flex-col items-center gap-1.5 ${view === 'home' ? 'bg-amber-500 text-stone-950 shadow-[0_10px_20px_-5px_rgba(245,158,11,0.5)] scale-110' : 'text-stone-600 hover:text-stone-300'}`}>
            <Home size={26}/>
            {view === 'home' && <span className="text-[8px] font-black uppercase tracking-widest leading-none">Home</span>}
         </button>
         <button onClick={() => {setView('catalog'); window.scrollTo(0,0)}} className={`p-4 rounded-[26px] transition-all flex flex-col items-center gap-1.5 ${view === 'catalog' ? 'bg-amber-500 text-stone-950 shadow-[0_10px_20px_-5px_rgba(245,158,11,0.5)] scale-110' : 'text-stone-600 hover:text-stone-300'}`}>
            <Gem size={26}/>
            {view === 'catalog' && <span className="text-[8px] font-black uppercase tracking-widest leading-none">Katalog</span>}
         </button>
         <button onClick={() => {setView('cart'); window.scrollTo(0,0)}} className={`p-4 rounded-[26px] transition-all flex flex-col items-center gap-1.5 relative ${view === 'cart' ? 'bg-amber-500 text-stone-950 shadow-[0_10px_20px_-5px_rgba(245,158,11,0.5)] scale-110' : 'text-stone-600 hover:text-stone-300'}`}>
            <ShoppingCart size={26}/>
            {cart.length > 0 && <span className="absolute top-3 right-3 bg-white text-stone-950 text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-stone-950 animate-bounce shadow-xl">{cart.length}</span>}
            {view === 'cart' && <span className="text-[8px] font-black uppercase tracking-widest leading-none">Cart</span>}
         </button>
         <button onClick={() => {setView(loggedInCustomer ? 'profile' : 'login'); window.scrollTo(0,0)}} className={`p-4 rounded-[26px] transition-all flex flex-col items-center gap-1.5 ${view === 'login' || view === 'signup' || view === 'profile' ? 'bg-amber-500 text-stone-950 shadow-[0_10px_20px_-5px_rgba(245,158,11,0.5)] scale-110' : 'text-stone-600 hover:text-stone-300'}`}>
            <User size={26}/>
            {(view === 'profile' || view === 'login') && <span className="text-[8px] font-black uppercase tracking-widest leading-none">Profil</span>}
         </button>
      </div>

      {/* LOGIN AREA ADMIN TERSEMBUNYI */}
      <div className="text-center py-24 opacity-0 hover:opacity-10 cursor-default bg-stone-50">
         <div className="flex flex-col items-center gap-3 max-w-[200px] mx-auto bg-white p-6 rounded-3xl shadow-xl">
            <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Admin Control</p>
            <input type="text" placeholder="ID" onChange={e => setAdminKey({...adminKey, u: e.target.value})} className="w-full text-xs p-3 bg-stone-50 border rounded-xl text-center outline-none"/>
            <input type="password" placeholder="Pass" onChange={e => setAdminKey({...adminKey, p: e.target.value})} className="w-full text-xs p-3 bg-stone-50 border rounded-xl text-center outline-none"/>
            <button onClick={() => {
              if(adminKey.u === 'yuhu' && adminKey.p === 'admin') { setIsAdmin(true); setView('admin'); window.scrollTo(0,0); }
            }} className="w-full py-3 bg-stone-900 text-white rounded-xl text-[10px] font-bold active:scale-95 transition-all">BUKA PANEL</button>
         </div>
      </div>
    </div>

);
}

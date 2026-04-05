import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingCart, Gem, ChevronRight, ArrowLeft, Plus, Minus, Trash2, Search, User, MapPin, Phone, Settings,
  Upload, Edit3, Save, Lock, Calculator, Shield, TrendingUp, RefreshCw, Home, Store, Send, XCircle, CheckCircle,
  Clock, UserPlus, LogOut, Receipt, Calendar, LogIn, Users, UserX, Star 
} from 'lucide-react';

// === 1. MESIN DATABASE ONLINE (FIREBASE) ===
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const KADAR_FORMULA = {
  '6K': { factoryCostRate: 0.36 },
  '8K': { factoryCostRate: 0.46 },
  '9K': { factoryCostRate: 0.53 },
  '16K': { factoryCostRate: 0.70 },
  '17K': { factoryCostRate: 0.75 },
  '24K': { factoryCostRate: 1.00 },
};

const INITIAL_PRODUCTS = [
  { id: 6, code: 'SA-7732', name: 'Anting Emas Anak Karakter', weight: 1.5, kadar: '8K', category: 'Anting', description: 'Aman untuk kulit sensitif anak-anak.', imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80', isSold: false, isPending: false },
  { id: 5, code: 'SA-5510', name: 'Cincin Kawin Polos Elegan', weight: 4.0, kadar: '16K', category: 'Cincin', description: 'Simbol cinta abadi yang simpel dan elegan.', imageUrl: 'https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?auto=format&fit=crop&w=800&q=80', isSold: false, isPending: false },
];

const generateCode = () => 'SA-' + Math.floor(1000 + Math.random() * 9000);

export default function App() {
  const [view, setView] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const getSavedData = (key, initialValue) => { const saved = localStorage.getItem(key); if (saved) return JSON.parse(saved); return initialValue; };

  // --- STATE CORE ---
  const [storeSettings, setStoreSettings] = useState(() => getSavedData('sa_settings', { waNumber: "6282299081829", address: "Jl. Pasar Baru No. 1, Wonosobo", adminUser: "yuhu", adminPass: "admin" }));
  const [worldGoldPrice, setWorldGoldPrice] = useState(2550000); 
  const [profitMargin, setProfitMargin] = useState(15); 
  const [buybackDeduction, setBuybackDeduction] = useState(8); 
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState([]); 
  const [usersDB, setUsersDB] = useState([]);
  const [cart, setCart] = useState(() => getSavedData('sa_cart', []));
  const [loggedInUser, setLoggedInUser] = useState(() => getSavedData('sa_loggedIn', null));
  const [firebaseUser, setFirebaseUser] = useState(null);

  // --- 📡 RADAR LIVE DATA (FIREBASE) ---
  useEffect(() => {
    const initAuth = async () => { try { await signInAnonymously(auth); } catch (e) {} };
    initAuth();
    onAuthStateChanged(auth, (user) => setFirebaseUser(user));

    // Sinkronisasi Settings & Harga
    const unsubSettings = onSnapshot(doc(db, "toko_sri_ayu", "settings"), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        setWorldGoldPrice(d.goldPrice || 2550000);
        setProfitMargin(d.margin || 15);
        setBuybackDeduction(d.buyback || 8);
      }
    });

    // Sinkronisasi Produk (Status Abu-abu & Sold Out)
    const unsubProducts = onSnapshot(doc(db, "toko_sri_ayu", "products"), (docSnap) => {
      if (docSnap.exists()) setProducts(docSnap.data().data || INITIAL_PRODUCTS);
    });

    // Sinkronisasi Orders & Users
    const unsubOrders = onSnapshot(doc(db, "toko_sri_ayu", "orders"), (docSnap) => {
      if (docSnap.exists()) setOrders(docSnap.data().data || []);
    });
    const unsubUsers = onSnapshot(doc(db, "toko_sri_ayu", "users"), (docSnap) => {
      if (docSnap.exists()) setUsersDB(docSnap.data().data || []);
    });

    return () => { unsubSettings(); unsubProducts(); unsubOrders(); unsubUsers(); };
  }, []);

  // --- FUNGSI UPDATE CLOUD ---
  const saveGoldToCloud = async (newPrice, newMargin, newDeduction) => {
    await setDoc(doc(db, "toko_sri_ayu", "settings"), { goldPrice: newPrice, margin: newMargin, buyback: newDeduction });
  };
  const updateProductsCloud = async (newData) => {
    await setDoc(doc(db, "toko_sri_ayu", "products"), { data: newData });
  };
  const updateOrdersCloud = async (newData) => {
    await setDoc(doc(db, "toko_sri_ayu", "orders"), { data: newData });
  };
  const updateUsersDBCloud = async (newData) => {
    await setDoc(doc(db, "toko_sri_ayu", "users"), { data: newData });
  };

  // --- LOGIKA HARGA ---
  const currentPrices = useMemo(() => {
    let prices = {};
    Object.keys(KADAR_FORMULA).forEach(kadar => {
      const rate = KADAR_FORMULA[kadar].factoryCostRate;
      const baseCost = worldGoldPrice * rate;
      const sellPrice = Math.ceil((baseCost * (1 + (profitMargin / 100))) / 5000) * 5000;
      const buybackPrice = Math.floor((sellPrice * (1 - (buybackDeduction / 100))) / 5000) * 5000;
      prices[kadar] = { cost: baseCost, sell: sellPrice, buyback: buybackPrice };
    });
    return prices;
  }, [worldGoldPrice, profitMargin, buybackDeduction]);

  // --- 🔒 LOGIKA LOCK HARGA & CHECKOUT (1 JAM) ---
  const handleSendToWA = async () => {
    const invoiceNumber = 'INV-' + Date.now();
    const expiredAt = Date.now() + (60 * 60 * 1000); // Batas 1 jam
    
    const newOrder = {
      id: invoiceNumber,
      customer: { ...customer },
      items: [...cart],
      total: cart.reduce((sum, item) => sum + (item.weight * currentPrices[item.kadar].sell), 0),
      hargaTerunci: worldGoldPrice, // Kunci harga saat checkout
      date: new Date().toLocaleString('id-ID'),
      timestamp: Date.now(),
      status: 'Menunggu',
      expiredAt: expiredAt
    };

    // Tandai barang jadi abu-abu (Pending)
    const updatedProducts = products.map(p => {
      if (cart.find(c => c.id === p.id)) return { ...p, isPending: true };
      return p;
    });

    await updateOrdersCloud([newOrder, ...orders]);
    await updateProductsCloud(updatedProducts);

    // Kirim WA
    let text = `*🧾 PESANAN - HARGA TERKUNCI 1 JAM*%0A*NO:* ${invoiceNumber}%0A-----------------------------------%0A*NAMA:* ${customer.name}%0A*TOTAL:* Rp ${newOrder.total.toLocaleString('id-ID')}%0A-----------------------------------%0AMohon diproses admin Toko Mas Sri Ayu.`;
    window.open(`https://wa.me/${storeSettings.waNumber}?text=${text}`, '_blank');
    
    setCart([]); setView('home'); alert("Harga dikunci 1 jam! Segera lakukan pembayaran.");
  };

  // --- LOGIKA ADMIN ---
  const handleConfirmOrder = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    const itemIds = order.items.map(i => i.id);
    const updatedProducts = products.map(p => {
      if (itemIds.includes(p.id)) return { ...p, isPending: false, isSold: true };
      return p;
    });
    await updateProductsCloud(updatedProducts);
    await updateOrdersCloud(orders.map(o => o.id === orderId ? { ...o, status: 'Selesai' } : o));
  };

  const handleCancelOrder = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    const itemIds = order.items.map(i => i.id);
    const updatedProducts = products.map(p => {
      if (itemIds.includes(p.id)) return { ...p, isPending: false, isSold: false };
      return p;
    });
    await updateProductsCloud(updatedProducts);
    await updateOrdersCloud(orders.map(o => o.id === orderId ? { ...o, status: 'Dibatalkan' } : o));
  };

  // UI States & Helpers
  const [tempSettings, setTempSettings] = useState({ gold: 2550000, margin: 15, deduction: 8 });
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [newProduct, setNewProduct] = useState({ code: generateCode(), name: '', weight: '', kadar: '8K', category: 'Cincin', imageUrl: '', isSold: false, isPending: false });
  const formatRp = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.toLowerCase().includes(searchQuery.toLowerCase()));

  // ==========================================
  // RENDER ADMIN
  // ==========================================
  if (isAdmin && view === 'admin') {
    return (
      <div className="min-h-screen bg-stone-100 pb-24">
        <nav className="bg-stone-900 text-white p-4 flex justify-between items-center shadow-md">
          <span className="font-bold flex items-center gap-2"><TrendingUp className="text-amber-500"/> Ruang Kendali Sri Ayu</span>
          <div className="flex items-center gap-3">
             <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/50 px-2 py-1 rounded flex items-center gap-1 animate-pulse"><span className="w-1 h-1 bg-green-400 rounded-full"></span> Online</span>
             <button onClick={() => {setIsAdmin(false); setView('home');}} className="text-xs bg-red-600 px-3 py-1.5 rounded font-bold">Keluar</button>
          </div>
        </nav>
        
        <main className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Kontrol Harga */}
          <div className="bg-stone-900 rounded-2xl p-6 text-white shadow-xl">
             <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold flex items-center gap-2"><Calculator size={18}/> Update Harga Emas</h2>
                {isEditingSettings ? (
                  <button onClick={() => {saveGoldToCloud(tempSettings.gold, tempSettings.margin, tempSettings.deduction); setIsEditingSettings(false);}} className="bg-amber-500 text-stone-900 px-4 py-1.5 rounded-lg font-bold text-xs">Simpan Live</button>
                ) : <button onClick={() => setIsEditingSettings(true)} className="text-amber-400 border border-amber-400/30 px-4 py-1.5 rounded-lg text-xs font-bold">Ubah</button>}
             </div>
             <div className="space-y-4">
                <div className="bg-stone-800 p-4 rounded-xl">
                   <p className="text-[10px] text-stone-400 font-bold mb-1">HARGA DUNIA (24K)</p>
                   {isEditingSettings ? <input type="number" value={tempSettings.gold} onChange={e => setTempSettings({...tempSettings, gold: parseInt(e.target.value)})} className="w-full bg-stone-900 border border-amber-500 p-2 rounded text-xl font-bold"/> : <p className="text-2xl font-bold text-amber-500">{formatRp(worldGoldPrice)}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-stone-800 p-3 rounded-xl"><p className="text-[10px] text-stone-400 font-bold mb-1">MARGIN %</p>{isEditingSettings ? <input type="number" value={tempSettings.margin} onChange={e => setTempSettings({...tempSettings, margin: parseFloat(e.target.value)})} className="bg-stone-900 w-full p-1 rounded"/> : <p className="font-bold">{profitMargin}%</p>}</div>
                   <div className="bg-stone-800 p-3 rounded-xl"><p className="text-[10px] text-stone-400 font-bold mb-1">BUYBACK %</p>{isEditingSettings ? <input type="number" value={tempSettings.deduction} onChange={e => setTempSettings({...tempSettings, deduction: parseFloat(e.target.value)})} className="bg-stone-900 w-full p-1 rounded"/> : <p className="font-bold">{buybackDeduction}%</p>}</div>
                </div>
             </div>
          </div>

          {/* Pesanan Masuk */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
             <h2 className="font-bold mb-4 flex items-center gap-2"><ShoppingCart size={18}/> Pesanan Masuk</h2>
             <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {orders.map(o => (
                  <div key={o.id} className={`p-4 rounded-xl border ${o.status === 'Menunggu' ? 'border-amber-500 bg-amber-50' : 'bg-stone-50 opacity-60'}`}>
                    <div className="flex justify-between font-bold text-xs mb-2"><span>{o.customer.name}</span><span className="text-amber-600">{o.status}</span></div>
                    <div className="text-[10px] text-stone-500 mb-3">{o.items.map(i => i.name).join(', ')}</div>
                    {o.status === 'Menunggu' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleConfirmOrder(o.id)} className="flex-1 bg-green-600 text-white py-1.5 rounded text-[10px] font-bold">CONFIRM (SOLD)</button>
                        <button onClick={() => handleCancelOrder(o.id)} className="flex-1 bg-red-600 text-white py-1.5 rounded text-[10px] font-bold">CANCEL (BALIK)</button>
                      </div>
                    )}
                  </div>
                ))}
             </div>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // RENDER TAMPILAN CUSTOMER
  // ==========================================
  return (
    <div className="min-h-screen bg-stone-50 font-sans pb-24">
      {/* Navbar */}
      <nav className="bg-white border-b p-4 sticky top-0 z-50 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
          <div className="bg-stone-900 text-amber-400 p-1.5 rounded-lg font-serif font-bold text-xl">SA</div>
          <span className="font-serif font-bold text-xl hidden sm:block">Sri Ayu</span>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={() => setView('catalog')} className="text-stone-500 font-bold text-xs">KATALOG</button>
           <button onClick={() => setView('cart')} className="relative p-2 bg-stone-100 rounded-full">
              <ShoppingCart size={18}/>
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">{cart.length}</span>}
           </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-4">
        {/* Katalog */}
        {view === 'home' || view === 'catalog' ? (
          <div className="space-y-6">
            <div className="relative"><Search className="absolute left-3 top-3 text-stone-400" size={18}/><input type="text" placeholder="Cari Koleksi Emas Wonosobo..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border rounded-2xl outline-none font-bold text-sm shadow-sm"/></div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(p => (
                <div key={p.id} className={`bg-white rounded-2xl border overflow-hidden transition-all ${p.isSold ? 'opacity-50' : p.isPending ? 'grayscale' : 'hover:shadow-md'}`}>
                  <div className="relative h-40 bg-stone-100">
                    <img src={p.imageUrl} className="w-full h-full object-cover"/>
                    {p.isSold ? (
                      <div className="absolute inset-0 bg-red-600/80 flex items-center justify-center text-white font-bold text-xs uppercase tracking-widest">SOLD OUT</div>
                    ) : p.isPending ? (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-[9px] text-center px-2">DIPESAN (HARGA TERKUNCI)</div>
                    ) : (
                      <div className="absolute top-2 left-2 bg-stone-900/80 text-amber-400 text-[10px] px-2 py-0.5 rounded font-bold">{p.code}</div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-xs mb-1 line-clamp-1">{p.name}</h3>
                    <div className="flex justify-between items-center mt-2">
                       <span className="text-[9px] font-bold text-stone-400 uppercase">{p.weight}g • {p.kadar}</span>
                       <p className="font-bold text-sm text-amber-600">{formatRp(p.weight * currentPrices[p.kadar].sell)}</p>
                    </div>
                    {!p.isSold && !p.isPending && (
                      <button onClick={() => {setCart([...cart, p]); alert("Masuk Keranjang!");}} className="w-full mt-3 bg-stone-900 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"><Plus size={14}/> BELI</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Keranjang & Checkout */}
        {view === 'cart' && (
          <div className="bg-white rounded-3xl p-6 border shadow-sm max-w-lg mx-auto">
            <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2"><ArrowLeft className="cursor-pointer" onClick={() => setView('home')}/> Keranjang Anda</h2>
            {cart.length === 0 ? <p className="text-center text-stone-400 py-10">Kosong</p> : (
              <div className="space-y-6">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 items-center pb-4 border-b">
                    <img src={item.imageUrl} className="w-16 h-16 object-cover rounded-xl"/>
                    <div className="flex-grow"><p className="font-bold text-sm">{item.name}</p><p className="text-amber-600 font-bold text-sm">{formatRp(item.weight * currentPrices[item.kadar].sell)}</p></div>
                    <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} className="text-red-500"><Trash2 size={18}/></button>
                  </div>
                ))}
                <div className="space-y-3 pt-4">
                  <input type="text" placeholder="Nama Lengkap" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="w-full p-3 bg-stone-50 border rounded-xl"/>
                  <textarea placeholder="Alamat Wonosobo" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} className="w-full p-3 bg-stone-50 border rounded-xl resize-none" rows="2"></textarea>
                  <div className="bg-stone-900 text-white p-4 rounded-2xl flex justify-between items-center">
                    <span className="font-bold text-sm">TOTAL</span>
                    <span className="font-bold text-xl text-amber-400">{formatRp(cart.reduce((sum, item) => sum + (item.weight * currentPrices[item.kadar].sell), 0))}</span>
                  </div>
                  <button onClick={handleSendToWA} className="w-full bg-[#25D366] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2">CHECKOUT (KUNCI HARGA 1 JAM) <Send size={18}/></button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer / Mobile Nav */}
      <div className="fixed bottom-4 inset-x-4 bg-stone-900/90 backdrop-blur-md text-white rounded-2xl p-4 flex justify-around sm:hidden shadow-2xl border border-white/10">
        <button onClick={() => setView('home')} className={view === 'home' ? 'text-amber-400' : 'text-stone-400'}><Home size={22}/></button>
        <button onClick={() => setView('catalog')} className={view === 'catalog' ? 'text-amber-400' : 'text-stone-400'}><Gem size={22}/></button>
        <button onClick={() => setView('cart')} className={view === 'cart' ? 'text-amber-400' : 'text-stone-400'}><ShoppingCart size={22}/></button>
        <button onClick={() => setIsAdmin(true)} className="text-stone-400"><Lock size={22}/></button>
      </div>
    </div>
  );
}

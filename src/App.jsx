import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingCart, Gem, ChevronRight, ArrowLeft, Plus, Minus, Trash2, Search, User, MapPin, Phone, Settings,
  Upload, Edit3, Save, Lock, Calculator, Shield, TrendingUp, RefreshCw, Home, Store, Send, XCircle, CheckCircle,
  Clock, UserPlus, LogOut, Receipt, Calendar, LogIn, Users, UserX, Star 
} from 'lucide-react';

// === 1. MESIN DATABASE ONLINE (FIREBASE) ===
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCMHxO5hlxUBpZDuPa4PQkJ4EKIffzxqf8",
  authDomain: "toko-mas-sri-ayu.firebaseapp.com",
  projectId: "toko-mas-sri-ayu",
  storageBucket: "toko-mas-sri-ayu.firebasestorage.app",
  messagingSenderId: "195511507670",
  appId: "1:195511507670:web:7c373958b65995d8f00777",
  measurementId: "G-1BJ26ZSB0F"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// === 2. LANJUTAN KODE ASLI BAPAK DI BAWAH INI ===
const KADAR_FORMULA = {
  '6K': { factoryCostRate: 0.36 },
  '8K': { factoryCostRate: 0.46 },
  '9K': { factoryCostRate: 0.53 },
  '16K': { factoryCostRate: 0.70 },
  '17K': { factoryCostRate: 0.75 },
  '24K': { factoryCostRate: 1.00 },
};

const INITIAL_PRODUCTS = [
  { id: 6, code: 'SA-7732', name: 'Anting Emas Anak Karakter', weight: 1.5, kadar: '8K', category: 'Anting', description: 'Aman untuk kulit sensitif anak-anak.', imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80', isSold: false },
  { id: 5, code: 'SA-5510', name: 'Cincin Kawin Polos Elegan', weight: 4.0, kadar: '16K', category: 'Cincin', description: 'Simbol cinta abadi yang simpel dan elegan.', imageUrl: 'https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?auto=format&fit=crop&w=800&q=80', isSold: false },
  { id: 4, code: 'SA-3398', name: 'Liontin Emas Kuning Minimalis', weight: 2.1, kadar: '9K', category: 'Liontin', description: 'Cocok dipadukan dengan kalung rantai tipis.', imageUrl: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?auto=format&fit=crop&w=800&q=80', isSold: false },
  { id: 3, code: 'SA-9012', name: 'Gelang Emas Putih Rantai', weight: 5.2, kadar: '9K', category: 'Gelang', description: 'Model rantai kuat dan elegan.', imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80', isSold: false },
  { id: 2, code: 'SA-4421', name: 'Kalung Emas 24K Polos', weight: 10.0, kadar: '24K', category: 'Kalung', description: 'Emas murni dengan kilau abadi.', imageUrl: 'https://images.unsplash.com/photo-1599643478524-fb66f7200424?auto=format&fit=crop&w=800&q=80', isSold: false },
  { id: 1, code: 'SA-1024', name: 'Cincin Emas Kuning Bunga', weight: 3.5, kadar: '8K', category: 'Cincin', description: 'Desain cantik. Bisa dicuci ulang seperti baru.', imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f66122245?auto=format&fit=crop&w=800&q=80', isSold: false },
];

const generateCode = () => 'SA-' + Math.floor(1000 + Math.random() * 9000);

export default function App() {
  const [view, setView] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  
  const getSavedData = (key, initialValue) => { const saved = localStorage.getItem(key); if (saved) return JSON.parse(saved); return initialValue; };

  // --- STATE SETTING TOKO ---
  const [storeSettings, setStoreSettings] = useState(() => getSavedData('sa_settings', { waNumber: "6282299081829", address: "Jl. Pasar Baru No. 1, Wonosobo", adminUser: "yuhu", adminPass: "admin" }));
  const [worldGoldPrice, setWorldGoldPrice] = useState(() => getSavedData('sa_goldPrice', 2550000)); 
  const [profitMargin, setProfitMargin] = useState(() => getSavedData('sa_margin', 15)); 
  const [buybackDeduction, setBuybackDeduction] = useState(() => getSavedData('sa_deduction', 8)); 
  
  // --- STATE DATABASE CLOUD (Produk, Pesanan, Pelanggan) ---
  const [products, setProducts] = useState(() => getSavedData('sa_products', INITIAL_PRODUCTS));
  const [orders, setOrders] = useState(() => getSavedData('sa_orders', [])); 
  const [usersDB, setUsersDB] = useState(() => getSavedData('sa_users', []));
  
  // State Personal (Keranjang & Login)
  const [cart, setCart] = useState(() => getSavedData('sa_cart', []));
  const [loggedInUser, setLoggedInUser] = useState(() => getSavedData('sa_loggedIn', null));
  const [firebaseUser, setFirebaseUser] = useState(null);

  // --- 🌟 AUTENTIKASI FIREBASE ANONIM 🌟 ---
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try { await signInAnonymously(auth); } 
      catch (error) { console.error("Gagal koneksi anonim:", error); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => setFirebaseUser(user));
    return () => unsubscribe();
  }, []);

  // --- 🌟 SINKRONISASI REAL-TIME DARI CLOUD DENGAN PENGAMAN ERROR 🌟 ---
  useEffect(() => {
    if (!db || !firebaseUser) return; 
    
    // Tarik data Pesanan Live
    const unsubOrders = onSnapshot(doc(db, "toko_sri_ayu", "orders"), 
      (docSnap) => { if (docSnap.exists()) setOrders(docSnap.data().data || []); },
      (error) => console.error("Akses Ditolak Firebase (Orders):", error)
    );
    
    // Tarik data Produk/Etalase Live
    const unsubProducts = onSnapshot(doc(db, "toko_sri_ayu", "products"), 
      (docSnap) => { if (docSnap.exists() && docSnap.data().data.length > 0) setProducts(docSnap.data().data); },
      (error) => console.error("Akses Ditolak Firebase (Products):", error)
    );

    // Tarik data User Live
    const unsubUsers = onSnapshot(doc(db, "toko_sri_ayu", "users"), 
      (docSnap) => { if (docSnap.exists()) setUsersDB(docSnap.data().data || []); },
      (error) => console.error("Akses Ditolak Firebase (Users):", error)
    );

    return () => { unsubOrders(); unsubProducts(); unsubUsers(); };
  }, [firebaseUser]);

  // --- FUNGSI UPDATE KE CLOUD AMAN DARI CRASH ---
  const updateOrdersCloud = async (newData) => {
     setOrders(newData); 
     localStorage.setItem('sa_orders', JSON.stringify(newData));
     if (db && firebaseUser) {
        try { await setDoc(doc(db, "toko_sri_ayu", "orders"), { data: newData }); }
        catch (e) { console.error("Gagal update orders:", e); }
     }
  };
  const updateProductsCloud = async (newData) => {
     setProducts(newData); 
     localStorage.setItem('sa_products', JSON.stringify(newData));
     if (db && firebaseUser) {
        try { await setDoc(doc(db, "toko_sri_ayu", "products"), { data: newData }); }
        catch (e) { console.error("Gagal update produk:", e); }
     }
  };
  const updateUsersDBCloud = async (newData) => {
     setUsersDB(newData); 
     localStorage.setItem('sa_users', JSON.stringify(newData));
     if (db && firebaseUser) {
        try { await setDoc(doc(db, "toko_sri_ayu", "users"), { data: newData }); }
        catch (e) { console.error("Gagal update user:", e); }
     }
  };

  // Simpan data lokal
  useEffect(() => { localStorage.setItem('sa_settings', JSON.stringify(storeSettings)); }, [storeSettings]);
  useEffect(() => { localStorage.setItem('sa_goldPrice', JSON.stringify(worldGoldPrice)); }, [worldGoldPrice]);
  useEffect(() => { localStorage.setItem('sa_margin', JSON.stringify(profitMargin)); }, [profitMargin]);
  useEffect(() => { localStorage.setItem('sa_deduction', JSON.stringify(buybackDeduction)); }, [buybackDeduction]);
  useEffect(() => { localStorage.setItem('sa_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('sa_loggedIn', JSON.stringify(loggedInUser)); }, [loggedInUser]);

  // --- STATE UI SEMENTARA ---
  const [tempStoreSettings, setTempStoreSettings] = useState(storeSettings);
  const [isEditingStore, setIsEditingStore] = useState(false);
  const [tempSettings, setTempSettings] = useState({ gold: worldGoldPrice, margin: profitMargin, deduction: buybackDeduction });
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customer, setCustomer] = useState(loggedInUser ? { name: loggedInUser.name, phone: loggedInUser.phone, address: loggedInUser.address } : { name: '', phone: '', address: '' });
  const [expandedUserPhone, setExpandedUserPhone] = useState(null);
  const [invoiceDate, setInvoiceDate] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(''); 
  const [adminInput, setAdminInput] = useState({ username: '', password: '' });
  const [editingProductId, setEditingProductId] = useState(null);
  const [newProduct, setNewProduct] = useState({ code: generateCode(), name: '', weight: '', kadar: '8K', category: 'Cincin', description: '', imageUrl: '', isSold: false });

  const currentPrices = useMemo(() => {
    let prices = {};
    Object.keys(KADAR_FORMULA).forEach(kadar => {
      const rate = KADAR_FORMULA[kadar].factoryCostRate;
      const baseCost = worldGoldPrice * rate;
      const rawSellPrice = baseCost * (1 + (profitMargin / 100));
      const sellPrice = Math.ceil(rawSellPrice / 5000) * 5000;
      const rawBuyback = sellPrice * (1 - (buybackDeduction / 100));
      const buybackPrice = Math.floor(rawBuyback / 5000) * 5000;
      prices[kadar] = { cost: baseCost, sell: sellPrice, buyback: buybackPrice };
    });
    return prices;
  }, [worldGoldPrice, profitMargin, buybackDeduction]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const heroProducts = products.slice(0, 6); 

  useEffect(() => {
    if (view !== 'home' || heroProducts.length === 0) return;
    const timer = setInterval(() => { setCurrentSlide((prev) => (prev + 1) % heroProducts.length); }, 4000); 
    return () => clearInterval(timer);
  }, [view, heroProducts.length]);

  // --- LOGIKA ADMIN ---
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminInput.username === storeSettings.adminUser && adminInput.password === storeSettings.adminPass) {
      setIsAdmin(true); setView('admin');
    } else { alert("Username atau Password Salah!"); }
  };

  const saveGoldSettings = () => {
    setWorldGoldPrice(tempSettings.gold); setProfitMargin(tempSettings.margin); setBuybackDeduction(tempSettings.deduction); setIsEditingSettings(false);
    alert("Berhasil diperbarui!");
  };

  const saveStoreSettings = () => { setStoreSettings(tempStoreSettings); setIsEditingStore(false); alert("Berhasil diperbarui!"); };

  const handleEditProductClick = (product) => {
    setEditingProductId(product.id);
    setNewProduct({ ...product, weight: product.weight.toString(), description: product.description || '', imageUrl: product.imageUrl || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setNewProduct({ code: generateCode(), name: '', weight: '', kadar: '8K', category: 'Cincin', description: '', imageUrl: '', isSold: false });
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if(!newProduct.code || !newProduct.name || !newProduct.weight) return alert("Wajib diisi!");
    const productData = { ...newProduct, weight: parseFloat(newProduct.weight) };
    if (editingProductId) {
      updateProductsCloud(products.map(p => p.id === editingProductId ? { ...productData, id: editingProductId, isSold: p.isSold } : p));
      setEditingProductId(null);
    } else {
      updateProductsCloud([{ ...productData, id: Date.now() }, ...products]); 
    }
    setNewProduct({ code: generateCode(), name: '', weight: '', kadar: '8K', category: 'Cincin', description: '', imageUrl: '', isSold: false });
    alert("Tersimpan ke Cloud!");
  };

  const handleDeleteProduct = (id) => {
    if(confirm("Yakin ingin menghapus?")) { 
      updateProductsCloud(products.filter(p => p.id !== id)); 
      setCart(cart.filter(c => c.id !== id)); 
      if(editingProductId === id) setEditingProductId(null); 
    }
  };

  const toggleProductStatus = (id) => {
    updateProductsCloud(products.map(p => p.id === id ? { ...p, isSold: !p.isSold } : p));
    setCart(cart.filter(c => c.id !== id));
  };

  const toggleBlockUser = (phone) => {
    const userToBlock = usersDB.find(u => u.phone === phone);
    if(!userToBlock) return;
    const isBlocking = !userToBlock.isBlocked;
    if(confirm(`Yakin ${isBlocking ? 'memblokir' : 'buka blokir'} ${userToBlock.name}?`)) {
      updateUsersDBCloud(usersDB.map(u => u.phone === phone ? { ...u, isBlocked: isBlocking } : u));
      if (isBlocking && loggedInUser && loggedInUser.phone === phone) handleLogout();
    }
  };

  // --- LOGIKA AUTENTIKASI ---
  const [authForm, setAuthForm] = useState({ name: '', phone: '', address: '', password: '' });
  const handleSignup = (e) => {
    e.preventDefault();
    if (usersDB.find(u => u.phone === authForm.phone)) return alert("Nomor WA sudah terdaftar!");
    const newUser = { ...authForm, isBlocked: false };
    
    updateUsersDBCloud([...usersDB, newUser]); 
    
    setLoggedInUser(newUser); setCustomer({ name: newUser.name, phone: newUser.phone, address: newUser.address }); 
    setView('home'); alert("Berhasil! Selamat datang."); setAuthForm({ name: '', phone: '', address: '', password: '' });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const user = usersDB.find(u => u.phone === authForm.phone && u.password === authForm.password);
    if (user) {
        if (user.isBlocked) return alert("AKUN DIBLOKIR. Hubungi Admin.");
        setLoggedInUser(user); setCustomer({ name: user.name, phone: user.phone, address: user.address }); setView('home'); setAuthForm({ name: '', phone: '', address: '', password: '' });
    } else { alert("Nomor WA / Password salah!"); }
  };

  const handleLogout = () => { setLoggedInUser(null); setCustomer({ name: '', phone: '', address: '' }); setView('home'); };

  const handleCustomerCancelOrder = (orderId) => {
    if(confirm("Batalkan pesanan ini?")) {
        const orderToCancel = orders.find(o => o.id === orderId);
        if(orderToCancel) {
            const itemIds = orderToCancel.items.map(i => i.id);
            updateProductsCloud(products.map(p => itemIds.includes(p.id) ? { ...p, isSold: false } : p));
            updateOrdersCloud(orders.map(o => o.id === orderId ? { ...o, status: 'Dibatalkan' } : o));
            alert("Pesanan Dibatalkan. Stok kembali ke etalase.");
        }
    }
  };

  const handleConfirmOrder = (orderId) => { updateOrdersCloud(orders.map(o => o.id === orderId ? { ...o, status: 'Selesai' } : o)); };
  
  const handleCancelOrder = (orderId) => {
    if(confirm("Batal & kembalikan stok?")) {
      const orderToCancel = orders.find(o => o.id === orderId);
      if(orderToCancel) {
        const itemIds = orderToCancel.items.map(i => i.id);
        updateProductsCloud(products.map(p => itemIds.includes(p.id) ? { ...p, isSold: false } : p));
        updateOrdersCloud(orders.map(o => o.id === orderId ? { ...o, status: 'Dibatalkan' } : o));
      }
    }
  };

  const getWaLink = (phoneStr) => `https://wa.me/${phoneStr.replace(/[^0-9]/g, '').replace(/^0/, '62')}`;

  // --- LOGIKA KERANJANG ---
  const addToCart = (product) => {
    if (isAdmin) return alert("Admin tidak bisa belanja.");
    if (loggedInUser && loggedInUser.isBlocked) return alert("Akun diblokir.");
    if (product.isSold) return alert("Stok habis dipesan orang lain!");
    if (cart.find((item) => item.id === product.id)) return alert("Sudah di keranjang.");
    setCart([...cart, { ...product, qty: 1 }]);
    alert("Masuk keranjang!");
  };

  const removeFromCart = (id) => setCart(cart.filter(c => c.id !== id));
  const subtotal = cart.reduce((sum, item) => sum + (item.weight * currentPrices[item.kadar].sell * item.qty), 0);

  const handleProceedToInvoice = () => {
    if (loggedInUser && loggedInUser.isBlocked) return alert("Akun diblokir.");
    if (!customer.name || !customer.phone || !customer.address) return alert("Lengkapi data diri.");
    
    // Cek ulang stok di Cloud sebelum lanjut
    let hasSoldItem = false;
    cart.forEach(cartItem => {
       const cloudProduct = products.find(p => p.id === cartItem.id);
       if(cloudProduct && cloudProduct.isSold) hasSoldItem = true;
    });
    
    if(hasSoldItem) {
        alert("Mohon maaf, salah satu barang di keranjang Anda baru saja dibeli orang lain. Silakan cek kembali keranjang Anda.");
        setCart(cart.filter(c => {
           const cloudProduct = products.find(p => p.id === c.id);
           return cloudProduct && !cloudProduct.isSold;
        }));
        return;
    }

    setInvoiceDate(new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
    setInvoiceNumber('INV-' + Math.floor(100000 + Math.random() * 900000));
    setView('invoice'); window.scrollTo(0,0);
  };

  const handleSendToWA = () => {
    let text = `*🧾 KONFIRMASI PESANAN - TOKO MAS SRI AYU*%0A*NO. INVOICE:* ${invoiceNumber}%0A-----------------------------------%0A%0A*DATA PEMBELI:*%0A👤 Nama: ${customer.name}%0A📱 WA: ${customer.phone}%0A📍 Alamat: ${customer.address}%0A%0A*DETAIL PESANAN:*%0A`;
    cart.forEach((item, i) => { text += `${i+1}. [${item.code}] ${item.name} - ${item.weight}g (${item.kadar}) = Rp ${(currentPrices[item.kadar].sell * item.weight).toLocaleString('id-ID')}%0A`; });
    text += `%0A-----------------------------------%0A*TOTAL : Rp ${subtotal.toLocaleString('id-ID')}*%0A-----------------------------------%0A%0A🛡️ *Garansi:* Buyback potong ${buybackDeduction}% dari nota.%0A*(Kirimkan foto invoice setelah ini)*%0AMohon diproses.`;

    const newOrder = { id: invoiceNumber, customer: { ...customer }, items: [...cart], total: subtotal, date: new Date().toLocaleString('id-ID'), timestamp: Date.now(), status: 'Menunggu' };
    
    updateOrdersCloud([newOrder, ...orders]);
    updateProductsCloud(products.map(p => cart.find(c => c.id === p.id) ? { ...p, isSold: true } : p));
    
    setCart([]); setView('home'); alert("Dialihkan ke WA. Pesanan otomatis masuk ke Layar Admin!");
    
    const link = document.createElement('a'); link.href = `https://wa.me/${storeSettings.waNumber}?text=${text}`; link.target = '_blank'; link.click();
  };

  const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  const latestProducts = products.slice(0, 3);

  // ==========================================
  // RENDER TAMPILAN
  // ==========================================

  if (view === 'adminLogin') {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col p-4 font-sans justify-center items-center">
        <button onClick={() => setView('home')} className="absolute top-6 left-6 text-stone-400 flex items-center gap-2 font-bold hover:text-white transition-colors"><ArrowLeft size={18}/> Batal</button>
        <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-6"><Lock className="mx-auto text-amber-500 mb-2" size={40}/><h1 className="text-xl font-bold text-stone-900">Akses Admin</h1></div>
          {firebaseConfig.apiKey === "" && (
             <div className="bg-red-100 text-red-600 text-[10px] font-bold p-3 rounded-lg mb-4 text-center border border-red-200">
               ⚠️ KODE CLOUD FIREBASE BELUM DIMASUKKAN.<br/>Toko saat ini berjalan dalam Mode Offline (Lokal).
             </div>
          )}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <input type="text" placeholder="Username Admin" value={adminInput.username} onChange={(e) => setAdminInput({...adminInput, username: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none text-center font-bold tracking-widest focus:ring-2 focus:ring-amber-500" required />
            <input type="password" placeholder="Password" value={adminInput.password} onChange={(e) => setAdminInput({...adminInput, password: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none text-center focus:ring-2 focus:ring-amber-500" required />
            <button type="submit" className="w-full bg-amber-500 text-white font-bold py-4 rounded-xl hover:bg-amber-600 transition-colors mt-2 shadow-lg shadow-amber-500/30">Masuk Panel</button>
          </form>
        </div>
      </div>
    );
  }

  if (isAdmin && view === 'admin') {
    return (
      <div className="min-h-screen bg-stone-100 font-sans pb-24">
        <nav className="bg-stone-900 text-white p-4 sticky top-0 z-50 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2"><TrendingUp className="text-amber-500" /><span className="font-bold text-lg hidden sm:block">Ruang Kendali Admin</span><span className="font-bold sm:hidden">Admin Panel</span></div>
          <div className="flex items-center gap-3">
             {db ? <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/50 px-2 py-1 rounded shadow-sm flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online</span> : <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/50 px-2 py-1 rounded shadow-sm">Offline</span>}
             <button onClick={() => {setIsAdmin(false); setView('home');}} className="text-sm bg-stone-800 px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition-colors">Keluar</button>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto p-4 mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-stone-900 rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-amber-500 p-4 flex justify-between items-center">
                 <h2 className="font-bold text-stone-900 flex items-center gap-2"><Calculator size={20}/> Pusat Kontrol Harga</h2>
                 {isEditingSettings ? (
                    <button onClick={saveGoldSettings} className="bg-stone-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-stone-800 flex items-center gap-1 transition-colors"><Save size={14}/> Terapkan</button>
                 ) : (
                    <button onClick={() => setIsEditingSettings(true)} className="bg-stone-900 text-amber-400 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-stone-800 flex items-center gap-1 transition-colors"><Edit3 size={14}/> Ubah Setelan</button>
                 )}
              </div>
              <div className="p-4 sm:p-6 space-y-4 text-stone-200">
                <div className="bg-stone-800 p-4 rounded-xl border border-stone-700">
                  <label className="text-[10px] sm:text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">Harga Emas Dunia (24K) Hari Ini</label>
                  {isEditingSettings ? (
                    <div className="flex items-center gap-2"><span className="font-bold text-xl text-amber-500">Rp</span><input type="number" value={tempSettings.gold} onChange={(e) => setTempSettings({...tempSettings, gold: parseInt(e.target.value)||0})} className="w-full bg-stone-900 border border-amber-500 rounded-lg p-2 font-bold text-xl text-white outline-none" /></div>
                  ) : <div className="font-bold text-2xl sm:text-3xl text-amber-500">{formatRp(worldGoldPrice)}</div>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-stone-800 p-4 rounded-xl border border-stone-700"><label className="text-[10px] sm:text-xs font-bold text-stone-400 uppercase block mb-1">Margin (+)</label>{isEditingSettings ? <div className="flex items-center gap-2"><input type="number" value={tempSettings.margin} onChange={(e) => setTempSettings({...tempSettings, margin: parseFloat(e.target.value)||0})} className="w-full bg-stone-900 border border-stone-600 rounded-lg p-2 font-bold text-white outline-none" /> <span className="font-bold text-amber-500">%</span></div> : <div className="font-bold text-xl text-white">{profitMargin} %</div>}</div>
                  <div className="bg-stone-800 p-4 rounded-xl border border-stone-700"><label className="text-[10px] sm:text-xs font-bold text-stone-400 uppercase block mb-1">Buyback (-)</label>{isEditingSettings ? <div className="flex items-center gap-2"><input type="number" value={tempSettings.deduction} onChange={(e) => setTempSettings({...tempSettings, deduction: parseFloat(e.target.value)||0})} className="w-full bg-stone-900 border border-stone-600 rounded-lg p-2 font-bold text-white outline-none" /> <span className="font-bold text-red-400">%</span></div> : <div className="font-bold text-xl text-red-400">{buybackDeduction} %</div>}</div>
                </div>
                <div className="mt-4 border border-stone-700 rounded-xl overflow-hidden">
                  <div className="bg-stone-800 p-2 text-xs font-bold text-center border-b border-stone-700 text-amber-400">SIMULASI HARGA PER GRAM HARI INI</div>
                  <div className="grid grid-cols-4 gap-1 p-2 bg-stone-900 text-[9px] sm:text-[10px] font-bold text-stone-400 border-b border-stone-800 text-center"><div>KADAR</div><div>MODAL</div><div>JUAL</div><div>BUYBACK</div></div>
                  {Object.keys(KADAR_FORMULA).map(k => (
                     <div key={k} className="grid grid-cols-4 gap-1 p-2 border-b border-stone-800 text-[10px] sm:text-xs items-center text-center"><div className="font-bold text-amber-500">{k} <span className="text-[9px] text-stone-500 block">{(KADAR_FORMULA[k].factoryCostRate*100).toFixed(0)}%</span></div><div className="text-stone-300">{formatRp(currentPrices[k].cost)}</div><div className="font-bold text-green-400">{formatRp(currentPrices[k].sell)}</div><div className="font-bold text-red-400">{formatRp(currentPrices[k].buyback)}</div></div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
               <div className="bg-stone-100 p-4 flex justify-between items-center border-b border-stone-200"><h2 className="font-bold text-stone-900 flex items-center gap-2"><Store size={20} className="text-amber-600"/> Info Toko</h2>{isEditingStore ? <button onClick={saveStoreSettings} className="bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-600 flex items-center gap-1 transition-colors"><Save size={14}/> Simpan</button> : <button onClick={() => {setTempStoreSettings(storeSettings); setIsEditingStore(true);}} className="bg-white text-stone-600 border px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-stone-50 flex items-center gap-1 transition-colors"><Edit3 size={14}/> Edit</button>}</div>
              <div className="p-4 sm:p-6 space-y-4 text-sm">
                <div><label className="font-bold text-stone-600 block mb-1">WA Order</label>{isEditingStore ? <input type="text" value={tempStoreSettings.waNumber} onChange={(e) => setTempStoreSettings({...tempStoreSettings, waNumber: e.target.value})} className="w-full p-2 border rounded-lg outline-none bg-stone-50" /> : <div className="font-medium bg-stone-50 p-2 rounded-lg">{storeSettings.waNumber}</div>}</div>
                <div><label className="font-bold text-stone-600 block mb-1">Alamat Toko</label>{isEditingStore ? <textarea value={tempStoreSettings.address} onChange={(e) => setTempStoreSettings({...tempStoreSettings, address: e.target.value})} rows="2" className="w-full p-2 border rounded-lg outline-none bg-stone-50 resize-none" /> : <div className="font-medium bg-stone-50 p-2 rounded-lg">{storeSettings.address}</div>}</div>
                <div className="pt-4 border-t border-stone-100 grid grid-cols-2 gap-4">
                   <div><label className="font-bold text-stone-600 block mb-1">User Admin</label>{isEditingStore ? <input type="text" value={tempStoreSettings.adminUser} onChange={(e) => setTempStoreSettings({...tempStoreSettings, adminUser: e.target.value})} className="w-full p-2 border rounded-lg outline-none bg-stone-50" /> : <div className="font-bold text-blue-600 bg-stone-50 p-2 rounded-lg">{storeSettings.adminUser}</div>}</div>
                   <div><label className="font-bold text-stone-600 block mb-1">Pass Admin</label>{isEditingStore ? <input type="text" value={tempStoreSettings.adminPass} onChange={(e) => setTempStoreSettings({...tempStoreSettings, adminPass: e.target.value})} className="w-full p-2 border rounded-lg outline-none bg-stone-50" /> : <div className="font-medium text-stone-400 bg-stone-50 p-2 rounded-lg">********</div>}</div>
                </div>
              </div>
            </div>

            <div className={`rounded-2xl shadow-sm border p-6 transition-colors duration-300 ${editingProductId ? 'bg-blue-50 border-blue-200' : 'bg-white border-stone-200'}`}>
              <div className="flex justify-between items-center mb-4"><h2 className={`font-bold flex items-center gap-2 ${editingProductId ? 'text-blue-800' : 'text-stone-900'}`}>{editingProductId ? <><Edit3 size={18}/> Edit Barang</> : <><Plus size={18} className="text-amber-600"/> Tambah Barang</>}</h2>{editingProductId && <button onClick={handleCancelEdit} className="text-xs font-bold text-stone-500 bg-white px-2 py-1 rounded shadow-sm border hover:bg-stone-50">Batal</button>}</div>
              <form onSubmit={handleSaveProduct} className="space-y-3 text-sm">
                <div><label className="font-bold text-stone-600 flex justify-between mb-1"><span>Kode Live</span>{!editingProductId && <span onClick={() => setNewProduct({...newProduct, code: generateCode()})} className="text-[10px] text-amber-600 cursor-pointer bg-amber-50 px-2 py-0.5 rounded-full">Acak Baru</span>}</label><input type="text" value={newProduct.code} onChange={e => setNewProduct({...newProduct, code: e.target.value.toUpperCase()})} className="w-full p-2 border rounded-lg uppercase font-bold outline-none text-amber-700" required/></div>
                <div><label className="font-bold text-stone-600 block mb-1">Nama</label><input type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-2 border rounded-lg outline-none" required/></div>
                <div className="grid grid-cols-2 gap-2"><div><label className="font-bold text-stone-600 block mb-1">Berat(g)</label><input type="number" step="0.01" value={newProduct.weight} onChange={e => setNewProduct({...newProduct, weight: e.target.value})} className="w-full p-2 border rounded-lg outline-none" required/></div><div><label className="font-bold text-stone-600 block mb-1">Kadar</label><select value={newProduct.kadar} onChange={e => setNewProduct({...newProduct, kadar: e.target.value})} className="w-full p-2 border rounded-lg font-bold outline-none">{Object.keys(KADAR_FORMULA).map(k => <option key={k} value={k}>{k}</option>)}</select></div></div>
                <div><label className="font-bold text-stone-600 block mb-1">Deskripsi</label><textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full p-2 border rounded-lg outline-none resize-none" rows="2" /></div>
                <div><label className="font-bold text-stone-600 block mb-1">URL Foto (Opsional)</label><input type="url" value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} className="w-full p-2 border rounded-lg outline-none"/></div>
                <button type="submit" className={`w-full text-white font-bold py-3 rounded-lg mt-4 ${editingProductId ? 'bg-blue-600' : 'bg-stone-900'}`}>{editingProductId ? 'Simpan Edit' : 'Simpan Etalase'}</button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-7 h-fit space-y-6">
             <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#25D366]"></div>
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-stone-100"><ShoppingCart className="text-[#25D366]" size={24}/><h2 className="font-bold text-xl text-stone-900">Pesanan Masuk</h2><span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{orders.filter(o => o.status === 'Menunggu').length} Baru</span></div>
                {orders.length === 0 ? <p className="text-stone-500 text-sm text-center py-8">Belum ada pesanan masuk.</p> : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {orders.map(order => (
                       <div key={order.id} className={`border rounded-xl p-4 ${order.status === 'Menunggu' ? 'border-[#25D366] bg-[#25D366]/5' : 'bg-stone-50'}`}>
                          <div className="flex justify-between items-start mb-3">
                             <div>
                               <h3 className="font-bold flex items-center gap-1"><User size={14}/> {order.customer.name}</h3>
                               <p className="text-xs font-medium flex items-center gap-2 mt-1"><Phone size={12}/> {order.customer.phone} <a href={getWaLink(order.customer.phone)} target="_blank" rel="noreferrer" className="bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1"><Send size={10}/> Cek WA</a></p>
                               <p className="text-xs text-stone-500 mt-0.5">{order.customer.address}</p>
                             </div>
                             <div className="text-right">
                               <span className={`text-[10px] font-bold px-2 py-1 rounded shadow-sm ${order.status === 'Menunggu' ? 'bg-amber-500 text-white' : order.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-stone-200'}`}>{order.status}</span>
                               <p className="text-[10px] text-stone-400 mt-1">{order.date}</p><p className="text-[11px] font-bold mt-1">{order.id}</p>
                             </div>
                          </div>
                          <div className="bg-white p-3 rounded-lg border text-xs space-y-2 mb-3">
                            {order.items.map(item => <div key={item.id} className="flex justify-between"><span className="font-medium">[{item.code}] {item.name}</span><span>{item.weight}g</span></div>)}
                            <div className="font-bold pt-2 border-t flex justify-between text-sm"><span>Total:</span><span className="text-amber-600">{formatRp(order.total)}</span></div>
                          </div>
                          <div className="flex gap-2">
                             {order.status === 'Menunggu' ? (
                               <><button onClick={() => handleConfirmOrder(order.id)} className="flex-1 bg-[#25D366] text-white py-2 rounded-lg text-xs font-bold"><CheckCircle size={14} className="inline"/> Selesai</button><button onClick={() => handleCancelOrder(order.id)} className="flex-1 bg-red-500 text-white py-2 rounded-lg text-xs font-bold"><XCircle size={14} className="inline"/> Batal (Balik Stok)</button></>
                             ) : <button disabled className="flex-1 bg-stone-200 text-stone-400 py-2 rounded-lg text-xs font-bold">Sudah {order.status}</button>}
                          </div>
                       </div>
                    ))}
                  </div>
                )}
             </div>

             <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-stone-100"><Users className="text-blue-500" size={24}/><h2 className="font-bold text-xl text-stone-900">Pelanggan</h2><span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{usersDB.length} Terdaftar</span></div>
                {usersDB.length === 0 ? <p className="text-stone-500 text-sm text-center py-8">Kosong.</p> : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {usersDB.map(user => {
                       const userOrders = orders.filter(o => o.customer.phone === user.phone);
                       const isExpanded = expandedUserPhone === user.phone;
                       return (
                         <div key={user.phone} className={`border rounded-xl p-4 ${user.isBlocked ? 'border-red-200 bg-red-50' : 'bg-stone-50'}`}>
                            <div className="flex justify-between items-start mb-2">
                               <div><h3 className="font-bold flex items-center gap-1">{user.isBlocked && <UserX size={16} className="text-red-500"/>}{user.name}</h3><p className="text-xs flex items-center gap-1 mt-1"><Phone size={12}/> {user.phone}</p></div>
                               <button onClick={() => toggleBlockUser(user.phone)} className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white ${user.isBlocked ? 'bg-green-500' : 'bg-stone-800'}`}>{user.isBlocked ? 'Buka Blokir' : 'Blokir'}</button>
                            </div>
                            <p className="text-xs text-stone-500 line-clamp-2 mb-3">{user.address}</p>
                            <div className="border-t pt-3 flex justify-between items-center">
                               <span className="text-xs font-bold flex items-center gap-1"><Receipt size={14}/> Pesanan: {userOrders.length}</span>
                               <button onClick={() => setExpandedUserPhone(isExpanded ? null : user.phone)} className="text-xs font-bold text-amber-600">{isExpanded ? 'Tutup Detail' : 'Lihat Detail'}</button>
                            </div>
                            {isExpanded && (
                               <div className="mt-3 space-y-2">
                                  {userOrders.length === 0 ? <p className="text-[10px] text-stone-400 italic">Belum ada.</p> : userOrders.map(o => (
                                       <div key={o.id} className="bg-white p-3 rounded-lg border text-[10px]">
                                         <div className="flex justify-between font-bold mb-1.5 pb-1 border-b"><span>{o.date}</span><span className={o.status === 'Dibatalkan' ? 'text-red-500' : o.status === 'Selesai' ? 'text-green-500' : 'text-amber-500'}>{o.status}</span></div>
                                         <div className="text-stone-600 mb-2">{o.items.map(i => i.name).join(', ')}</div>
                                         <div className="font-bold text-right text-xs">Total: {formatRp(o.total)}</div>
                                       </div>
                                  ))}
                               </div>
                            )}
                         </div>
                       )
                    })}
                  </div>
                )}
             </div>

             <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
               <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-4 border-b border-stone-100 pb-4 gap-3">
                 <div><h2 className="font-bold text-xl text-stone-900">Etalase ({products.length})</h2></div>
                 <button onClick={() => setView('catalog')} className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1"><Search size={16}/> Lihat Etalase</button>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {products.map(p => {
                   const isBeingEdited = p.id === editingProductId;
                   const retailPrice = currentPrices[p.kadar].sell * p.weight;
                   return (
                     <div key={p.id} className={`flex flex-col border rounded-2xl overflow-hidden ${isBeingEdited ? 'border-blue-400 bg-blue-50' : 'bg-stone-50'}`}>
                        <div className="flex p-3 gap-3">
                          <div className="w-20 h-20 bg-stone-200 rounded-xl overflow-hidden shrink-0 relative">{p.imageUrl ? <img src={p.imageUrl} className={`w-full h-full object-cover ${p.isSold ? 'grayscale opacity-60' : ''}`} /> : <Gem className="m-auto mt-6 text-stone-400" size={24}/>}{p.isSold && <div className="absolute inset-0 flex items-center justify-center bg-stone-900/20"><Lock size={20} className="text-white drop-shadow-md"/></div>}</div>
                          <div className="flex-grow">
                            <div className="flex justify-between items-start">
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold shadow-sm ${p.isSold ? 'bg-red-600 text-white' : 'bg-stone-900 text-white'}`}>{p.isSold ? 'TERJUAL' : p.code}</span>
                              <div className="flex gap-1">
                                <button onClick={() => toggleProductStatus(p.id)} className={`p-1.5 rounded-lg ${p.isSold ? 'text-green-600 bg-green-100' : 'text-stone-600 bg-stone-200'}`}>{p.isSold ? <RefreshCw size={14}/> : <Lock size={14}/>}</button>
                                <button onClick={() => handleEditProductClick(p)} className="p-1.5 text-amber-600 bg-amber-100 rounded-lg"><Edit3 size={14}/></button>
                                <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 text-red-600 bg-red-100 rounded-lg"><Trash2 size={14}/></button>
                              </div>
                            </div>
                            <h4 className="font-bold text-sm mt-2 leading-tight line-clamp-2">{p.name}</h4>
                          </div>
                        </div>
                        <div className="p-3 flex justify-between items-center border-t bg-white">
                           <div className="text-[11px] font-bold flex items-center gap-1"><span className="text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">{p.kadar}</span><span>{p.weight}g</span></div>
                           <div className="font-bold text-sm text-green-600">{formatRp(retailPrice)}</div>
                        </div>
                     </div>
                   );
                 })}
               </div>
             </div>
          </div>
        </main>
      </div>
    );
  }

  // --- TAMPILAN PEMBELI ---
  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans pb-24">
      <nav className="bg-white border-b border-stone-200 sticky top-0 z-50 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => {setView('home'); setSearchQuery('');}}>
          <img src="/logo-sa.png" alt="Logo" className="w-10 h-10 object-contain rounded-lg drop-shadow-sm" onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=SA&background=1c1917&color=FFCBA4&rounded=lg&bold=true"; }} />
          <span className="font-serif font-bold text-xl tracking-tight">Sri Ayu</span>
        </div>
        <div className="hidden sm:flex gap-4 items-center">
           <button onClick={() => setView('home')} className={`font-bold text-sm px-4 py-2 rounded-lg ${view === 'home' ? 'bg-amber-100 text-amber-800' : 'text-stone-500'}`}>Beranda</button>
           <button onClick={() => setView('catalog')} className={`font-bold text-sm px-4 py-2 rounded-lg ${view === 'catalog' ? 'bg-amber-100 text-amber-800' : 'text-stone-500'}`}>Katalog Emas</button>
           <div className="w-px h-6 bg-stone-200 mx-2"></div>
           <button onClick={() => setView(loggedInUser ? 'profile' : 'login')} className={`font-bold text-sm px-4 py-2 rounded-lg flex items-center gap-2 ${view === 'profile' || view === 'login' || view === 'signup' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'}`}>
             {loggedInUser ? <><User size={16}/> {loggedInUser.name.split(' ')[0]}</> : <><LogIn size={16}/> Login</>}
           </button>
        </div>
      </nav>

      <main className="p-0 sm:p-4 max-w-5xl mx-auto">
        {view === 'home' && (
          <div className="animate-in fade-in bg-white sm:rounded-3xl shadow-sm sm:border overflow-hidden pb-8">
            <div className="relative w-full h-[350px] sm:h-[450px] bg-stone-100 overflow-hidden group">
              {heroProducts.map((prod, index) => {
                const isActive = index === currentSlide;
                return (
                  <div key={prod.id} onClick={() => goToProduct(prod.code)} className={`absolute inset-0 transition-opacity duration-1000 cursor-pointer ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                    <div className={`absolute inset-0 bg-stone-100 ${prod.isSold ? 'grayscale' : ''}`}><img src={prod.imageUrl || "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1200&q=80"} className="w-full h-full object-cover scale-105" /></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-transparent"></div>
                    {prod.isSold && <div className="absolute top-6 right-6 z-20"><span className="bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg shadow-lg text-xs">TERJUAL</span></div>}
                    <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 flex justify-between gap-4 items-end">
                      <div>
                        <span className="inline-block bg-amber-500 text-stone-900 text-[10px] font-bold px-2 py-1 rounded mb-3">✨ TERKINI</span>
                        <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-2">{prod.name}</h2>
                        <p className="text-stone-300 text-sm">{prod.kadar} • {prod.weight} gram | {prod.category}</p>
                      </div>
                      <div className="bg-stone-900/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl text-right">
                        <p className="text-[10px] text-stone-300 font-bold mb-1">Harga Saat</p>
                        <p className="text-2xl sm:text-3xl font-bold text-amber-400">{formatRp(prod.weight * currentPrices[prod.kadar].sell)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">{heroProducts.map((_, i) => <button key={i} onClick={(e) => { e.stopPropagation(); setCurrentSlide(i); }} className={`h-2 rounded-full ${i === currentSlide ? 'bg-amber-500 w-8' : 'bg-white/50 w-2'}`}/>)}</div>
            </div>

            <div className="mt-8 px-4 sm:px-8">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Gem className="text-amber-500" size={20}/> Etalase Baru</h2>
              <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory hide-scrollbar">
                {latestProducts.map(product => (
                    <div key={product.id} onClick={() => goToProduct(product.code)} className={`min-w-[80%] sm:min-w-[300px] bg-stone-50 rounded-2xl border overflow-hidden shrink-0 snap-center cursor-pointer group ${product.isSold ? 'opacity-70 grayscale' : ''}`}>
                      <div className="h-48 relative overflow-hidden bg-stone-200">
                        {product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <div className="w-full h-full flex items-center justify-center"><Gem size={40}/></div>}
                        <div className={`absolute top-3 right-3 text-white px-3 py-1 rounded-lg text-[10px] font-bold ${product.isSold ? 'bg-red-600' : 'bg-amber-500 text-stone-900'}`}>{product.isSold ? 'Terjual' : 'New'}</div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-base mb-1 truncate">{product.name}</h3>
                        <div className="flex justify-between items-center mt-2">
                           <span className="text-[11px] font-bold text-stone-500 bg-stone-200 px-2 py-0.5 rounded">{product.kadar} • {product.weight}g</span>
                           <span className="font-bold text-amber-600">{formatRp(product.weight * currentPrices[product.kadar].sell)}</span>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'catalog' && (
          <div className="animate-in fade-in pt-4 sm:pt-0 px-4 sm:px-0">
            <div className="mb-6 relative"><Search className="absolute left-4 top-4 text-stone-400" size={20} /><input type="text" placeholder="Cari Barang..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white border rounded-2xl outline-none font-bold" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map(product => (
                <div key={product.id} className={`bg-white rounded-3xl border flex flex-col group relative ${product.isSold ? 'opacity-70 grayscale' : 'hover:shadow-lg'}`}>
                  {product.isSold && <div className="absolute inset-0 z-20 flex items-center justify-center"><div className="bg-red-600 text-white font-bold px-6 py-2 rounded-xl -rotate-12 text-xl border-4">TERJUAL</div></div>}
                  <div className="relative h-64 shrink-0 overflow-hidden bg-stone-100">
                    <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute top-3 left-3 bg-stone-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold">{product.code}</div>
                    <div className="absolute top-3 right-3 bg-amber-500 text-stone-900 px-3 py-1.5 rounded-lg text-xs font-bold">{product.kadar}</div>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg mb-1 leading-tight">{product.name}</h3>
                    <div className="mt-auto bg-stone-50 rounded-xl p-3 border">
                       <div className="flex justify-between items-center mb-1"><span className="text-[10px] text-stone-400 uppercase font-bold">Berat</span><span className="font-bold text-sm text-stone-700">{product.weight} gram</span></div>
                       <div className="flex justify-between items-center mb-3"><span className="text-[10px] text-stone-400 uppercase font-bold">Harga</span><span className="font-bold text-lg text-amber-600">{formatRp(product.weight * currentPrices[product.kadar].sell)}</span></div>
                       <button onClick={() => addToCart(product)} disabled={product.isSold} className={`w-full font-bold py-3 rounded-lg flex justify-center gap-2 ${product.isSold ? 'bg-stone-300 text-stone-500' : 'bg-stone-900 text-white'}`}>{product.isSold ? <><XCircle size={18}/> Habis</> : <><Plus size={18}/> Beli</>}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'cart' && (
           <div className="animate-in slide-in-from-right pt-4 px-4 sm:px-0">
             <h2 className="text-3xl font-serif font-bold mb-8">Keranjang Anda</h2>
             {cart.length === 0 ? <p className="text-center">Kosong</p> : (
               <div className="flex flex-col lg:flex-row gap-8">
                 <div className="lg:w-2/3 space-y-4">
                   {cart.map(item => (
                     <div key={item.id} className="bg-white p-4 rounded-3xl flex items-center gap-4 border shadow-sm">
                       <img src={item.imageUrl} className="w-20 h-20 rounded-2xl object-cover shrink-0"/>
                       <div className="flex-grow"><h4 className="font-bold">{item.name}</h4><p className="text-amber-600 font-bold">{formatRp(item.weight * currentPrices[item.kadar].sell)}</p></div>
                       <button onClick={() => removeFromCart(item.id)} className="p-2 text-red-500"><Trash2 size={18}/></button>
                     </div>
                   ))}
                 </div>
                 <div className="lg:w-1/3">
                    <div className="bg-white p-6 rounded-3xl border shadow-xl">
                      <h3 className="font-bold mb-4">Pengiriman</h3>
                      <div className="space-y-4 mb-6">
                        <input type="text" placeholder="Nama Sesuai KTP" value={customer.name} onChange={(e) => setCustomer({...customer, name: e.target.value})} className="w-full p-3 bg-stone-50 border rounded-xl" required />
                        <input type="tel" placeholder="WA Aktif" value={customer.phone} onChange={(e) => setCustomer({...customer, phone: e.target.value})} className="w-full p-3 bg-stone-50 border rounded-xl" required />
                        <textarea placeholder="Alamat Lengkap" value={customer.address} onChange={(e) => setCustomer({...customer, address: e.target.value})} className="w-full p-4 bg-stone-50 border rounded-xl resize-none" rows="3" required />
                      </div>
                      <div className="bg-amber-50 p-4 rounded-xl mb-6 font-bold flex justify-between"><span>Total</span><span className="text-amber-700">{formatRp(subtotal)}</span></div>
                      <button onClick={handleProceedToInvoice} className="w-full bg-[#25D366] text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2">Lanjut Invoice <ChevronRight size={20}/></button>
                    </div>
                 </div>
               </div>
             )}
           </div>
        )}

        {view === 'login' && (
          <div className="flex justify-center py-10 px-4">
            <div className="bg-white max-w-md w-full rounded-3xl p-8 border text-center">
              <LogIn size={40} className="mx-auto text-amber-500 mb-4"/>
              <h2 className="text-2xl font-bold mb-6">Login Pelanggan</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <input type="tel" value={authForm.phone} onChange={e => setAuthForm({...authForm, phone: e.target.value})} className="w-full p-3 bg-stone-50 border rounded-xl text-center" placeholder="No WhatsApp" required />
                <input type="password" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className="w-full p-3 bg-stone-50 border rounded-xl text-center" placeholder="Password" required />
                <button type="submit" className="w-full bg-stone-900 text-white font-bold py-3 rounded-xl mt-2">Masuk</button>
              </form>
              <p className="mt-6 text-sm">Belum punya akun? <button onClick={() => setView('signup')} className="font-bold text-amber-600">Daftar</button></p>
            </div>
          </div>
        )}

        {view === 'signup' && (
          <div className="flex justify-center py-10 px-4">
            <div className="bg-white max-w-md w-full rounded-3xl p-8 border text-center">
              <UserPlus size={40} className="mx-auto text-amber-500 mb-4"/>
              <h2 className="text-2xl font-bold mb-6">Daftar Akun Baru</h2>
              <form onSubmit={handleSignup} className="space-y-4">
                <input type="text" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} className="w-full p-3 bg-stone-50 border rounded-xl" placeholder="Nama Lengkap" required />
                <input type="tel" value={authForm.phone} onChange={e => setAuthForm({...authForm, phone: e.target.value})} className="w-full p-3 bg-stone-50 border rounded-xl" placeholder="Nomor WhatsApp" required />
                <textarea value={authForm.address} onChange={e => setAuthForm({...authForm, address: e.target.value})} className="w-full p-3 bg-stone-50 border rounded-xl" placeholder="Alamat Lengkap" rows="2" required />
                <input type="password" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className="w-full p-3 bg-stone-50 border rounded-xl" placeholder="Password (Min 6 Karakter)" required minLength="6" />
                <button type="submit" className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl mt-2">Daftar Sekarang</button>
              </form>
              <p className="mt-6 text-sm">Sudah punya akun? <button onClick={() => setView('login')} className="font-bold text-stone-900">Login</button></p>
            </div>
          </div>
        )}

        {view === 'profile' && loggedInUser && (
          <div className="flex flex-col lg:flex-row gap-8 py-6 px-4 sm:px-0">
            <div className="lg:w-1/3">
              <div className="bg-white p-6 rounded-3xl border text-center">
                 <User size={60} className="mx-auto text-amber-600 bg-amber-50 p-3 rounded-full mb-4"/>
                 <h2 className="text-xl font-bold">{loggedInUser.name}</h2>
                 <p className="text-sm text-stone-500 mb-6">{loggedInUser.phone}</p>
                 <div className="bg-stone-50 p-4 rounded-xl text-left border mb-6"><p className="text-[10px] font-bold text-stone-400 mb-1">ALAMAT</p><p className="text-sm">{loggedInUser.address}</p></div>
                 <button onClick={handleLogout} className="w-full font-bold text-red-500 bg-red-50 py-3 rounded-xl">Keluar Akun</button>
              </div>
            </div>
            <div className="lg:w-2/3">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><Receipt className="text-amber-500"/> Riwayat Pesanan</h3>
              {(() => {
                const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
                const myOrders = orders.filter(o => o.customer.phone === loggedInUser.phone && o.status !== 'Dibatalkan' && !(o.status === 'Selesai' && o.timestamp && Date.now() - o.timestamp > thirtyDaysMs));
                if (myOrders.length === 0) return <div className="text-center py-16 bg-white rounded-3xl border border-dashed"><p>Belum ada pesanan aktif.</p></div>;
                return (
                  <div className="space-y-6">
                    {myOrders.map(order => (
                      <div key={order.id} className="bg-white p-6 rounded-3xl border shadow-sm">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b">
                          <div><p className="text-xs text-stone-500 mb-1">{order.date}</p><p className="font-bold">{order.id}</p></div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Menunggu' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{order.status}</span>
                        </div>
                        <div className="space-y-3 mb-4">
                          {order.items.map(item => <div key={item.id} className="flex items-center gap-4"><img src={item.imageUrl} className="w-12 h-12 rounded-lg object-cover"/><div><p className="font-bold text-sm">{item.name}</p><p className="text-xs text-stone-500">{item.weight}g</p></div></div>)}
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t">
                          <div><p className="text-[10px] text-stone-400 font-bold mb-1">TOTAL</p><p className="font-bold text-amber-600 text-lg">{formatRp(order.total)}</p></div>
                          {order.status === 'Menunggu' && <button onClick={() => handleCustomerCancelOrder(order.id)} className="text-xs font-bold text-red-500 bg-red-50 px-4 py-2 rounded-lg">Batalkan</button>}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {view === 'invoice' && (
          <div className="animate-in zoom-in-95 px-2 sm:px-0">
            <div className="mb-6 bg-white p-4 rounded-2xl border"><button onClick={() => setView('cart')} className="flex items-center gap-2 font-bold"><ArrowLeft size={18}/> Kembali Edit</button></div>
            <div className="bg-white rounded-3xl border overflow-hidden max-w-3xl mx-auto">
              <div className="bg-stone-900 text-white p-8 flex justify-between items-center border-b-[6px] border-amber-500">
                <div><h1 className="text-3xl font-serif font-bold text-amber-400">Toko Mas Sri Ayu</h1><p className="text-sm text-stone-300">{storeSettings.address}</p></div>
                <div className="text-right"><div className="text-2xl font-bold opacity-80">INVOICE</div><p className="text-amber-400 font-bold">{invoiceNumber}</p></div>
              </div>
              <div className="p-8 border-b bg-stone-50 flex justify-between">
                <div><p className="text-xs font-bold text-stone-400 mb-1">Kepada:</p><h3 className="font-bold text-lg">{customer.name}</h3><p className="text-sm">{customer.phone}</p><p className="text-sm">{customer.address}</p></div>
                <div className="text-right"><p className="text-xs font-bold text-stone-400 mb-1">Tanggal:</p><p className="font-bold">{invoiceDate}</p></div>
              </div>
              <div className="p-8">
                <div className="space-y-4">
                  {cart.map((item, i) => (
                    <div key={i} className="flex justify-between items-center pb-4 border-b last:border-0">
                      <div className="flex items-center gap-4"><img src={item.imageUrl} className="w-12 h-12 rounded-lg object-cover" /><div><p className="font-bold">{item.name}</p><p className="text-xs text-stone-500">{item.weight}g ({item.kadar})</p></div></div>
                      <span className="font-bold">{formatRp(item.weight * currentPrices[item.kadar].sell)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-stone-50 p-8 flex justify-between border-t items-center">
                <div className="text-xs text-stone-600 max-w-xs"><Shield size={20} className="text-amber-500 mb-2"/>Garansi buyback potong {buybackDeduction}% dari nota.</div>
                <div className="text-right"><span className="text-sm font-bold text-stone-500">TOTAL</span><div className="text-3xl font-bold text-amber-600">{formatRp(subtotal)}</div></div>
              </div>
            </div>
            <div className="mt-8 mb-4 text-center">
                <div className="bg-amber-50 p-4 rounded-2xl mb-6 inline-block text-left text-sm border border-amber-200"><p className="font-bold text-amber-900">📸 Penting: Screenshot Invoice</p><p className="text-amber-800">Sistem otomatis menolak kirim gambar. Mohon screenshot halaman ini sebelum menekan tombol di bawah.</p></div>
                <button onClick={handleSendToWA} className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#25D366] text-white font-bold px-12 py-4 rounded-2xl text-lg"><Send size={24}/> Konfirmasi ke WhatsApp</button>
            </div>
          </div>
        )}

        {(view === 'home' || view === 'catalog') && (
          <div className="mt-20 mb-8 text-center border-t pt-8 px-4 sm:px-0">
            <p className="text-xs text-stone-400">© {new Date().getFullYear()} Toko Emas Sri Ayu.</p>
            <span className="cursor-pointer text-[10px] text-stone-200 mt-4 flex justify-center" onClick={() => {setView('adminLogin'); window.scrollTo(0,0);}}><Lock size={10}/> Admin</span>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 inset-x-0 bg-white border-t px-2 py-3 flex justify-around z-50 sm:hidden">
        <button onClick={() => {setView('home'); window.scrollTo(0,0);}} className={`flex flex-col items-center ${view === 'home' ? 'text-amber-600' : 'text-stone-400'}`}><Home size={22} /><span className="text-[10px] font-bold mt-1">Beranda</span></button>
        <button onClick={() => {setView('catalog'); window.scrollTo(0,0);}} className={`flex flex-col items-center ${view === 'catalog' ? 'text-amber-600' : 'text-stone-400'}`}><Gem size={22} /><span className="text-[10px] font-bold mt-1">Katalog</span></button>
        <button onClick={() => {setView('cart'); window.scrollTo(0,0);}} className={`flex flex-col items-center relative ${view === 'cart' || view === 'invoice' ? 'text-amber-600' : 'text-stone-400'}`}><ShoppingCart size={22} />{cart.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{cart.length}</span>}<span className="text-[10px] font-bold mt-1">Keranjang</span></button>
        <button onClick={() => {setView(loggedInUser ? 'profile' : 'login'); window.scrollTo(0,0);}} className={`flex flex-col items-center ${view === 'profile' || view === 'login' || view === 'signup' ? 'text-amber-600' : 'text-stone-400'}`}><User size={22} /><span className="text-[10px] font-bold mt-1">Profil</span></button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}} />
    </div>
  );
}
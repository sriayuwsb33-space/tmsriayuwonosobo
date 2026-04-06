import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

// 🔥 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCMhxO5hlxUBpZDuPa4PQkJ4EkIFfzxqf8",
  authDomain: "toko-mas-sri-ayu.firebaseapp.com",
  projectId: "toko-mas-sri-ayu",
  storageBucket: "toko-mas-sri-ayu.firebasestorage.app",
  messagingSenderId: "195511507670",
  appId: "1:195511507670:web:7c373950b65995d8f00777",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================= APP =================
export default function App() {
  const [page, setPage] = useState("shop");

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar setPage={setPage} />
      {page === "shop" ? <Shop /> : <Admin />}
    </div>
  );
}

// ================= NAVBAR =================
function Navbar({ setPage }) {
  return (
    <div className="flex justify-between items-center px-8 py-4 border-b">
      <h1 className="text-xl font-semibold tracking-wide">
        TOKO MAS SRI AYU
      </h1>
      <div className="flex gap-6 text-sm">
        <button onClick={() => setPage("shop")}>Shop</button>
        <button onClick={() => setPage("admin")}>Admin</button>
      </div>
    </div>
  );
}

// ================= SHOP =================
function Shop() {
  const [products, setProducts] = useState([]);
  const [goldPrice] = useState(2700000);

  const rates = {
    "6K": { percent: 0.25, margin: 0.15 },
    "8K": { percent: 0.33, margin: 0.15 },
    "9K": { percent: 0.375, margin: 0.15 },
  };

  const calcPrice = (w, k) => {
    const r = rates[k];
    const base = goldPrice * r.percent * w;
    return Math.round(base + base * r.margin + 100000);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    let data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (data.length === 0) {
      const sample = [
        { name: "Cincin Elegan", weight: 3, karat: "6K" },
        { name: "Cincin Premium", weight: 4, karat: "8K" },
        { name: "Gelang Mewah", weight: 5, karat: "8K" },
        { name: "Kalung Cantik", weight: 6, karat: "9K" },
        { name: "Anting Minimalis", weight: 2, karat: "6K" },
        { name: "Liontin Love", weight: 3, karat: "6K" },
        { name: "Gelang Simple", weight: 4, karat: "6K" },
        { name: "Kalung Premium", weight: 7, karat: "9K" },
        { name: "Anting Korea", weight: 2, karat: "6K" },
        { name: "Cincin Nikah", weight: 5, karat: "8K" },
      ];

      for (let p of sample) {
        await addDoc(collection(db, "products"), p);
      }
      data = sample;
    }

    setProducts(data);
  };

  const handleBuy = async (p) => {
    const price = calcPrice(p.weight, p.karat);

    await addDoc(collection(db, "orders"), {
      productName: p.name,
      price,
      status: "pending",
      createdAt: Date.now(),
    });

    const wa = `https://wa.me/6282299081829?text=Halo kak, saya mau pesan:%0A${p.name}%0AHarga: ${price}`;
    window.open(wa, "_blank");
  };

  return (
    <div className="px-8 py-10">
      {/* HERO */}
      <div className="mb-10">
        <h2 className="text-4xl font-light mb-2">
          Luxury Gold Collection
        </h2>
        <p className="text-gray-500">
          Emas Berkualitas, Harga Bersahabat
        </p>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-8">
        {products.map((p) => {
          const price = calcPrice(p.weight, p.karat);

          return (
            <div
              key={p.id}
              className="group border rounded-xl overflow-hidden hover:shadow-xl transition"
            >
              {/* IMAGE */}
              <div className="h-60 bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-sm">
                  FOTO PRODUK
                </span>
              </div>

              {/* INFO */}
              <div className="p-4">
                <p className="text-sm text-gray-400">
                  {p.karat} • {p.weight}g
                </p>

                <h3 className="font-medium">{p.name}</h3>

                <p className="mt-2 font-semibold">
                  Rp {price.toLocaleString()}
                </p>

                <button
                  onClick={() => handleBuy(p)}
                  className="mt-4 w-full bg-black text-white py-2 rounded hover:bg-gray-800"
                >
                  Beli Sekarang
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ================= ADMIN =================
function Admin() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  const loadProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const loadOrders = async () => {
    const snap = await getDocs(collection(db, "orders"));
    setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const addProduct = async (name, weight, karat) => {
    await addDoc(collection(db, "products"), { name, weight, karat });
    loadProducts();
  };

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "orders", id), { status });
    loadOrders();
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl mb-4">Admin Panel</h2>

      <AddProduct onAdd={addProduct} />

      <h3 className="mt-8 mb-2">Produk</h3>
      {products.map((p) => (
        <div key={p.id} className="border p-2 mb-2">
          {p.name} - {p.karat} - {p.weight}g
        </div>
      ))}

      <h3 className="mt-8 mb-2">Orders</h3>
      {orders.map((o) => (
        <div key={o.id} className="border p-2 mb-2">
          {o.productName} - {o.status}
          <div className="mt-2">
            <button
              onClick={() => updateStatus(o.id, "proses")}
              className="bg-yellow-500 px-2 mr-2"
            >
              Proses
            </button>
            <button
              onClick={() => updateStatus(o.id, "selesai")}
              className="bg-green-500 px-2"
            >
              Selesai
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ================= ADD PRODUCT =================
function AddProduct({ onAdd }) {
  const [name, setName] = useState("");
  const [weight, setWeight] = useState(0);
  const [karat, setKarat] = useState("6K");

  return (
    <div className="flex gap-2">
      <input
        placeholder="Nama"
        onChange={(e) => setName(e.target.value)}
        className="border px-2"
      />
      <input
        type="number"
        placeholder="Berat"
        onChange={(e) => setWeight(Number(e.target.value))}
        className="border px-2"
      />
      <select
        onChange={(e) => setKarat(e.target.value)}
        className="border px-2"
      >
        <option>6K</option>
        <option>8K</option>
        <option>9K</option>
      </select>
      <button
        onClick={() => onAdd(name, weight, karat)}
        className="bg-black text-white px-3"
      >
        Tambah
      </button>
    </div>
  );
}

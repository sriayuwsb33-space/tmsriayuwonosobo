import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
getFirestore,
collection,
addDoc,
getDocs,
updateDoc,
doc
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

export default function App() {
const [page, setPage] = useState("shop");

return ( <div className="p-4"> <div className="flex gap-4 mb-6">
<button onClick={() => setPage("shop")} className="bg-black text-white px-3 py-1">Shop</button>
<button onClick={() => setPage("admin")} className="bg-gray-700 text-white px-3 py-1">Admin</button> </div>

```
  {page === "shop" ? <Shop /> : <Admin />}
</div>
```

);
}

// ================= SHOP =================
function Shop() {
const [products, setProducts] = useState([]);

useEffect(() => {
loadProducts();
}, []);

const loadProducts = async () => {
const snapshot = await getDocs(collection(db, "products"));
setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
};

const handleBuy = async (product) => {
const order = {
productName: product.name,
price: product.price,
status: "pending",
createdAt: Date.now(),
source: "website"
};

```
await addDoc(collection(db, "orders"), order);

const wa = `https://wa.me/6282299081829?text=Halo kak, saya mau pesan:\n\nProduk: ${product.name}\nHarga: ${product.price}`;
window.open(wa, "_blank");
```

};

return ( <div> <h1 className="text-xl font-bold mb-4">Toko Mas Sri Ayu</h1>

```
  <p className="text-green-600 font-semibold mb-4">
    🟢 5 orang sedang melihat produk ini
  </p>

  <div className="grid grid-cols-2 gap-4">
    {products.map(p => (
      <div key={p.id} className="border p-3 rounded">
        <span className="bg-yellow-400 text-xs px-2 py-1 rounded">
          Best Seller
        </span>

        <p className="font-semibold mt-2">{p.name}</p>

        <p className="line-through text-gray-400">
          Rp {(p.price * 1.15).toLocaleString()}
        </p>

        <p className="text-lg font-bold text-red-600">
          Rp {p.price.toLocaleString()}
        </p>

        <p className="text-red-500 text-sm">🔥 Terjual 12 hari ini</p>
        <p className="text-orange-500 text-sm">⚠️ Sisa 2 pcs</p>

        <p className="text-sm italic mt-2">
          "Sudah beli 3x, kualitas bagus banget!"
        </p>

        <button
          onClick={() => handleBuy(p)}
          className="bg-green-500 text-white px-2 py-1 mt-3 w-full"
        >
          Beli Sekarang
        </button>
      </div>
    ))}
  </div>
</div>
```

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
const snapshot = await getDocs(collection(db, "products"));
setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
};

const loadOrders = async () => {
const snapshot = await getDocs(collection(db, "orders"));
setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
};

const addProduct = async (name, price) => {
await addDoc(collection(db, "products"), { name, price });
loadProducts();
};

const updateStatus = async (id, status) => {
await updateDoc(doc(db, "orders", id), { status });
loadOrders();
};

return ( <div> <h2 className="text-lg font-bold mb-2">Admin Panel</h2>

```
  <AddProduct onAdd={addProduct} />

  <h3 className="mt-6">Produk</h3>
  {products.map(p => (
    <div key={p.id}>{p.name} - Rp {p.price}</div>
  ))}

  <h3 className="mt-6">Orders</h3>
  {orders.map(o => (
    <div key={o.id} className="border p-2 mt-2">
      <p>{o.productName}</p>
      <p>Status: {o.status}</p>
      <button onClick={() => updateStatus(o.id, "proses")} className="bg-yellow-500 px-2 mr-1">Proses</button>
      <button onClick={() => updateStatus(o.id, "selesai")} className="bg-green-500 px-2">Selesai</button>
    </div>
  ))}
</div>
```

);
}

function AddProduct({ onAdd }) {
const [name, setName] = useState("");
const [price, setPrice] = useState(0);

return ( <div className="flex gap-2">
<input placeholder="Nama" onChange={e => setName(e.target.value)} className="border" />
<input type="number" placeholder="Harga" onChange={e => setPrice(Number(e.target.value))} className="border" />
<button onClick={() => onAdd(name, price)} className="bg-blue-500 text-white px-2">Tambah</button> </div>
);
}

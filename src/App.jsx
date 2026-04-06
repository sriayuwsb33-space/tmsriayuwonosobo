import React, { useState } from "react";

export default function TokoMasSriAyu() {
const [goldPrice, setGoldPrice] = useState(2700000);

const calcPrice = (weight, karat) => {
const rate = karat === "6K" ? 0.25 : 0.33;
const base = goldPrice * rate * weight;
const ongkos = 100000;
const margin = base * 0.15;
return Math.round(base + ongkos + margin);
};

const products = [
{ name: "Cincin Elegan Sri Ayu", weight: 3, karat: "6K" },
{ name: "Gelang Mewah Sri Ayu", weight: 5, karat: "8K" },
];

return ( <div className="min-h-screen bg-white text-black">
{/* HEADER */} <header className="p-6 shadow-md flex justify-between items-center"> <h1 className="text-xl font-bold">Toko Mas Sri Ayu</h1> <a
       href="https://wa.me/6282299081829"
       className="bg-green-500 text-white px-4 py-2 rounded-xl"
     >
Chat WhatsApp </a> </header>

```
  {/* HERO */}
  <section className="p-10 text-center bg-yellow-100">
    <h2 className="text-3xl font-bold mb-4">
      Kilau Emas Terpercaya, Harga Bersahabat
    </h2>
    <p className="mb-6">
      Temukan koleksi emas terbaik dengan harga transparan
    </p>
    <button className="bg-black text-white px-6 py-3 rounded-2xl">
      Belanja Sekarang
    </button>
  </section>

  {/* ADMIN SETTING */}
  <section className="p-6">
    <h3 className="text-xl font-semibold mb-2">Admin Setting</h3>
    <input
      type="number"
      value={goldPrice}
      onChange={(e) => setGoldPrice(Number(e.target.value))}
      className="border p-2"
    />
    <p>Harga emas 24K (global)</p>
  </section>

  {/* PRODUCTS */}
  <section className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6">
    {products.map((p, i) => (
      <div key={i} className="border p-6 rounded-2xl shadow">
        <h3 className="text-lg font-bold">{p.name}</h3>
        <p>Kadar: {p.karat}</p>
        <p>Berat: {p.weight} gram</p>
        <p className="font-semibold mt-2">
          Rp {calcPrice(p.weight, p.karat).toLocaleString()}
        </p>

        <div className="flex gap-2 mt-4">
          <button className="bg-gray-200 px-3 py-2 rounded">
            Keranjang
          </button>
          <button className="bg-black text-white px-3 py-2 rounded">
            Beli
          </button>
          <a
            href={`https://wa.me/6282299081829?text=Saya tertarik ${p.name}`}
            className="bg-green-500 text-white px-3 py-2 rounded"
          >
            WA
          </a>
        </div>
      </div>
    ))}
  </section>

  {/* TESTIMONI */}
  <section className="p-10 bg-gray-100 text-center">
    <h3 className="text-xl font-bold mb-4">Testimoni</h3>
    <p>"Sudah beli 3x, selalu puas!"</p>
    <p>"Harga lebih murah dari toko lain"</p>
  </section>

  {/* FOOTER */}
  <footer className="p-6 text-center text-sm">
    Jl. Pasar 2 No 33 Wonosobo | 08.00 - 16.30
  </footer>
</div>
```

);
}

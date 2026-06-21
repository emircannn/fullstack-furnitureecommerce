"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-gray-50 text-secondary">
      <div className="max-w-md w-full p-8 bg-white border border-gray-150 rounded-3xl shadow-sm">
        <span className="text-primary font-bold text-sm tracking-wider uppercase block mb-2">
          Hata 404
        </span>
        <h1 className="text-3xl font-black mb-4">Sayfa Bulunamadı</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Aradığınız sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak kullanım dışı olabilir.
        </p>
        <Link href="/" className="inline-flex px-8 py-4 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-colors shadow-lg shadow-primary/20">
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}

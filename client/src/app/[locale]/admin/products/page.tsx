"use client";

import React from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { motion } from "framer-motion";
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { cn, getImageUrl } from "@/lib/utils";
import Image from "next/image";
import { ImageUpload } from "@/components/admin/image-upload";
import { useParams } from "next/navigation";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

interface ProductForm {
  name_tr: string; name_ru: string; name_ky: string;
  shortDesc_tr: string; shortDesc_ru: string; shortDesc_ky: string;
  description_tr: string; description_ru: string; description_ky: string;
  price: string; discountPrice: string; stockCode: string; stockQty: string;
  isPublished: boolean; categoryId: string;
  images: Array<{ path: string; isPrimary: boolean; order: number }>;
}

const emptyForm: ProductForm = {
  name_tr: "", name_ru: "", name_ky: "",
  shortDesc_tr: "", shortDesc_ru: "", shortDesc_ky: "",
  description_tr: "", description_ru: "", description_ky: "",
  price: "", discountPrice: "", stockCode: "", stockQty: "0",
  isPublished: true, categoryId: "",
  images: [],
};

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const params = useParams();
  const currentLocale = (params?.locale as string) || "tr";

  const [search, setSearch] = React.useState("");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<ProductForm>(emptyForm);
  const [lang, setLang] = React.useState<"tr" | "ru" | "ky">("tr");
  const [page, setPage] = React.useState(1);
  const perPage = 20;

  const [showBulkModal, setShowBulkModal] = React.useState(false);
  const [bulkConfig, setBulkConfig] = React.useState({
    categoryId: "",
    type: "percentage" as "percentage" | "fixed",
    action: "increase" as "increase" | "decrease",
    value: "",
  });

  const bulkPriceMutation = useMutation({
    mutationFn: async (payload: any) => {
      return (await apiClient.patch("/products/bulk/price", payload)).data;
    },
    onSuccess: (data: any) => {
      toast.success(`${data.count} ürünün fiyatı güncellendi`);
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setShowBulkModal(false);
      setBulkConfig({
        categoryId: "",
        type: "percentage",
        action: "increase",
        value: "",
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "İşlem başarısız");
    },
  });

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(bulkConfig.value);
    if (isNaN(val) || val <= 0) {
      toast.error("Lütfen geçerli bir değer girin");
      return;
    }
    const payload = {
      categoryIds: bulkConfig.categoryId ? [bulkConfig.categoryId] : undefined,
      type: bulkConfig.type,
      action: bulkConfig.action,
      value: val,
    };
    bulkPriceMutation.mutate(payload);
  };

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const res = await apiClient.get("/products", { params: { limit: 999 } });
      return res.data?.data || [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await apiClient.get("/categories");
      return res.data?.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingId) {
        return (await apiClient.patch(`/products/${editingId}`, data)).data;
      }
      return (await apiClient.post("/products", data)).data;
    },
    onSuccess: () => {
      toast.success(editingId ? "Ürün güncellendi" : "Ürün eklendi");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    },
    onError: () => toast.error("İşlem başarısız"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => (await apiClient.delete(`/products/${id}`)).data,
    onSuccess: () => {
      toast.success("Ürün silindi");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: () => toast.error("Silme başarısız"),
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      (await apiClient.patch(`/products/${id}`, { isPublished })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  const filtered = products.filter((p: any) => {
    const matchesSearch = !search ||
      p.name_tr?.toLowerCase().includes(search.toLowerCase()) ||
      p.stockCode?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory ||
      p.categories?.some((cat: any) => cat.id === selectedCategory);
    return matchesSearch && matchesCategory;
  });
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const renderTableSkeletons = () => {
    return Array.from({ length: 5 }).map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="p-4">
          <div className="w-12 h-12 bg-zinc-100 rounded-xl" />
        </td>
        <td className="p-4">
          <div className="h-4 bg-zinc-100 rounded w-48" />
        </td>
        <td className="p-4">
          <div className="h-4 bg-zinc-100 rounded w-24" />
        </td>
        <td className="p-4">
          <div className="h-4 bg-zinc-100 rounded w-20" />
        </td>
        <td className="p-4">
          <div className="h-4 bg-zinc-100 rounded w-16" />
        </td>
        <td className="p-4 text-center">
          <div className="h-6 bg-zinc-100 rounded w-10 mx-auto" />
        </td>
        <td className="p-4 text-center">
          <div className="h-6 bg-zinc-100 rounded-full w-20 mx-auto" />
        </td>
        <td className="p-4 text-right">
          <div className="h-8 bg-zinc-100 rounded w-20 ml-auto" />
        </td>
      </tr>
    ));
  };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      name_tr: p.name_tr || "", name_ru: p.name_ru || "", name_ky: p.name_ky || "",
      shortDesc_tr: p.shortDesc_tr || "", shortDesc_ru: p.shortDesc_ru || "", shortDesc_ky: p.shortDesc_ky || "",
      description_tr: p.description_tr || "", description_ru: p.description_ru || "", description_ky: p.description_ky || "",
      price: String(p.price || ""), discountPrice: String(p.discountPrice || ""),
      stockCode: p.stockCode || "", stockQty: String(p.stockQty || "0"),
      isPublished: p.isPublished ?? true,
      categoryId: p.categories?.[0]?.id || "",
      images: p.images || [],
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      ...form,
      price: parseFloat(form.price),
      discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
      stockQty: parseInt(form.stockQty),
      categoryIds: form.categoryId ? [form.categoryId] : [],
    };
    delete payload.categoryId;
    saveMutation.mutate(payload);
  };

  const tabs = [
    { code: "tr" as const, label: "🇹🇷 Türkçe" },
    { code: "ru" as const, label: "🇷🇺 Rusça" },
    { code: "ky" as const, label: "🇰🇬 Kırgızca" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Ürün adı veya stok kodu..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-secondary focus:outline-none focus:border-primary bg-white"
          />
        </div>
        <div className="relative min-w-[180px]">
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-secondary focus:outline-none focus:border-primary bg-white font-semibold"
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name_tr}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowBulkModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-secondary hover:border-primary rounded-xl text-sm font-bold transition-colors"
        >
          Toplu Fiyat Güncelle
        </button>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yeni Ürün
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Toplam Ürün", value: products.length },
          { label: "Yayında", value: products.filter((p: any) => p.isPublished).length },
          { label: "Stokta Yok", value: products.filter((p: any) => p.stockQty === 0).length },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <p className="text-2xl font-black text-secondary">{s.value}</p>
            <p className="text-xs text-zinc-400 font-semibold mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-zinc-50 text-xs font-bold text-zinc-500 uppercase">
                <th className="p-4">Görsel</th>
                <th className="p-4">Ürün Adı</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Stok Kodu</th>
                <th className="p-4">Fiyat</th>
                <th className="p-4 text-center">Stok</th>
                <th className="p-4 text-center">Durum</th>
                <th className="p-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                renderTableSkeletons()
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-400">
                    Ürün bulunamadı.
                  </td>
                </tr>
              ) : (
                paginated.map((product: any) => {
                  const img = getImageUrl(product.images?.[0]?.path);
                  const catName = product.categories?.[0]?.name_tr || "-";
                  return (
                    <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="p-4">
                        <div className="relative w-12 h-12 bg-zinc-50 rounded-xl overflow-hidden border border-gray-100">
                          <Image src={img} alt={product.name_tr} fill className="object-cover" sizes="48px" />
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-secondary">
                        <a
                          href={currentLocale === "tr" ? `/tovar/${product.slug}` : `/${currentLocale}/urun/${product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline text-primary"
                        >
                          {product.name_tr}
                        </a>
                      </td>
                      <td className="p-4 text-zinc-500 font-medium">
                        {catName}
                      </td>
                      <td className="p-4 text-zinc-500 font-mono text-xs">
                        {product.stockCode}
                      </td>
                      <td className="p-4">
                        {product.discountPrice ? (
                          <div className="space-y-0.5">
                            <p className="text-xs text-zinc-400 line-through">{Number(product.price).toLocaleString()} KGS</p>
                            <p className="text-sm font-black text-primary">{Number(product.discountPrice).toLocaleString()} KGS</p>
                          </div>
                        ) : (
                          <p className="text-sm font-black text-secondary">{Number(product.price).toLocaleString()} KGS</p>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <span className={cn(
                          "inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold",
                          product.stockQty > 0 ? "bg-zinc-100 text-zinc-700" : "bg-red-50 text-red-600 border border-red-100"
                        )}>
                          {product.stockQty}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => togglePublish.mutate({ id: product.id, isPublished: !product.isPublished })}
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all",
                            product.isPublished
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100"
                              : "bg-zinc-50 text-zinc-500 border border-zinc-200 hover:bg-zinc-100"
                          )}
                        >
                          {product.isPublished ? (
                            <>
                              <Eye className="w-3 h-3" />
                              Yayında
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              Taslak
                            </>
                          )}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEdit(product)}
                            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteId(product.id)
                            }}
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-zinc-50/50">
            <span className="text-xs text-zinc-500 font-semibold">
              Sayfa {page} / {totalPages} (Toplam {filtered.length} ürün)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Önceki
              </button>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-secondary">
                {editingId ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Language Tabs */}
              <div className="flex gap-2 border-b border-gray-100 pb-4">
                {tabs.map((t) => (
                  <button
                    key={t.code}
                    type="button"
                    onClick={() => setLang(t.code)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-bold transition-colors",
                      lang === t.code ? "bg-primary text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Localized Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Ürün Adı *</label>
                  <input
                    value={form[`name_${lang}` as keyof ProductForm] as string}
                    onChange={(e) => setForm({ ...form, [`name_${lang}`]: e.target.value })}
                    required={lang === "tr"}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                    placeholder={`Ürün adı (${lang.toUpperCase()})`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Kısa Açıklama</label>
                  <textarea
                    value={form[`shortDesc_${lang}` as keyof ProductForm] as string}
                    onChange={(e) => setForm({ ...form, [`shortDesc_${lang}`]: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Detaylı Açıklama</label>
                  <RichTextEditor
                    value={form[`description_${lang}` as keyof ProductForm] as string || ""}
                    onChange={(val) => setForm({ ...form, [`description_${lang}`]: val })}
                    placeholder="Detaylı ürün açıklaması yazın..."
                  />
                </div>
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Fiyat (KGS) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">İndirimli Fiyat</label>
                  <input
                    type="number"
                    value={form.discountPrice}
                    onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-zinc-500">Stok Kodu *</label>
                    <button
                      type="button"
                      onClick={() => {
                        const randomHex = Array.from({ length: 6 }, () => 
                          "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]
                        ).join("");
                        setForm({ ...form, stockCode: `BLN-${randomHex}` });
                      }}
                      className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      Otomatik Oluştur
                    </button>
                  </div>
                  <input
                    value={form.stockCode}
                    onChange={(e) => setForm({ ...form, stockCode: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Stok Adedi</label>
                  <input
                    type="number"
                    value={form.stockQty}
                    onChange={(e) => setForm({ ...form, stockQty: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Product Images */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">Ürün Görselleri</label>
                <ImageUpload
                  value={form.images}
                  onChange={(images) => setForm({ ...form, images })}
                  type="products"
                  multiple
                />
              </div>

              {/* Category & Publish */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Kategori</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-white"
                  >
                    <option value="">Seçin...</option>
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name_tr}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={form.isPublished}
                        onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={cn("w-12 h-6 rounded-full transition-colors", form.isPublished ? "bg-primary" : "bg-zinc-300")} />
                      <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform", form.isPublished ? "translate-x-7" : "translate-x-1")} />
                    </div>
                    <span className="text-sm font-semibold text-secondary">Yayında</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold text-secondary hover:bg-zinc-50">İptal</button>
                <button type="submit" disabled={saveMutation.isPending} className="flex-1 px-4 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold disabled:opacity-60">
                  {saveMutation.isPending ? "Kaydediliyor..." : editingId ? "Güncelle" : "Ekle"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Bulk Price Update Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-secondary">
                Toplu Fiyat Güncelleme
              </h3>
              <button onClick={() => setShowBulkModal(false)} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">Kategori Filtresi (Boş bırakılırsa tüm ürünler)</label>
                <select
                  value={bulkConfig.categoryId}
                  onChange={(e) => setBulkConfig({ ...bulkConfig, categoryId: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-white"
                >
                  <option value="">Tüm Kategoriler</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name_tr}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">İşlem Tipi</label>
                  <select
                    value={bulkConfig.action}
                    onChange={(e) => setBulkConfig({ ...bulkConfig, action: e.target.value as any })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-white"
                  >
                    <option value="increase">Fiyat Artır (+)</option>
                    <option value="decrease">Fiyat Azalt (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Hesaplama Tipi</label>
                  <select
                    value={bulkConfig.type}
                    onChange={(e) => setBulkConfig({ ...bulkConfig, type: e.target.value as any })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-white"
                  >
                    <option value="percentage">Yüzde (%)</option>
                    <option value="fixed">Sabit Tutar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">
                  Değer ({bulkConfig.type === "percentage" ? "%" : "KGS"}) *
                </label>
                <input
                  type="number"
                  step="any"
                  value={bulkConfig.value}
                  onChange={(e) => setBulkConfig({ ...bulkConfig, value: e.target.value })}
                  required
                  placeholder={bulkConfig.type === "percentage" ? "10 (%10 için)" : "500 (500 KGS için)"}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowBulkModal(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold text-secondary hover:bg-zinc-50">İptal</button>
                <button type="submit" disabled={bulkPriceMutation.isPending} className="flex-1 px-4 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold disabled:opacity-60">
                  {bulkPriceMutation.isPending ? "Güncelleniyor..." : "Uygula"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId!)}
        title="Ürünü Sil"
        description="Bu ürünü silmek istediğinizden emin misiniz?"
      />
</div>
  );
}

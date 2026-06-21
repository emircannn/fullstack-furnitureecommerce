"use client";

import React from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { motion } from "framer-motion";
import { Plus, Search, Edit2, Trash2, Tag, Calendar, Percent, Landmark, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DiscountForm {
  name: string;
  type: "PERCENT" | "FIXED";
  value: string;
  targetType: "PRODUCT" | "CATEGORY" | "ALL";
  targetIds: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const emptyForm: DiscountForm = {
  name: "",
  type: "PERCENT",
  value: "",
  targetType: "ALL",
  targetIds: [],
  startDate: "",
  endDate: "",
  isActive: true,
};

export default function AdminDiscountsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<DiscountForm>(emptyForm);

  const { data: discounts = [], isLoading } = useQuery({
    queryKey: ["admin-discounts"],
    queryFn: async () => {
      const res = await apiClient.get("/discounts");
      return res.data?.data || [];
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products-list-simple"],
    queryFn: async () => {
      const res = await apiClient.get("/products", { params: { limit: 100 } });
      return res.data?.data || [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories-list-simple"],
    queryFn: async () => {
      const res = await apiClient.get("/categories");
      return res.data?.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingId) {
        return (await apiClient.patch(`/discounts/${editingId}`, data)).data;
      }
      return (await apiClient.post("/discounts", data)).data;
    },
    onSuccess: () => {
      toast.success(editingId ? "İndirim kampanyası güncellendi" : "İndirim kampanyası oluşturuldu");
      queryClient.invalidateQueries({ queryKey: ["admin-discounts"] });
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "İşlem başarısız");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => (await apiClient.delete(`/discounts/${id}`)).data,
    onSuccess: () => {
      toast.success("İndirim kampanyası silindi");
      queryClient.invalidateQueries({ queryKey: ["admin-discounts"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Silme işlemi başarısız");
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      (await apiClient.patch(`/discounts/${id}`, { isActive })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-discounts"] }),
  });

  const openEdit = (d: any) => {
    setEditingId(d.id);
    setForm({
      name: d.name || "",
      type: d.type || "PERCENT",
      value: String(d.value || ""),
      targetType: d.targetType || "ALL",
      targetIds: Array.isArray(d.targetIds) ? d.targetIds : [],
      startDate: d.startDate ? new Date(d.startDate).toISOString().split("T")[0] : "",
      endDate: d.endDate ? new Date(d.endDate).toISOString().split("T")[0] : "",
      isActive: d.isActive ?? true,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      ...form,
      value: parseFloat(form.value) || 0,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      targetIds: form.targetType === "ALL" ? null : form.targetIds,
    };
    saveMutation.mutate(payload);
  };

  const handleTargetIdChange = (id: string) => {
    setForm(prev => {
      const exists = prev.targetIds.includes(id);
      const targetIds = exists
        ? prev.targetIds.filter(x => x !== id)
        : [...prev.targetIds, id];
      return { ...prev, targetIds };
    });
  };

  const filtered = discounts.filter((d: any) =>
    !search ||
    d.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kampanya adı ile ara..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-secondary focus:outline-none focus:border-primary bg-white"
          />
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yeni İndirim
        </button>
      </div>

      {/* Campaigns Table */}
      {isLoading ? (
        <div className="text-center py-12 text-zinc-400">Yükleniyor...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-zinc-50 text-xs font-bold text-zinc-500 uppercase">
                  <th className="p-4">Kampanya Adı</th>
                  <th className="p-4">İndirim Oranı/Tutarı</th>
                  <th className="p-4 text-center">Hedef Türü</th>
                  <th className="p-4 text-center">Tarih Aralığı</th>
                  <th className="p-4 text-center">Durum</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-400">
                      Kampanya bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filtered.map((d: any) => (
                    <tr key={d.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="p-4 font-bold text-secondary">{d.name}</td>
                      <td className="p-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                            d.type === "PERCENT"
                              ? "bg-orange-50 text-orange-600 border-orange-100"
                              : "bg-blue-50 text-blue-600 border-blue-100"
                          )}
                        >
                          {d.type === "PERCENT" ? (
                            <>
                              <Percent className="w-3 h-3" />
                              %{d.value} İndirim
                            </>
                          ) : (
                            <>
                              <Landmark className="w-3 h-3" />
                              {Number(d.value).toLocaleString()} KGS İndirim
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center text-xs bg-zinc-100 text-zinc-600 font-semibold px-2 py-1 rounded-lg">
                          {d.targetType === "ALL"
                            ? "Tüm Ürünler"
                            : d.targetType === "CATEGORY"
                            ? "Kategoriler"
                            : "Belirli Ürünler"}
                        </span>
                      </td>
                      <td className="p-4 text-center text-zinc-500 text-xs">
                        <div className="flex flex-col items-center gap-0.5 justify-center">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-zinc-400" />
                            <span>
                              {d.startDate ? new Date(d.startDate).toLocaleDateString("tr-TR") : "Başlangıç Yok"}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-400">ilâ</span>
                          <span>
                            {d.endDate ? new Date(d.endDate).toLocaleDateString("tr-TR") : "Bitiş Yok"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleActive.mutate({ id: d.id, isActive: !d.isActive })}
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all border",
                            d.isActive
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-zinc-50 text-zinc-400 border-zinc-100"
                          )}
                        >
                          {d.isActive ? "Aktif" : "Pasif"}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(d)}
                            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteId(d.id)
                            }}
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Discount Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-secondary">
                {editingId ? "Kampanyayı Düzenle" : "Yeni Kampanya Ekle"}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">Kampanya Adı *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary text-secondary"
                  placeholder="Yaz İndirimi"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">İndirim Türü</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-white text-secondary"
                  >
                    <option value="PERCENT">Yüzdesel (%)</option>
                    <option value="FIXED">Sabit Tutar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Değer *</label>
                  <input
                    type="number"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary text-secondary"
                    placeholder={form.type === "PERCENT" ? "10" : "1000"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Başlangıç Tarihi</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary text-secondary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Bitiş Tarihi</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary text-secondary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">Hedef Türü</label>
                <select
                  value={form.targetType}
                  onChange={(e) => setForm({ ...form, targetType: e.target.value as any, targetIds: [] })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-white text-secondary"
                >
                  <option value="ALL">Tüm Ürünler</option>
                  <option value="CATEGORY">Kategoriler</option>
                  <option value="PRODUCT">Belirli Ürünler</option>
                </select>
              </div>

              {/* Target Multi-select List */}
              {form.targetType !== "ALL" && (
                <div className="space-y-2 border border-gray-200 rounded-xl p-3 max-h-40 overflow-y-auto">
                  <p className="text-xs font-bold text-zinc-400 mb-1">
                    {form.targetType === "CATEGORY" ? "Kategoriler Seçin" : "Ürünler Seçin"}
                  </p>
                  {form.targetType === "CATEGORY"
                    ? categories.map((cat: any) => (
                        <label key={cat.id} className="flex items-center gap-2 cursor-pointer py-1 hover:bg-zinc-50 rounded px-1.5 text-xs text-secondary font-medium">
                          <input
                            type="checkbox"
                            checked={form.targetIds.includes(cat.id)}
                            onChange={() => handleTargetIdChange(cat.id)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          {cat.name_tr}
                        </label>
                      ))
                    : products.map((prod: any) => (
                        <label key={prod.id} className="flex items-center gap-2 cursor-pointer py-1 hover:bg-zinc-50 rounded px-1.5 text-xs text-secondary font-medium">
                          <input
                            type="checkbox"
                            checked={form.targetIds.includes(prod.id)}
                            onChange={() => handleTargetIdChange(prod.id)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          {prod.name_tr} ({prod.stockCode})
                        </label>
                      ))}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-sm font-semibold text-secondary">Kampanya Aktif</span>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={cn("w-12 h-6 rounded-full transition-colors", form.isActive ? "bg-primary" : "bg-zinc-300")} />
                    <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform", form.isActive ? "translate-x-7" : "translate-x-1")} />
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold text-secondary hover:bg-zinc-50">İptal</button>
                <button type="submit" disabled={saveMutation.isPending} className="flex-1 px-4 py-3 bg-primary hover:bg-primary/95 text-white rounded-xl text-sm font-bold disabled:opacity-60">
                  {saveMutation.isPending ? "Kaydediliyor..." : editingId ? "Güncelle" : "Oluştur"}
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
        title="Kampanyayı Sil"
        description="Bu indirim kampanyasını silmek istediğinizden emin misiniz?"
      />
</div>
  );
}

"use client";

import React from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { motion } from "framer-motion";
import { Plus, Search, Edit2, Trash2, ShieldAlert, BarChart, PackageOpen, X } from "lucide-react";
import { toast } from "sonner";
import { cn, getImageUrl } from "@/lib/utils";
import Image from "next/image";
import { ImageUpload } from "@/components/admin/image-upload";

interface InventoryForm {
  name: string;
  qty: string;
  unit: string;
  image: string;
}

const emptyForm: InventoryForm = {
  name: "",
  qty: "0",
  unit: "Adet",
  image: "",
};

export default function AdminInventoryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<InventoryForm>(emptyForm);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-inventory"],
    queryFn: async () => {
      const res = await apiClient.get("/inventory");
      return res.data?.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingId) {
        return (await apiClient.patch(`/inventory/${editingId}`, data)).data;
      }
      return (await apiClient.post("/inventory", data)).data;
    },
    onSuccess: () => {
      toast.success(editingId ? "Envanter kalemi güncellendi" : "Envanter kalemi eklendi");
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "İşlem başarısız");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => (await apiClient.delete(`/inventory/${id}`)).data,
    onSuccess: () => {
      toast.success("Envanter kalemi silindi");
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Silme işlemi başarısız");
    },
  });

  const openEdit = (item: any) => {
    setEditingId(item.id);
    setForm({
      name: item.name || "",
      qty: String(item.qty || "0"),
      unit: item.unit || "Adet",
      image: item.image || "",
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      qty: parseFloat(form.qty) || 0,
    };
    saveMutation.mutate(payload);
  };

  const filtered = items.filter((item: any) =>
    !search ||
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockItems = items.filter((item: any) => Number(item.qty || 0) < 5);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Malzeme adı ile ara..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-secondary focus:outline-none focus:border-primary bg-white"
          />
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yeni Malzeme Ekle
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
          <p className="text-2xl font-black text-secondary">{items.length}</p>
          <p className="text-xs text-zinc-400 font-semibold mt-1">Toplam Malzeme Çeşidi</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
          <p className="text-2xl font-black text-rose-500">{lowStockItems.length}</p>
          <p className="text-xs text-zinc-400 font-semibold mt-1">Kritik Stok Uyarısı (&lt; 5)</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
          <p className="text-2xl font-black text-emerald-600">
            {items.reduce((acc: number, item: any) => acc + Number(item.qty || 0), 0).toLocaleString()}
          </p>
          <p className="text-xs text-zinc-400 font-semibold mt-1">Toplam Stok Miktarı</p>
        </div>
      </div>

      {/* Critical Stock List Box if exists */}
      {lowStockItems.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-800">
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold">Kritik Stok Uyarıları</p>
            <p className="text-xs mt-1 text-amber-700">
              Aşağıdaki envanter kalemlerinin miktarı 5 birimin altına düşmüştür:
              <strong className="ml-1 text-amber-900">
                {lowStockItems.map((i: any) => `${i.name} (${i.qty} ${i.unit})`).join(", ")}
              </strong>
            </p>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      {isLoading ? (
        <div className="text-center py-12 text-zinc-400">Yükleniyor...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-zinc-50 text-xs font-bold text-zinc-500 uppercase">
                  <th className="p-4 w-16">Görsel</th>
                  <th className="p-4">Malzeme Adı</th>
                  <th className="p-4 text-center">Birim</th>
                  <th className="p-4 text-center">Miktar</th>
                  <th className="p-4 text-center">Son Güncelleme</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-400">
                      Malzeme bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item: any) => {
                    const isLow = Number(item.qty || 0) < 5;
                    const img = getImageUrl(item.image);
                    return (
                      <tr key={item.id} className={cn("hover:bg-zinc-50/50 transition-colors", isLow && "bg-amber-50/15")}>
                        <td className="p-4">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-100 bg-zinc-100">
                            <Image src={img} alt={item.name} fill className="object-cover" sizes="40px" />
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-secondary">{item.name}</p>
                        </td>
                        <td className="p-4 text-center text-zinc-500 font-semibold">{item.unit}</td>
                        <td className="p-4 text-center">
                          <span
                            className={cn(
                              "font-bold text-sm px-2.5 py-1 rounded-lg border",
                              isLow
                                ? "bg-rose-50 text-rose-600 border-rose-100"
                                : "bg-zinc-50 text-zinc-700 border-zinc-200"
                            )}
                          >
                            {item.qty}
                          </span>
                        </td>
                        <td className="p-4 text-center text-zinc-400 text-xs">
                          {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("tr-TR") : "-"}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => openEdit(item)}
                              className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteId(item.id)
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
        </div>
      )}

      {/* Inventory Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-secondary">
                {editingId ? "Malzemeyi Düzenle" : "Yeni Malzeme Ekle"}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">Malzeme Adı *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary text-secondary"
                  placeholder="Kumaş - Kadife"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Miktar (Stok) *</label>
                  <input
                    type="number"
                    value={form.qty}
                    onChange={(e) => setForm({ ...form, qty: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary text-secondary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Birim *</label>
                  <input
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary text-secondary"
                    placeholder="Adet, Metre, Kg vb."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">Görsel</label>
                <ImageUpload
                  value={form.image}
                  onChange={(url) => setForm({ ...form, image: url as string })}
                  type="inventory"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold text-secondary hover:bg-zinc-50">İptal</button>
                <button type="submit" disabled={saveMutation.isPending} className="flex-1 px-4 py-3 bg-primary hover:bg-primary/95 text-white rounded-xl text-sm font-bold disabled:opacity-60">
                  {saveMutation.isPending ? "Kaydediliyor..." : editingId ? "Güncelle" : "Ekle"}
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
        title="Malzemeyi Sil"
        description="Bu envanter malzemesini silmek istediğinizden emin misiniz?"
      />
</div>
  );
}

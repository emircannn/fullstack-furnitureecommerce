"use client";

import React from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { motion } from "framer-motion";
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, FolderTree, X } from "lucide-react";
import { toast } from "sonner";
import { cn, getImageUrl } from "@/lib/utils";
import Image from "next/image";
import { ImageUpload } from "@/components/admin/image-upload";

interface CategoryForm {
  name_tr: string;
  name_ru: string;
  name_ky: string;
  slug: string;
  image: string;
  showInHeader: boolean;
  order: string;
  parentId: string;
}

const emptyForm: CategoryForm = {
  name_tr: "",
  name_ru: "",
  name_ky: "",
  slug: "",
  image: "",
  showInHeader: false,
  order: "0",
  parentId: "",
};

function slugify(text: string) {
  const trMap: { [key: string]: string } = {
    ç: "c", Ç: "C", ğ: "g", Ğ: "G", ı: "i", İ: "I", ö: "o", Ö: "O", ş: "s", Ş: "S", ü: "u", Ü: "U"
  };
  return text
    .toString()
    .toLowerCase()
    .replace(/[çğışöüÇĞİŞÖÜ]/g, (matched) => trMap[matched] || matched)
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<CategoryForm>(emptyForm);
  const [lang, setLang] = React.useState<"tr" | "ru" | "ky">("tr");

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await apiClient.get("/categories");
      return res.data?.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingId) {
        return (await apiClient.patch(`/categories/${editingId}`, data)).data;
      }
      return (await apiClient.post("/categories", data)).data;
    },
    onSuccess: () => {
      toast.success(editingId ? "Kategori güncellendi" : "Kategori eklendi");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "İşlem başarısız");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => (await apiClient.delete(`/categories/${id}`)).data,
    onSuccess: () => {
      toast.success("Kategori silindi");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Silme işlemi başarısız");
    },
  });

  const toggleShowInHeader = useMutation({
    mutationFn: async ({ id, showInHeader }: { id: string; showInHeader: boolean }) =>
      (await apiClient.patch(`/categories/${id}`, { showInHeader })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-categories"] }),
  });

  const handleNameChange = (val: string) => {
    setForm(prev => {
      const updated = { ...prev, name_tr: val };
      if (!editingId) {
        updated.slug = slugify(val);
      }
      return updated;
    });
  };

  const openEdit = (c: any) => {
    setEditingId(c.id);
    setForm({
      name_tr: c.name_tr || "",
      name_ru: c.name_ru || "",
      name_ky: c.name_ky || "",
      slug: c.slug || "",
      image: c.image || "",
      showInHeader: c.showInHeader ?? false,
      order: String(c.order ?? "0"),
      parentId: c.parent?.id || "",
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      ...form,
      order: parseInt(form.order) || 0,
      parent: form.parentId ? { id: form.parentId } : null,
    };
    delete payload.parentId;
    saveMutation.mutate(payload);
  };

  const filtered = categories.filter((c: any) =>
    !search ||
    c.name_tr?.toLowerCase().includes(search.toLowerCase()) ||
    c.name_ru?.toLowerCase().includes(search.toLowerCase()) ||
    c.name_ky?.toLowerCase().includes(search.toLowerCase())
  );

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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kategori adı ile ara..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-secondary focus:outline-none focus:border-primary bg-white"
          />
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yeni Kategori
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Toplam Kategori", value: categories.length },
          { label: "Menüde Gösterilen", value: categories.filter((c: any) => c.showInHeader).length },
          { label: "Alt Kategori", value: categories.filter((c: any) => c.parent).length },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
            <p className="text-2xl font-black text-secondary">{s.value}</p>
            <p className="text-xs text-zinc-400 font-semibold mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Categories Table */}
      {isLoading ? (
        <div className="text-center py-12 text-zinc-400">Yükleniyor...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-zinc-50 text-xs font-bold text-zinc-500 uppercase">
                  <th className="p-4 w-16">Görsel</th>
                  <th className="p-4">Kategori Adı (TR / RU / KY)</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4 text-center">Menüde Göster</th>
                  <th className="p-4 text-center">Sıra</th>
                  <th className="p-4 text-center">Üst Kategori</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-zinc-400">
                      Kategori bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c: any) => {
                    const img = getImageUrl(c.image);
                    return (
                      <tr key={c.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="p-4">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-100 bg-zinc-100">
                            <Image src={img} alt={c.name_tr} fill className="object-cover" sizes="40px" />
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-bold text-secondary">{c.name_tr}</p>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              {c.name_ru || "-"} / {c.name_ky || "-"}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 text-zinc-500 font-mono text-xs">{c.slug}</td>
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggleShowInHeader.mutate({ id: c.id, showInHeader: !c.showInHeader })}
                            className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all",
                              c.showInHeader
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : "bg-zinc-50 text-zinc-400 border border-zinc-100"
                            )}
                          >
                            {c.showInHeader ? "Göster" : "Gizle"}
                          </button>
                        </td>
                        <td className="p-4 text-center font-bold text-zinc-700">{c.order}</td>
                        <td className="p-4 text-center text-zinc-500">
                          {c.parent ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-zinc-100 text-zinc-600 px-2 py-1 rounded-lg">
                              <FolderTree className="w-3 h-3" />
                              {c.parent.name_tr}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => openEdit(c)}
                              className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                               onClick={() => {
                                 setDeleteId(c.id)
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

      {/* Category Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-secondary">
                {editingId ? "Kategoriyi Düzenle" : "Yeni Kategori Ekle"}
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
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Kategori Adı ({lang.toUpperCase()}) *</label>
                  <input
                    value={form[`name_${lang}` as keyof CategoryForm] as string}
                    onChange={(e) => {
                      if (lang === "tr") {
                        handleNameChange(e.target.value);
                      } else {
                        setForm({ ...form, [`name_${lang}`]: e.target.value });
                      }
                    }}
                    required={lang === "tr"}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary text-secondary"
                    placeholder={`Kategori adı (${lang.toUpperCase()})`}
                  />
                </div>
              </div>

              {/* Slug, Image & Parent */}
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Slug *</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary font-mono text-secondary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Görsel</label>
                  <ImageUpload
                    value={form.image}
                    onChange={(url) => setForm({ ...form, image: url as string })}
                    type="categories"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Üst Kategori</label>
                  <select
                    value={form.parentId}
                    onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-white text-secondary"
                  >
                    <option value="">Yok (Ana Kategori)</option>
                    {categories
                      .filter((c: any) => c.id !== editingId)
                      .map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.name_tr}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Header Toggle & Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Sıralama (Order)</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary text-secondary"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={form.showInHeader}
                        onChange={(e) => setForm({ ...form, showInHeader: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={cn("w-12 h-6 rounded-full transition-colors", form.showInHeader ? "bg-primary" : "bg-zinc-300")} />
                      <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform", form.showInHeader ? "translate-x-7" : "translate-x-1")} />
                    </div>
                    <span className="text-sm font-semibold text-secondary">Menüde Göster</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
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
        title="Kategoriyi Sil"
        description="Bu kategoriyi silmek istediğinizden emin misiniz?"
      />
</div>
  );
}

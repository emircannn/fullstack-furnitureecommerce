"use client";

import React from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { motion } from "framer-motion";
import { Plus, Search, Edit2, Trash2, FileText, Calendar, ToggleLeft, ToggleRight, X } from "lucide-react";
import { toast } from "sonner";
import { cn, getImageUrl } from "@/lib/utils";
import Image from "next/image";

interface SpecialPageForm {
  title_tr: string; title_ru: string; title_ky: string;
  slug: string;
  bannerImage: string;
  isActive: boolean;
}

const emptyForm: SpecialPageForm = {
  title_tr: "", title_ru: "", title_ky: "",
  slug: "",
  bannerImage: "",
  isActive: true,
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

export default function AdminSpecialPagesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<SpecialPageForm>(emptyForm);
  const [lang, setLang] = React.useState<"tr" | "ru" | "ky">("tr");

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["admin-special-pages"],
    queryFn: async () => {
      const res = await apiClient.get("/special-pages");
      return res.data?.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingId) {
        return (await apiClient.patch(`/special-pages/${editingId}`, data)).data;
      }
      return (await apiClient.post("/special-pages", data)).data;
    },
    onSuccess: () => {
      toast.success(editingId ? "Özel sayfa güncellendi" : "Özel sayfa eklendi");
      queryClient.invalidateQueries({ queryKey: ["admin-special-pages"] });
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "İşlem başarısız");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => (await apiClient.delete(`/special-pages/${id}`)).data,
    onSuccess: () => {
      toast.success("Özel sayfa silindi");
      queryClient.invalidateQueries({ queryKey: ["admin-special-pages"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Silme işlemi başarısız");
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      (await apiClient.patch(`/special-pages/${id}`, { isActive })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-special-pages"] }),
  });

  const handleTitleChange = (val: string) => {
    setForm(prev => {
      const updated = { ...prev, title_tr: val };
      if (!editingId) {
        updated.slug = slugify(val);
      }
      return updated;
    });
  };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      title_tr: p.title_tr || "", title_ru: p.title_ru || "", title_ky: p.title_ky || "",
      slug: p.slug || "",
      bannerImage: p.bannerImage || "",
      isActive: p.isActive ?? true,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(form);
  };

  const filtered = pages.filter((p: any) =>
    !search ||
    p.title_tr?.toLowerCase().includes(search.toLowerCase()) ||
    p.slug?.toLowerCase().includes(search.toLowerCase())
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
            placeholder="Sayfa başlığı ile ara..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-secondary focus:outline-none focus:border-primary bg-white"
          />
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yeni Sayfa
        </button>
      </div>

      {/* Pages Table */}
      {isLoading ? (
        <div className="text-center py-12 text-zinc-400">Yükleniyor...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-zinc-50 text-xs font-bold text-zinc-500 uppercase">
                  <th className="p-4 w-16">Afiş</th>
                  <th className="p-4">Başlık (TR)</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4 text-center">Tarih</th>
                  <th className="p-4 text-center">Durum</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-400">
                      Sayfa bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filtered.map((page: any) => {
                    const img = getImageUrl(page.bannerImage);
                    return (
                      <tr key={page.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="p-4">
                          <div className="relative w-12 h-9 rounded-lg overflow-hidden border border-gray-100 bg-zinc-100">
                            <Image src={img} alt={page.title_tr} fill className="object-cover" sizes="48px" />
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-bold text-secondary">{page.title_tr}</p>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              {page.title_ru || "-"} / {page.title_ky || "-"}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 text-zinc-500 font-mono text-xs">/special/{page.slug}</td>
                        <td className="p-4 text-center text-zinc-500 text-xs">
                          <div className="flex items-center justify-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                            <span>
                              {page.createdAt ? new Date(page.createdAt).toLocaleDateString("tr-TR") : "-"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggleActive.mutate({ id: page.id, isActive: !page.isActive })}
                            className="text-zinc-600 transition-colors focus:outline-none"
                          >
                            {page.isActive ? (
                              <ToggleRight className="w-8 h-8 text-emerald-500" />
                            ) : (
                              <ToggleLeft className="w-8 h-8 text-zinc-300" />
                            )}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => openEdit(page)}
                              className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteId(page.id)
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

      {/* Special Page Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-secondary">
                {editingId ? "Sayfayı Düzenle" : "Yeni Özel Sayfa Ekle"}
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
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Sayfa Başlığı ({lang.toUpperCase()}) *</label>
                  <input
                    value={form[`title_${lang}` as keyof SpecialPageForm] as string}
                    onChange={(e) => {
                      if (lang === "tr") {
                        handleTitleChange(e.target.value);
                      } else {
                        setForm({ ...form, [`title_${lang}`]: e.target.value });
                      }
                    }}
                    required={lang === "tr"}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary text-secondary"
                    placeholder={`Sayfa Başlığı (${lang.toUpperCase()})`}
                  />
                </div>
              </div>

              {/* Slug & Banner Image */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
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
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Afiş Görsel URL</label>
                  <input
                    value={form.bannerImage}
                    onChange={(e) => setForm({ ...form, bannerImage: e.target.value })}
                    placeholder="https://example.com/banner.jpg"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary text-secondary"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-sm font-semibold text-secondary">Yayında</span>
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
        title="Sayfayı Sil"
        description="Bu özel sayfayı silmek istediğinizden emin misiniz?"
      />
</div>
  );
}

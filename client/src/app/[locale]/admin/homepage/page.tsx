"use client";

import React from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Home, ToggleLeft, ToggleRight, X, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { cn, getImageUrl } from "@/lib/utils";
import Image from "next/image";
import { ImageUpload } from "@/components/admin/image-upload";

interface SliderForm {
  image: string;
  title_tr: string; title_ru: string; title_ky: string;
  subtitle_tr: string; subtitle_ru: string; subtitle_ky: string;
  buttonText_tr: string; buttonText_ru: string; buttonText_ky: string;
  buttonLink: string;
  buttonColor: string;
  textColor: string;
  order: string;
  isActive: boolean;
}

const emptyForm: SliderForm = {
  image: "",
  title_tr: "", title_ru: "", title_ky: "",
  subtitle_tr: "", subtitle_ru: "", subtitle_ky: "",
  buttonText_tr: "", buttonText_ru: "", buttonText_ky: "",
  buttonLink: "",
  buttonColor: "#e75f0d",
  textColor: "#ffffff",
  order: "0",
  isActive: true,
};

export default function AdminHomepageDesignPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<SliderForm>(emptyForm);
  const [lang, setLang] = React.useState<"tr" | "ru" | "ky">("tr");

  const { data: slides = [], isLoading } = useQuery({
    queryKey: ["admin-sliders"],
    queryFn: async () => {
      const res = await apiClient.get("/homepage-design/slider");
      return res.data?.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingId) {
        return (await apiClient.patch(`/homepage-design/slider/${editingId}`, data)).data;
      }
      return (await apiClient.post("/homepage-design/slider", data)).data;
    },
    onSuccess: () => {
      toast.success(editingId ? "Slayt güncellendi" : "Slayt eklendi");
      queryClient.invalidateQueries({ queryKey: ["admin-sliders"] });
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "İşlem başarısız");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => (await apiClient.delete(`/homepage-design/slider/${id}`)).data,
    onSuccess: () => {
      toast.success("Slayt silindi");
      queryClient.invalidateQueries({ queryKey: ["admin-sliders"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Silme işlemi başarısız");
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      (await apiClient.patch(`/homepage-design/slider/${id}`, { isActive })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-sliders"] }),
  });

  const openEdit = (s: any) => {
    setEditingId(s.id);
    setForm({
      image: s.image || "",
      title_tr: s.title_tr || "", title_ru: s.title_ru || "", title_ky: s.title_ky || "",
      subtitle_tr: s.subtitle_tr || "", subtitle_ru: s.subtitle_ru || "", subtitle_ky: s.subtitle_ky || "",
      buttonText_tr: s.buttonText_tr || "", buttonText_ru: s.buttonText_ru || "", buttonText_ky: s.buttonText_ky || "",
      buttonLink: s.buttonLink || "",
      buttonColor: s.buttonColor || "#e75f0d",
      textColor: s.textColor || "#ffffff",
      order: String(s.order ?? "0"),
      isActive: s.isActive ?? true,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      order: parseInt(form.order) || 0,
    };
    saveMutation.mutate(payload);
  };

  // Sort slides by order field
  const sortedSlides = [...slides].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  const tabs = [
    { code: "tr" as const, label: "🇹🇷 Türkçe" },
    { code: "ru" as const, label: "🇷🇺 Rusça" },
    { code: "ky" as const, label: "🇰🇬 Kırgızca" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-secondary">Anasayfa Slider Yönetimi</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Slayt görsellerini, butonları ve sıralamayı düzenleyin.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yeni Slayt Ekle
        </button>
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div className="text-center py-12 text-zinc-400">Yükleniyor...</div>
      ) : sortedSlides.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-zinc-400 shadow-sm">
          Slayt bulunamadı. Lütfen yeni bir slayt ekleyin.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSlides.map((slide: any) => {
            const img = getImageUrl(slide.image);
            return (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all flex flex-col group relative shadow-sm"
              >
                <div className="relative aspect-[16/9] bg-zinc-100">
                  <Image src={img} alt={slide.title_tr || "Slayt"} fill className="object-cover" sizes="400px" />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <span className="bg-black/60 text-white text-[11px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm">
                      Sıra: {slide.order || 0}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-secondary text-sm line-clamp-1">
                      {slide.title_tr || "Başlıksız Slayt"}
                    </h4>
                    <p className="text-xs text-zinc-400 line-clamp-2">
                      {slide.subtitle_tr || "Alt başlık yok"}
                    </p>
                    {slide.buttonText_tr && (
                      <div className="pt-2">
                        <span
                          className="inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm"
                          style={{
                            backgroundColor: slide.buttonColor || "#e75f0d",
                            color: slide.textColor || "#ffffff",
                          }}
                        >
                          {slide.buttonText_tr}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-4">
                    <button
                      type="button"
                      onClick={() => toggleActive.mutate({ id: slide.id, isActive: !slide.isActive })}
                      className="flex items-center gap-1.5 focus:outline-none"
                    >
                      {slide.isActive ? (
                        <ToggleRight className="w-8 h-8 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-zinc-300" />
                      )}
                      <span className="text-xs font-semibold text-zinc-500">
                        {slide.isActive ? "Yayında" : "Gizli"}
                      </span>
                    </button>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => openEdit(slide)}
                        className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteId(slide.id)
                        }}
                        className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Slider Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-secondary">
                {editingId ? "Slaytı Düzenle" : "Yeni Slayt Ekle"}
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
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Slayt Başlığı ({lang.toUpperCase()})</label>
                  <input
                    value={form[`title_${lang}` as keyof SliderForm] as string}
                    onChange={(e) => setForm({ ...form, [`title_${lang}`]: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary text-secondary"
                    placeholder="Premium Oturma Grubu"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Alt Başlık ({lang.toUpperCase()})</label>
                  <input
                    value={form[`subtitle_${lang}` as keyof SliderForm] as string}
                    onChange={(e) => setForm({ ...form, [`subtitle_${lang}`]: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary text-secondary"
                    placeholder="Şimdi %20 indirimle..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Buton Yazısı ({lang.toUpperCase()})</label>
                  <input
                    value={form[`buttonText_${lang}` as keyof SliderForm] as string}
                    onChange={(e) => setForm({ ...form, [`buttonText_${lang}`]: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary text-secondary"
                    placeholder="İncele / Satın Al"
                  />
                </div>
              </div>

              {/* Image & Link */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Görsel *</label>
                  <ImageUpload
                    value={form.image}
                    onChange={(url) => setForm({ ...form, image: url as string })}
                    type="sliders"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Buton Yönlendirme Linki</label>
                  <input
                    value={form.buttonLink}
                    onChange={(e) => setForm({ ...form, buttonLink: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary text-secondary"
                    placeholder="/kategoriya/oturma-odasi"
                  />
                </div>
              </div>

              {/* Colors & Order */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Buton Rengi</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={form.buttonColor}
                      onChange={(e) => setForm({ ...form, buttonColor: e.target.value })}
                      className="w-10 h-10 border border-gray-200 rounded-lg cursor-pointer bg-white"
                    />
                    <input
                      type="text"
                      value={form.buttonColor}
                      onChange={(e) => setForm({ ...form, buttonColor: e.target.value })}
                      className="flex-1 w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Buton Yazı Rengi</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={form.textColor}
                      onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                      className="w-10 h-10 border border-gray-200 rounded-lg cursor-pointer bg-white"
                    />
                    <input
                      type="text"
                      value={form.textColor}
                      onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                      className="flex-1 w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Sıralama Sırası (Order)</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary text-secondary font-semibold"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-sm font-semibold text-secondary">Slayt Aktif (Yayında)</span>
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
        title="Slaytı Sil"
        description="Bu anasayfa slaytını silmek istediğinizden emin misiniz?"
      />
</div>
  );
}

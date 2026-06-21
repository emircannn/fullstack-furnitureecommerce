"use client";

import React from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { motion } from "framer-motion";
import { Plus, Search, Edit2, Trash2, BookOpen, Calendar, Eye, EyeOff, X } from "lucide-react";
import { toast } from "sonner";
import { cn, getImageUrl } from "@/lib/utils";
import Image from "next/image";
import { ImageUpload } from "@/components/admin/image-upload";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

interface BlogForm {
  title_tr: string; title_ru: string; title_ky: string;
  excerpt_tr: string; excerpt_ru: string; excerpt_ky: string;
  content_tr: string; content_ru: string; content_ky: string;
  slug: string;
  image: string;
  isPublished: boolean;
}

const emptyForm: BlogForm = {
  title_tr: "", title_ru: "", title_ky: "",
  excerpt_tr: "", excerpt_ru: "", excerpt_ky: "",
  content_tr: "", content_ru: "", content_ky: "",
  slug: "",
  image: "",
  isPublished: true,
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

export default function AdminBlogPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<BlogForm>(emptyForm);
  const [lang, setLang] = React.useState<"tr" | "ru" | "ky">("tr");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: async () => {
      const res = await apiClient.get("/blog");
      return res.data?.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingId) {
        return (await apiClient.patch(`/blog/${editingId}`, data)).data;
      }
      return (await apiClient.post("/blog", data)).data;
    },
    onSuccess: () => {
      toast.success(editingId ? "Yazı güncellendi" : "Yazı eklendi");
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "İşlem başarısız");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => (await apiClient.delete(`/blog/${id}`)).data,
    onSuccess: () => {
      toast.success("Yazı silindi");
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Silme işlemi başarısız");
    },
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      (await apiClient.patch(`/blog/${id}`, { isPublished })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] }),
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
      excerpt_tr: p.excerpt_tr || "", excerpt_ru: p.excerpt_ru || "", excerpt_ky: p.excerpt_ky || "",
      content_tr: p.content_tr || "", content_ru: p.content_ru || "", content_ky: p.content_ky || "",
      slug: p.slug || "",
      image: p.image || "",
      isPublished: p.isPublished ?? true,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(form);
  };

  const filtered = posts.filter((p: any) =>
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
            placeholder="Makale başlığı ile ara..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-secondary focus:outline-none focus:border-primary bg-white"
          />
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yeni Yazı
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Toplam Yazı", value: posts.length },
          { label: "Yayında Olanlar", value: posts.filter((p: any) => p.isPublished).length },
          { label: "Taslaklar", value: posts.filter((p: any) => !p.isPublished).length },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
            <p className="text-2xl font-black text-secondary">{s.value}</p>
            <p className="text-xs text-zinc-400 font-semibold mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Blog Table */}
      {isLoading ? (
        <div className="text-center py-12 text-zinc-400">Yükleniyor...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-zinc-50 text-xs font-bold text-zinc-500 uppercase">
                  <th className="p-4 w-16">Görsel</th>
                  <th className="p-4">Başlık (TR)</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4 text-center">Yayın Tarihi</th>
                  <th className="p-4 text-center">Yayın Durumu</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-400">
                      Yazı bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filtered.map((post: any) => {
                    const img = getImageUrl(post.image);
                    return (
                      <tr key={post.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="p-4">
                          <div className="relative w-12 h-9 rounded-lg overflow-hidden border border-gray-100 bg-zinc-100">
                            <Image src={img} alt={post.title_tr} fill className="object-cover" sizes="48px" />
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-bold text-secondary">{post.title_tr}</p>
                            <p className="text-xs text-zinc-400 mt-0.5 max-w-[250px] truncate" title={post.excerpt_tr}>
                              {post.excerpt_tr || "-"}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 text-zinc-500 font-mono text-xs">{post.slug}</td>
                        <td className="p-4 text-center text-zinc-500 text-xs">
                          <div className="flex items-center justify-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                            <span>
                              {post.createdAt ? new Date(post.createdAt).toLocaleDateString("tr-TR") : "-"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => togglePublish.mutate({ id: post.id, isPublished: !post.isPublished })}
                            className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all border",
                              post.isPublished
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : "bg-zinc-50 text-zinc-400 border-zinc-100"
                            )}
                          >
                            {post.isPublished ? (
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
                              onClick={() => openEdit(post)}
                              className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteId(post.id)
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

      {/* Blog Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-secondary">
                {editingId ? "Yazıyı Düzenle" : "Yeni Yazı Ekle"}
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
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Başlık ({lang.toUpperCase()}) *</label>
                  <input
                    value={form[`title_${lang}` as keyof BlogForm] as string}
                    onChange={(e) => {
                      if (lang === "tr") {
                        handleTitleChange(e.target.value);
                      } else {
                        setForm({ ...form, [`title_${lang}`]: e.target.value });
                      }
                    }}
                    required={lang === "tr"}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary text-secondary"
                    placeholder={`Yazı başlığı (${lang.toUpperCase()})`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Özet ({lang.toUpperCase()})</label>
                  <textarea
                    value={form[`excerpt_${lang}` as keyof BlogForm] as string}
                    onChange={(e) => setForm({ ...form, [`excerpt_${lang}`]: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary text-secondary resize-none"
                    placeholder="Kısa önizleme metni..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">İçerik ({lang.toUpperCase()}) *</label>
                  <RichTextEditor
                    value={form[`content_${lang}` as keyof BlogForm] as string || ""}
                    onChange={(val) => setForm({ ...form, [`content_${lang}`]: val })}
                    placeholder="Makale ana metni..."
                  />
                </div>
              </div>

              {/* Slug & Image */}
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
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Görsel</label>
                  <ImageUpload
                    value={form.image}
                    onChange={(url) => setForm({ ...form, image: url as string })}
                    type="blogs"
                  />
                </div>
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-sm font-semibold text-secondary">Yayında</span>
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
        title="Yazıyı Sil"
        description="Bu blog yazısını silmek istediğinizden emin misiniz?"
      />
</div>
  );
}

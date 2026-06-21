"use client";

import React from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { motion } from "framer-motion";
import { MessageSquare, HelpCircle, CornerDownRight, X, Clock, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";

export default function AdminQuestionsPage() {
  const queryClient = useQueryClient();
  const params = useParams();
  const currentLocale = (params?.locale as string) || "tr";

  const [filter, setFilter] = React.useState<"ALL" | "UNANSWERED" | "ANSWERED">("ALL");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [editingQuestion, setEditingQuestion] = React.useState<any | null>(null);
  const [answerText, setAnswerText] = React.useState("");

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["admin-questions"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/questions/admin");
        return res.data?.data || [];
      } catch {
        const res = await apiClient.get("/questions");
        return res.data?.data || [];
      }
    },
  });

  const answerMutation = useMutation({
    mutationFn: async ({ id, answer }: { id: string; answer: string }) =>
      (await apiClient.patch(`/questions/${id}`, { answer })).data,
    onSuccess: () => {
      toast.success("Cevap kaydedildi");
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
      setEditingQuestion(null);
      setAnswerText("");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Cevap kaydedilemedi");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => (await apiClient.delete(`/questions/${id}`)).data,
    onSuccess: () => {
      toast.success("Soru silindi");
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Silme işlemi başarısız");
    },
  });

  const openAnswerModal = (q: any) => {
    setEditingQuestion(q);
    setAnswerText(q.answer || "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    answerMutation.mutate({ id: editingQuestion.id, answer: answerText });
  };

  const handleFilterChange = (f: "ALL" | "UNANSWERED" | "ANSWERED") => {
    setFilter(f);
    setCurrentPage(1);
  };

  const filtered = questions.filter((q: any) => {
    if (filter === "UNANSWERED") return !q.answer;
    if (filter === "ANSWERED") return !!q.answer;
    return true;
  });

  const itemsPerPage = 20;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedQuestions = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage]);

  const renderSkeletons = () => {
    return Array.from({ length: 5 }).map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="p-4">
          <div className="space-y-2">
            <div className="h-4 bg-zinc-100 rounded w-24" />
            <div className="h-3 bg-zinc-100 rounded w-32" />
          </div>
        </td>
        <td className="p-4">
          <div className="space-y-2">
            <div className="h-4 bg-zinc-100 rounded w-28" />
            <div className="h-3 bg-zinc-100 rounded w-16" />
          </div>
        </td>
        <td className="p-4">
          <div className="h-4 bg-zinc-100 rounded w-48" />
        </td>
        <td className="p-4">
          <div className="h-4 bg-zinc-100 rounded w-40" />
        </td>
        <td className="p-4 text-center">
          <div className="h-6 bg-zinc-100 rounded-full w-20 mx-auto" />
        </td>
        <td className="p-4 text-center">
          <div className="h-4 bg-zinc-100 rounded w-16 mx-auto" />
        </td>
        <td className="p-4 text-right">
          <div className="h-8 bg-zinc-100 rounded w-20 ml-auto" />
        </td>
      </tr>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2 justify-between items-center flex-wrap">
        <div className="flex gap-2">
          {(["ALL", "UNANSWERED", "ANSWERED"] as const).map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-bold transition-all border",
                filter === f
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white text-zinc-500 border-gray-200 hover:bg-zinc-50"
              )}
            >
              {f === "ALL" ? "Tüm Sorular" : f === "UNANSWERED" ? "Cevaplanmayanlar" : "Cevaplananlar"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Toplam Soru", value: questions.length },
          { label: "Cevap Bekleyen", value: questions.filter((q: any) => !q.answer).length },
          { label: "Cevaplanan", value: questions.filter((q: any) => !!q.answer).length },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
            <p className="text-2xl font-black text-secondary">{s.value}</p>
            <p className="text-xs text-zinc-400 font-semibold mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Questions Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-zinc-50 text-xs font-bold text-zinc-500 uppercase">
                <th className="p-4">Kullanıcı</th>
                <th className="p-4">Ürün</th>
                <th className="p-4">Soru</th>
                <th className="p-4">Cevap</th>
                <th className="p-4 text-center">Durum</th>
                <th className="p-4 text-center">Tarih</th>
                <th className="p-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                renderSkeletons()
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-400">
                    Soru bulunamadı.
                  </td>
                </tr>
              ) : (
                paginatedQuestions.map((q: any) => (
                  <tr key={q.id} className={cn("hover:bg-zinc-50/50 transition-colors", !q.answer && "bg-amber-50/10")}>
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-secondary">{q.user?.name || "Ziyaretçi"}</p>
                        <p className="text-xs text-zinc-400">{q.user?.email || "E-posta yok"}</p>
                      </div>
                    </td>
                    <td className="p-4 max-w-[150px] truncate">
                      {q.product ? (
                        <a
                          href={currentLocale === "tr" ? `/tovar/${q.product.slug}` : `/${currentLocale}/urun/${q.product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-primary hover:underline truncate block"
                          title={q.product.name_tr}
                        >
                          {q.product.name_tr}
                        </a>
                      ) : (
                        <p className="font-semibold text-zinc-400 truncate">Ürün Silinmiş</p>
                      )}
                      <p className="text-xs text-zinc-400 truncate">{q.product?.stockCode}</p>
                    </td>
                    <td
                      onClick={() => openAnswerModal(q)}
                      className="p-4 max-w-[220px] cursor-pointer hover:bg-zinc-100/50 transition-colors"
                    >
                      <p className="text-zinc-700 font-medium line-clamp-2" title={q.question}>
                        {q.question}
                      </p>
                    </td>
                    <td
                      onClick={() => openAnswerModal(q)}
                      className="p-4 max-w-[220px] cursor-pointer hover:bg-zinc-100/50 transition-colors"
                    >
                      {q.answer ? (
                        <div className="flex gap-1.5 items-start text-xs text-zinc-500">
                          <CornerDownRight className="w-3.5 h-3.5 mt-0.5 text-zinc-400 shrink-0" />
                          <p className="line-clamp-2 italic" title={q.answer}>
                            {q.answer}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400 italic">Henüz cevaplanmamış</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold",
                          q.answer
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-amber-50 text-amber-600 border border-amber-100"
                        )}
                      >
                        {q.answer ? (
                          <>
                            <MessageSquare className="w-3 h-3" />
                            Cevaplandı
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            Cevap Bekliyor
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-4 text-center text-zinc-500 text-xs">
                      {q.createdAt ? new Date(q.createdAt).toLocaleDateString("tr-TR") : "-"}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => openAnswerModal(q)}
                          className={cn(
                            "p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold",
                            q.answer
                              ? "bg-blue-50 hover:bg-blue-100 text-blue-600"
                              : "bg-primary/10 hover:bg-primary text-primary hover:text-white"
                          )}
                        >
                          {q.answer ? <Edit2 className="w-3.5 h-3.5" /> : "Cevapla"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(q.id)
                          }}
                          className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-zinc-50/50">
            <span className="text-xs text-zinc-500 font-semibold">
              Sayfa {currentPage} / {totalPages} (Toplam {filtered.length} soru)
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Önceki
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Answer Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-secondary">
                {editingQuestion.answer ? "Cevabı Düzenle" : "Soruyu Cevapla"}
              </h3>
              <button onClick={() => setEditingQuestion(null)} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-3">
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-500">
                    <span>{editingQuestion.user?.name || "Ziyaretçi"}</span>
                    <span>Ürün: {editingQuestion.product?.name_tr || "Silinmiş Ürün"}</span>
                  </div>
                  <p className="text-sm font-semibold text-secondary">{editingQuestion.question}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">Cevabınız *</label>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  required
                  rows={6}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary text-secondary resize-none"
                  placeholder="Cevabınızı buraya yazın..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingQuestion(null)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold text-secondary hover:bg-zinc-50">İptal</button>
                <button type="submit" disabled={answerMutation.isPending} className="flex-1 px-4 py-3 bg-primary hover:bg-primary/95 text-white rounded-xl text-sm font-bold disabled:opacity-60">
                  {answerMutation.isPending ? "Kaydediliyor..." : "Cevabı Gönder"}
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
        title="Soruyu Sil"
        description="Bu soruyu silmek istediğinizden emin misiniz?"
      />
</div>
  );
}

"use client";

import React from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { motion } from "framer-motion";
import { Star, Check, Trash2, Clock, CheckCircle2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const params = useParams();
  const currentLocale = (params?.locale as string) || "tr";

  const [filter, setFilter] = React.useState<"ALL" | "PENDING" | "APPROVED">("ALL");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/reviews/admin");
        return res.data?.data || [];
      } catch {
        const res = await apiClient.get("/reviews");
        return res.data?.data || [];
      }
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        return (await apiClient.patch(`/reviews/${id}/approve`, {})).data;
      } catch {
        return (await apiClient.patch(`/reviews/${id}`, { isApproved: true })).data;
      }
    },
    onSuccess: () => {
      toast.success("Yorum onaylandı");
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "İşlem başarısız");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => (await apiClient.delete(`/reviews/${id}`)).data,
    onSuccess: () => {
      toast.success("Yorum silindi");
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Silme işlemi başarısız");
    },
  });

  const handleFilterChange = (f: "ALL" | "PENDING" | "APPROVED") => {
    setFilter(f);
    setCurrentPage(1);
  };

  const filtered = reviews.filter((r: any) => {
    if (filter === "PENDING") return !r.isApproved;
    if (filter === "APPROVED") return r.isApproved;
    return true;
  });

  const itemsPerPage = 20;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedReviews = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5 text-amber-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn("w-4 h-4", i < rating ? "fill-current" : "text-gray-200")}
          />
        ))}
      </div>
    );
  };

  const renderSkeletons = () => {
    return Array.from({ length: 5 }).map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="p-4">
          <div className="space-y-2">
            <div className="h-4 bg-zinc-100 rounded w-28" />
            <div className="h-3 bg-zinc-100 rounded w-40" />
          </div>
        </td>
        <td className="p-4">
          <div className="space-y-2">
            <div className="h-4 bg-zinc-100 rounded w-32" />
            <div className="h-3 bg-zinc-100 rounded w-20" />
          </div>
        </td>
        <td className="p-4">
          <div className="space-y-2">
            <div className="h-4 bg-zinc-100 rounded w-16" />
            <div className="h-3 bg-zinc-100 rounded w-48" />
          </div>
        </td>
        <td className="p-4 text-center">
          <div className="h-6 bg-zinc-100 rounded-full w-20 mx-auto" />
        </td>
        <td className="p-4 text-center">
          <div className="h-4 bg-zinc-100 rounded w-16 mx-auto" />
        </td>
        <td className="p-4 text-right">
          <div className="h-8 bg-zinc-100 rounded w-16 ml-auto" />
        </td>
      </tr>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2 justify-between items-center flex-wrap">
        <div className="flex gap-2">
          {(["ALL", "PENDING", "APPROVED"] as const).map((f) => (
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
              {f === "ALL" ? "Tüm Yorumlar" : f === "PENDING" ? "Onay Bekleyenler" : "Onaylananlar"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Toplam Yorum", value: reviews.length },
          { label: "Onay Bekleyen", value: reviews.filter((r: any) => !r.isApproved).length },
          { label: "Ortalama Puan", value: reviews.length ? (reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1) + " / 5" : "0.0" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
            <p className="text-2xl font-black text-secondary">{s.value}</p>
            <p className="text-xs text-zinc-400 font-semibold mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-zinc-50 text-xs font-bold text-zinc-500 uppercase">
                <th className="p-4">Kullanıcı</th>
                <th className="p-4">Ürün</th>
                <th className="p-4">Puan & Değerlendirme</th>
                <th className="p-4 text-center">Durum</th>
                <th className="p-4 text-center">Tarih</th>
                <th className="p-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                renderSkeletons()
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-400">
                    Yorum bulunamadı.
                  </td>
                </tr>
              ) : (
                paginatedReviews.map((rev: any) => (
                  <tr key={rev.id} className={cn("hover:bg-zinc-50/50 transition-colors", !rev.isApproved && "bg-amber-50/20")}>
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-secondary">{rev.user?.name || "Bilinmeyen Kullanıcı"}</p>
                        <p className="text-xs text-zinc-400">{rev.user?.email}</p>
                      </div>
                    </td>
                    <td className="p-4 max-w-[200px] truncate">
                      {rev.product ? (
                        <a
                          href={currentLocale === "tr" ? `/tovar/${rev.product.slug}` : `/${currentLocale}/urun/${rev.product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-primary hover:underline truncate block"
                          title={rev.product.name_tr}
                        >
                          {rev.product.name_tr}
                        </a>
                      ) : (
                        <p className="font-semibold text-zinc-400 truncate">Ürün Silinmiş</p>
                      )}
                      <p className="text-xs text-zinc-400 truncate">{rev.product?.stockCode}</p>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {renderStars(rev.rating)}
                        <p className="text-zinc-600 text-xs italic line-clamp-2" title={rev.comment}>
                          &ldquo;{rev.comment || "Yorumsuz"}&rdquo;
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold",
                          rev.isApproved
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-amber-50 text-amber-600 border border-amber-100"
                        )}
                      >
                        {rev.isApproved ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            Onaylandı
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            Onay Bekliyor
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-4 text-center text-zinc-500 text-xs">
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("tr-TR") : "-"}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        {!rev.isApproved && (
                          <button
                            onClick={() => approveMutation.mutate(rev.id)}
                            disabled={approveMutation.isPending}
                            className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors"
                            title="Onayla"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setDeleteId(rev.id)
                          }}
                          className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                          title="Sil"
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

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-zinc-50/50">
            <span className="text-xs text-zinc-500 font-semibold">
              Sayfa {currentPage} / {totalPages} (Toplam {filtered.length} yorum)
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
    
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId!)}
        title="Yorumu Sil"
        description="Bu yorumu silmek istediğinizden emin misiniz?"
      />
</div>
  );
}

"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { motion } from "framer-motion";
import { Eye, CheckCircle, Truck, Package, XCircle, Clock, Search, Filter, FileText, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { cn, getImageUrl } from "@/lib/utils";

const ORDER_STATUSES = [
  { value: "PENDING_APPROVAL", label: "Onay Bekliyor", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  { value: "APPROVED", label: "Onaylandı", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
  { value: "PREPARING", label: "Hazırlanıyor", color: "bg-indigo-100 text-indigo-700", icon: Package },
  { value: "SHIPPED", label: "Kargoya Verildi", color: "bg-purple-100 text-purple-700", icon: Truck },
  { value: "COMPLETED", label: "Tamamlandı", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  { value: "CANCELLED", label: "İptal Edildi", color: "bg-red-100 text-red-700", icon: XCircle },
];

function StatusBadge({ status }: { status: string }) {
  const s = ORDER_STATUSES.find((x) => x.value === status) || ORDER_STATUSES[0];
  const Icon = s.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold", s.color)}>
      <Icon className="w-3 h-3" />
      {s.label}
    </span>
  );
}

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("");
  const [selectedOrder, setSelectedOrder] = React.useState<any>(null);
  const [adminNote, setAdminNote] = React.useState("");
  const [newStatus, setNewStatus] = React.useState("");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const res = await apiClient.get("/orders");
      return res.data?.data || [];
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, status, adminNote }: { id: string; status: string; adminNote?: string }) => {
      const res = await apiClient.patch(`/orders/${id}`, { status, adminNote });
      return res.data?.data;
    },
    onSuccess: () => {
      toast.success("Sipariş güncellendi");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setSelectedOrder(null);
    },
    onError: () => toast.error("Güncelleme başarısız"),
  });

  const filtered = orders.filter((o: any) => {
    const matchSearch =
      !search ||
      o.id?.toLowerCase().includes(search.toLowerCase()) ||
      o.phone?.includes(search);
    const matchStatus = !filterStatus || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {ORDER_STATUSES.map((s) => {
          const count = orders.filter((o: any) => o.status === s.value).length;
          const Icon = s.icon;
          return (
            <button
              key={s.value}
              onClick={() => setFilterStatus(filterStatus === s.value ? "" : s.value)}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl border text-center transition-all",
                filterStatus === s.value ? "border-primary bg-primary/5 shadow-sm" : "bg-white border-gray-100 hover:border-gray-200"
              )}
            >
              <Icon className={cn("w-4 h-4", s.color.split(" ")[1])} />
              <span className="text-xl font-black text-secondary">{count}</span>
              <span className="text-[10px] font-semibold text-zinc-500 leading-tight">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Sipariş ID veya telefon..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-secondary focus:outline-none focus:border-primary bg-white"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-secondary bg-white focus:outline-none focus:border-primary"
        >
          <option value="">Tüm Durumlar</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-zinc-400">Yükleniyor...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-zinc-400">Sipariş bulunamadı</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Sipariş ID</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Müşteri</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Toplam</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Durum</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Tarih</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order: any) => (
                  <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-zinc-500">{order.id?.slice(0, 8)}...</td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-secondary">{order.user?.name || "—"}</p>
                        <p className="text-xs text-zinc-400">{order.phone}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-bold text-primary">{Number(order.totalAmount).toLocaleString()} KGS</td>
                    <td className="px-5 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-5 py-4 text-xs text-zinc-500">
                      {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setNewStatus(order.status);
                          setAdminNote(order.adminNote || "");
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary/5 hover:bg-secondary hover:text-white text-secondary rounded-lg text-xs font-bold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Detay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-secondary">Sipariş Detayı</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-secondary">✕</button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status + Note */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-2">Mevcut Durum</label>
                  <div className="py-1">
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-2">Müşteri Telefonu</label>
                  <input
                    value={selectedOrder.phone}
                    readOnly
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-zinc-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-2">Teslimat Adresi</label>
                <textarea
                  value={selectedOrder.address}
                  readOnly
                  rows={2}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-zinc-50 resize-none"
                />
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-bold text-zinc-500 mb-3">Sipariş Kalemleri</p>
                <div className="space-y-2">
                  {(selectedOrder.orderItems || []).map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-zinc-50 rounded-xl">
                      <span className="text-sm text-secondary">{item.productName_tr} × {item.qty}</span>
                      <span className="font-bold text-primary text-sm">{(item.price * item.qty).toLocaleString()} KGS</span>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-gray-100 mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between items-center text-zinc-500">
                    <span>Ara Toplam</span>
                    <span>{((selectedOrder.orderItems || []).reduce((sum: number, item: any) => sum + Number(item.price) * item.qty, 0)).toLocaleString()} KGS</span>
                  </div>
                  {Number(selectedOrder.discountAmount) > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 font-medium">
                      <span>Kupon İndirimi {selectedOrder.couponCode ? `(${selectedOrder.couponCode})` : ""}</span>
                      <span>-{Number(selectedOrder.discountAmount).toLocaleString()} KGS</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-zinc-500">
                    <span>Teslimat Ücreti</span>
                    <span>
                      {((selectedOrder.orderItems || []).reduce((sum: number, item: any) => sum + Number(item.price) * item.qty, 0) > 100000)
                        ? "Ücretsiz"
                        : "2,500 KGS"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200">
                    <span className="font-bold text-secondary">Toplam</span>
                    <span className="text-lg font-black text-primary">{Number(selectedOrder.totalAmount).toLocaleString()} KGS</span>
                  </div>
                </div>
              </div>

              {/* Receipt */}
              {selectedOrder.receiptPath && (
                <div>
                  <p className="text-xs font-bold text-zinc-500 mb-2">Ödeme Dekontu</p>
                  <a
                    href={getImageUrl(selectedOrder.receiptPath)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Dekontu Görüntüle
                  </a>
                </div>
              )}

              {/* Order State Transition Actions */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-gray-100 space-y-3">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Sipariş Durumunu İlerlet</p>
                <div className="flex flex-wrap gap-2">
                  {selectedOrder.status === "PENDING_APPROVAL" && (
                    <>
                      <button
                        type="button"
                        onClick={() => updateOrderMutation.mutate({ id: selectedOrder.id, status: "APPROVED", adminNote })}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Siparişi Onayla
                      </button>
                      <button
                        type="button"
                        onClick={() => updateOrderMutation.mutate({ id: selectedOrder.id, status: "CANCELLED", adminNote })}
                        className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Siparişi İptal Et
                      </button>
                    </>
                  )}
                  {selectedOrder.status === "APPROVED" && (
                    <>
                      <button
                        type="button"
                        onClick={() => updateOrderMutation.mutate({ id: selectedOrder.id, status: "PREPARING", adminNote })}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Package className="w-3.5 h-3.5" />
                        Hazırlamaya Başla
                      </button>
                      <button
                        type="button"
                        onClick={() => updateOrderMutation.mutate({ id: selectedOrder.id, status: "CANCELLED", adminNote })}
                        className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Siparişi İptal Et
                      </button>
                    </>
                  )}
                  {selectedOrder.status === "PREPARING" && (
                    <>
                      <button
                        type="button"
                        onClick={() => updateOrderMutation.mutate({ id: selectedOrder.id, status: "SHIPPED", adminNote })}
                        className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Kargoya Ver
                      </button>
                      <button
                        type="button"
                        onClick={() => updateOrderMutation.mutate({ id: selectedOrder.id, status: "CANCELLED", adminNote })}
                        className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Siparişi İptal Et
                      </button>
                    </>
                  )}
                  {selectedOrder.status === "SHIPPED" && (
                    <>
                      <button
                        type="button"
                        onClick={() => updateOrderMutation.mutate({ id: selectedOrder.id, status: "COMPLETED", adminNote })}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Siparişi Tamamla
                      </button>
                      <button
                        type="button"
                        onClick={() => updateOrderMutation.mutate({ id: selectedOrder.id, status: "CANCELLED", adminNote })}
                        className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Siparişi İptal Et
                      </button>
                    </>
                  )}
                  {(selectedOrder.status === "COMPLETED" || selectedOrder.status === "CANCELLED") && (
                    <span className="text-xs text-muted-foreground italic font-semibold">Bu sipariş tamamlandı veya iptal edildiği için durum güncellemesi yapılamaz.</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-2">Admin Notu</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={2}
                  placeholder="Müşteriye veya iç not..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold text-secondary hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Kapat
                </button>
                <button
                  type="button"
                  onClick={() => updateOrderMutation.mutate({ id: selectedOrder.id, status: selectedOrder.status, adminNote })}
                  disabled={updateOrderMutation.isPending}
                  className="flex-1 px-4 py-3 bg-secondary hover:bg-secondary-dark text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {updateOrderMutation.isPending ? "Kaydediliyor..." : "Sadece Notu Kaydet"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

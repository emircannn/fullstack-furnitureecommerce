"use client";

import React from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Mail, Phone, Calendar, Search, Eye, X, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = React.useState<ContactMessage | null>(null);

  // Queries
  const { data: messages = [], isLoading } = useQuery<ContactMessage[]>({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const res = await apiClient.get("/contact");
      return res.data?.data || [];
    },
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/contact/${id}`);
    },
    onSuccess: () => {
      toast.success("Mesaj başarıyla silindi");
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      if (selectedMessage) setSelectedMessage(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Mesaj silinemedi");
    },
  });

  const filteredMessages = React.useMemo(() => {
    return messages.filter(
      (m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        (m.phone && m.phone.includes(search)) ||
        m.message.toLowerCase().includes(search.toLowerCase())
    );
  }, [messages, search]);

  const handleDelete = (id: string) => {
    setDeleteId(id)
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-secondary">Gelen Kutusu</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Kullanıcıların iletişim sayfasından gönderdiği tüm mesajlar.</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Mesajlarda ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-xl text-xs text-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-white"
          />
        </div>
      </div>

      {/* List Container */}
      <Card className="rounded-3xl border border-zinc-100 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-16 text-zinc-400 text-sm">Mesajlar yükleniyor...</div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-16 text-zinc-400 text-sm">Görüntülenecek mesaj bulunmamaktadır.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/50 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Gönderen</th>
                    <th className="py-4 px-6">İletişim</th>
                    <th className="py-4 px-6">Mesaj Özeti</th>
                    <th className="py-4 px-6">Tarih</th>
                    <th className="py-4 px-6 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {filteredMessages.map((m) => (
                    <tr key={m.id} className="hover:bg-zinc-50/20 transition-colors group">
                      {/* Name / User */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-secondary">{m.name}</span>
                            <span className="block text-[10px] text-zinc-400">Ziyaretçi</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-6 text-xs text-secondary">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-zinc-500">
                            <Mail className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{m.email}</span>
                          </div>
                          {m.phone && (
                            <div className="flex items-center gap-1.5 text-zinc-500">
                              <Phone className="w-3.5 h-3.5 text-zinc-400" />
                              <span>{m.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Message excerpt */}
                      <td className="py-4 px-6 text-xs text-zinc-600 max-w-xs truncate">
                        {m.message}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-xs text-zinc-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{new Date(m.createdAt).toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedMessage(m)}
                            className="p-1.5 hover:bg-zinc-100 text-zinc-500 rounded-lg transition-colors border border-transparent hover:border-zinc-200"
                            title="Oku"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(m.id)}
                            className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Read Message Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <div className="fixed inset-0 bg-secondary/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full border border-zinc-100 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {selectedMessage.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-secondary">{selectedMessage.name}</h4>
                    <span className="text-[10px] text-zinc-400">Gelen Mesaj Detayı</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                  <div className="space-y-1">
                    <span className="text-zinc-400 font-bold block uppercase text-[9px] tracking-wider">E-posta</span>
                    <a href={`mailto:${selectedMessage.email}`} className="font-semibold text-secondary hover:underline break-all">{selectedMessage.email}</a>
                  </div>
                  {selectedMessage.phone && (
                    <div className="space-y-1">
                      <span className="text-zinc-400 font-bold block uppercase text-[9px] tracking-wider">Telefon</span>
                      <a href={`tel:${selectedMessage.phone}`} className="font-semibold text-secondary hover:underline">{selectedMessage.phone}</a>
                    </div>
                  )}
                  <div className="col-span-2 border-t border-zinc-200/50 pt-2.5 space-y-1">
                    <span className="text-zinc-400 font-bold block uppercase text-[9px] tracking-wider">Gönderim Tarihi</span>
                    <span className="font-semibold text-secondary">
                      {new Date(selectedMessage.createdAt).toLocaleString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Message Content */}
                <div className="space-y-1.5">
                  <span className="text-zinc-400 font-bold block uppercase text-[9px] tracking-wider">Mesaj</span>
                  <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-xs text-secondary leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto font-medium">
                    {selectedMessage.message}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-2.5">
                <Button
                  onClick={() => setSelectedMessage(null)}
                  variant="outline"
                  className="rounded-xl border-zinc-200 font-bold text-xs"
                >
                  Kapat
                </Button>
                <Button
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs"
                >
                  Mesajı Sil
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId!)}
        title="Mesajı Sil"
        description="Bu mesajı silmek istediğinizden emin misiniz?"
      />
</div>
  );
}

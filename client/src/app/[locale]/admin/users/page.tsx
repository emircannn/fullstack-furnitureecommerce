"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { motion } from "framer-motion";
import { Search, Shield, User, ToggleLeft, ToggleRight, X, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UserUpdateForm {
  role: "ADMIN" | "CUSTOMER";
  isActive: boolean;
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<"ALL" | "ADMIN" | "CUSTOMER">("ALL");
  const [editingUser, setEditingUser] = React.useState<any | null>(null);
  const [form, setForm] = React.useState<UserUpdateForm>({ role: "CUSTOMER", isActive: true });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await apiClient.get("/users");
      return res.data?.data || [];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UserUpdateForm> }) =>
      (await apiClient.patch(`/users/${id}`, data)).data,
    onSuccess: () => {
      toast.success("Kullanıcı güncellendi");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditingUser(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Güncelleme başarısız");
    },
  });

  const openEdit = (user: any) => {
    setEditingUser(user);
    setForm({
      role: user.role || "CUSTOMER",
      isActive: user.isActive ?? true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    updateMutation.mutate({ id: editingUser.id, data: form });
  };

  const handleToggleActive = (user: any) => {
    updateMutation.mutate({
      id: user.id,
      data: { isActive: !user.isActive },
    });
  };

  const filtered = users.filter((u: any) => {
    const matchesSearch =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "ALL" ||
      u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar & Filters */}
      <div className="flex gap-3 flex-wrap items-center justify-between">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ad, e-posta veya telefon ile ara..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-secondary focus:outline-none focus:border-primary bg-white"
          />
        </div>
        <div className="flex gap-2">
          {(["ALL", "ADMIN", "CUSTOMER"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-bold transition-all border",
                roleFilter === r
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white text-zinc-500 border-gray-200 hover:bg-zinc-50"
              )}
            >
              {r === "ALL" ? "Tümü" : r === "ADMIN" ? "Yöneticiler" : "Müşteriler"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Toplam Kullanıcı", value: users.length },
          { label: "Aktif Kullanıcı", value: users.filter((u: any) => u.isActive).length },
          { label: "Yönetici (Admin)", value: users.filter((u: any) => u.role === "ADMIN").length },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
            <p className="text-2xl font-black text-secondary">{s.value}</p>
            <p className="text-xs text-zinc-400 font-semibold mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="text-center py-12 text-zinc-400">Yükleniyor...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-zinc-50 text-xs font-bold text-zinc-500 uppercase">
                  <th className="p-4">Kullanıcı</th>
                  <th className="p-4">İletişim</th>
                  <th className="p-4 text-center">Rol</th>
                  <th className="p-4 text-center">Kayıt Tarihi</th>
                  <th className="p-4 text-center">Durum</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-400">
                      Kullanıcı bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user: any) => (
                    <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold shrink-0">
                            {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-secondary">{user.name}</p>
                            <p className="text-xs text-zinc-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-zinc-600">
                        {user.phone || "-"}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold",
                            user.role === "ADMIN"
                              ? "bg-purple-50 text-purple-600 border border-purple-100"
                              : "bg-blue-50 text-blue-600 border border-blue-100"
                          )}
                        >
                          {user.role === "ADMIN" ? (
                            <>
                              <Shield className="w-3 h-3" />
                              Admin
                            </>
                          ) : (
                            "Müşteri"
                          )}
                        </span>
                      </td>
                      <td className="p-4 text-center text-zinc-500 text-xs">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString("tr-TR") : "-"}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(user)}
                          className="text-zinc-600 transition-colors focus:outline-none"
                        >
                          {user.isActive ? (
                            <ToggleRight className="w-8 h-8 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="w-8 h-8 text-zinc-300" />
                          )}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => openEdit(user)}
                          className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-secondary">Kullanıcı Düzenle</h3>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase">Kullanıcı Bilgileri</p>
                <p className="font-bold text-secondary mt-1">{editingUser.name}</p>
                <p className="text-sm text-zinc-500">{editingUser.email}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">Rol *</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as any })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-white text-secondary"
                >
                  <option value="CUSTOMER">Müşteri</option>
                  <option value="ADMIN">Yönetici (Admin)</option>
                </select>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-sm font-semibold text-secondary">Hesap Durumu (Aktif)</span>
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
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold text-secondary hover:bg-zinc-50">İptal</button>
                <button type="submit" disabled={updateMutation.isPending} className="flex-1 px-4 py-3 bg-primary hover:bg-primary/95 text-white rounded-xl text-sm font-bold disabled:opacity-60">
                  {updateMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

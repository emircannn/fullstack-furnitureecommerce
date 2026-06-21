"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { motion } from "framer-motion";
import { Save, Edit2, Check, X, Settings, HelpCircle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { cn, getImageUrl } from "@/lib/utils";
import { ImageUpload } from "@/components/admin/image-upload";

interface SettingItem {
  key: string;
  value: string;
}

const defaultKeys = [
  { key: "site_name", label: "Site Adı", desc: "Sitenin tarayıcı başlığında ve marka alanlarında gösterilen adı." },
  { key: "site_phone", label: "İletişim Telefonu", desc: "Müşteri hizmetleri ve iletişim sayfalarında görüntülenecek telefon numarası." },
  { key: "site_email", label: "İletişim E-Posta", desc: "Sistem bildirimleri ve iletişim formlarında kullanılacak e-posta adresi." },
  { key: "site_address", label: "Fiziksel Adres", desc: "Şirket adresi ve fatura bilgileri için fiziksel adres." },
  { key: "site_address_link", label: "Fiziksel Adres Harita Linki", desc: "Fiziksel adrese tıklandığında açılacak harita (Google Maps, Yandex vb.) linki." },
  { key: "whatsapp_number", label: "WhatsApp Hattı", desc: "WhatsApp destek butonu için yönlendirilecek numara (örn. 996555123456)." },
  { key: "facebook_url", label: "Facebook Linki", desc: "Alt bilgide (footer) gösterilecek Facebook sayfa adresi." },
  { key: "instagram_url", label: "Instagram Linki", desc: "Alt bilgide (footer) gösterilecek Instagram sayfa adresi." },
  { key: "twitter_url", label: "Twitter Linki", desc: "Alt bilgide (footer) gösterilecek Twitter sayfa adresi." },
  { key: "bank_transfer_name", label: "Banka Adı", desc: "Banka havalesi için kullanılacak bankanın adı." },
  { key: "bank_transfer_holder", label: "Hesap Sahibi", desc: "Banka havalesi için alıcı hesap sahibi adı." },
  { key: "bank_transfer_iban", label: "Hesap Numarası / IBAN", desc: "Banka havalesi transferi için hesap numarası veya IBAN." },
  { key: "payment_qr_code", label: "Ödeme QR Kodu", desc: "Ödeme sayfasında gösterilecek MBank / Elsom QR kodu görseli." },
  { key: "min_free_shipping_limit", label: "Ücretsiz Teslimat Alt Limiti (KGS)", desc: "Kargo/teslimat ücretinin ücretsiz olması için gerekli sepet tutarı (varsayılan: 100000)." },
];

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [editingKey, setEditingKey] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState("");

  const { data: settings = [], isLoading } = useQuery<SettingItem[]>({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const res = await apiClient.get("/settings");
      return res.data?.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      try {
        // endpoint POST or PATCH /settings
        return (await apiClient.post("/settings", { key, value })).data;
      } catch {
        return (await apiClient.patch(`/settings/${key}`, { value })).data;
      }
    },
    onSuccess: () => {
      toast.success("Ayar başarıyla güncellendi");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      setEditingKey(null);
      setEditValue("");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Ayar güncellenemedi");
    },
  });

  const handleStartEdit = (key: string, currentVal: string) => {
    setEditingKey(key);
    setEditValue(currentVal);
  };

  const handleSave = (key: string) => {
    saveMutation.mutate({ key, value: editValue });
  };

  const getSettingValue = (key: string) => {
    const found = settings.find((s) => s.key === key);
    return found ? found.value : "";
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div>
        <h3 className="text-base font-bold text-secondary">Genel Sistem Ayarları</h3>
        <p className="text-xs text-zinc-400 mt-0.5">Sitenin iletişim bilgileri ve genel konfigürasyonlarını buradan yönetin.</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-zinc-400">Yükleniyor...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
          {defaultKeys.map((item) => {
            const currentVal = getSettingValue(item.key);
            const isEditing = editingKey === item.key;

            return (
              <div key={item.key} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-50/30 transition-colors">
                {/* Text Desc */}
                <div className="flex-1 space-y-1">
                  <span className="text-sm font-bold text-secondary">{item.label}</span>
                  <span className="block text-xs font-mono text-zinc-400">{item.key}</span>
                  <p className="text-xs text-zinc-500 max-w-xl">{item.desc}</p>
                </div>

                {/* Edit Form / Value Display */}
                <div className="flex items-center gap-3 w-full md:w-auto md:min-w-[320px] justify-end">
                  {isEditing ? (
                    <div className="flex gap-2 w-full items-center">
                      {item.key === "site_address" ? (
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          rows={2}
                          className="flex-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-xs text-secondary focus:outline-none focus:border-primary resize-none"
                        />
                      ) : item.key === "payment_qr_code" ? (
                        <div className="flex-1 min-w-[200px]">
                          <ImageUpload
                            value={editValue}
                            onChange={(url) => setEditValue(url as string)}
                            type="sliders"
                          />
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-xs text-secondary focus:outline-none focus:border-primary"
                        />
                      )}
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => handleSave(item.key)}
                          disabled={saveMutation.isPending}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors border border-emerald-200"
                          title="Kaydet"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingKey(null)}
                          className="p-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-500 rounded-lg transition-colors border border-zinc-200"
                          title="İptal"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full bg-zinc-50/50 p-3 rounded-xl border border-zinc-100 gap-6">
                      {item.key === "payment_qr_code" && currentVal ? (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border shrink-0">
                          <img src={getImageUrl(currentVal)} alt="QR Code" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-secondary max-w-[200px] truncate block" title={currentVal}>
                          {currentVal || <span className="text-zinc-400 italic font-normal">Değer girilmemiş</span>}
                        </span>
                      )}
                      <button
                        onClick={() => handleStartEdit(item.key, currentVal)}
                        className="p-1.5 bg-white hover:bg-zinc-100 border border-gray-200 text-zinc-500 rounded-lg transition-colors shrink-0"
                        title="Düzenle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3 text-blue-800">
        <HelpCircle className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold">Önemli Bilgi</p>
          <p className="text-blue-700">
            Burada yaptığınız değişiklikler doğrudan veritabanında depolanır ve sitenin üst bilgi (header), alt bilgi (footer) ve iletişim gibi sayfalarında anlık olarak güncellenir.
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { motion } from "framer-motion";
import { DollarSign, ShoppingBag, Package, Users, ArrowUpRight, ArrowDownRight, Clock, Eye, AlertCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface MonthlyData {
  name: string;
  Gelir: number;
  Gider: number;
}

function DashboardChart({ data }: { data: MonthlyData[] }) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-zinc-400">
        Grafik için yeterli veri bulunamadı.
      </div>
    );
  }

  const svgWidth = 600;
  const svgHeight = 240;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Max value calculation, ensure it's at least 1000 to avoid division by zero
  const maxVal = Math.max(...data.map((d) => Math.max(d.Gelir || 0, d.Gider || 0, 1000))) * 1.15;

  // Compute coordinate points
  const points = data.map((d, i) => {
    const x = paddingLeft + i * (chartWidth / (data.length - 1 || 1));
    const yGelir = paddingTop + chartHeight - ((d.Gelir || 0) / maxVal) * chartHeight;
    const yGider = paddingTop + chartHeight - ((d.Gider || 0) / maxVal) * chartHeight;
    return { x, yGelir, yGider, ...d };
  });

  // Gelir path
  const pathGelir = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.yGelir}`).join(" ");
  const areaGelir = `${pathGelir} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

  // Gider path
  const pathGider = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.yGider}`).join(" ");
  const areaGider = `${pathGider} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

  // Generate Y axis ticks (5 ticks)
  const ticksCount = 5;
  const yTicks = Array.from({ length: ticksCount }).map((_, i) => {
    const value = (maxVal / (ticksCount - 1)) * i;
    const y = paddingTop + chartHeight - (value / maxVal) * chartHeight;
    return { value, y };
  });

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val.toString();
  };

  return (
    <div className="relative w-full h-full select-none">
      {/* Tooltip Overlay */}
      {hoveredIndex !== null && (
        <div
          className="absolute z-10 bg-secondary text-white p-3 rounded-xl shadow-xl text-xs border border-zinc-700 pointer-events-none transition-all duration-150 flex flex-col gap-1 min-w-[140px]"
          style={{
            left: `${(points[hoveredIndex].x / svgWidth) * 100}%`,
            top: "10px",
            transform: hoveredIndex > data.length / 2 - 1 ? "translateX(-110%)" : "translateX(10%)",
          }}
        >
          <p className="font-bold border-b border-zinc-700 pb-1 mb-1 text-zinc-300">
            {points[hoveredIndex].name}
          </p>
          <div className="flex justify-between items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Gelir:
            </span>
            <span className="font-black text-emerald-400">
              {Number(points[hoveredIndex].Gelir).toLocaleString()} KGS
            </span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Gider:
            </span>
            <span className="font-black text-rose-400">
              {Number(points[hoveredIndex].Gider).toLocaleString()} KGS
            </span>
          </div>
          <div className="flex justify-between items-center gap-4 border-t border-zinc-700 pt-1 mt-1">
            <span className="flex items-center gap-1.5 font-bold text-zinc-400">
              Net Kâr:
            </span>
            <span className={cn(
              "font-black",
              points[hoveredIndex].Gelir - points[hoveredIndex].Gider >= 0 ? "text-emerald-400" : "text-rose-400"
            )}>
              {(points[hoveredIndex].Gelir - points[hoveredIndex].Gider).toLocaleString()} KGS
            </span>
          </div>
        </div>
      )}

      {/* SVG Chart */}
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full">
        <defs>
          <linearGradient id="gradientGelir" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="gradientGider" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid Lines & Y Axis Labels */}
        {yTicks.map((tick, i) => (
          <g key={i} className="opacity-40">
            <line
              x1={paddingLeft}
              y1={tick.y}
              x2={svgWidth - paddingRight}
              y2={tick.y}
              stroke="#e4e4e7"
              strokeWidth="1"
              strokeDasharray={i === 0 ? "0" : "4 4"}
            />
            <text
              x={paddingLeft - 8}
              y={tick.y + 4}
              textAnchor="end"
              className="text-[10px] fill-zinc-400 font-bold font-mono"
            >
              {formatCurrency(tick.value)}
            </text>
          </g>
        ))}

        {/* Areas */}
        <path d={areaGelir} fill="url(#gradientGelir)" />
        <path d={areaGider} fill="url(#gradientGider)" />

        {/* Lines */}
        <path
          d={pathGelir}
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={pathGider}
          fill="none"
          stroke="#f43f5e"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* X Axis Labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={svgHeight - 12}
            textAnchor="middle"
            className="text-[10px] fill-zinc-400 font-semibold"
          >
            {p.name}
          </text>
        ))}

        {/* Hover Guide & Highlighted Dots */}
        {hoveredIndex !== null && (
          <g>
            <line
              x1={points[hoveredIndex].x}
              y1={paddingTop}
              x2={points[hoveredIndex].x}
              y2={paddingTop + chartHeight}
              stroke="#e4e4e7"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            {/* Gelir Highlight */}
            <circle
              cx={points[hoveredIndex].x}
              cy={points[hoveredIndex].yGelir}
              r="5"
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            {/* Gider Highlight */}
            <circle
              cx={points[hoveredIndex].x}
              cy={points[hoveredIndex].yGider}
              r="5"
              fill="#f43f5e"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          </g>
        )}

        {/* Interactive Hover Zones */}
        {points.map((p, i) => {
          const zoneWidth = chartWidth / (data.length - 1 || 1);
          return (
            <rect
              key={i}
              x={p.x - zoneWidth / 2}
              y={paddingTop}
              width={zoneWidth}
              height={chartHeight}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          );
        })}
      </svg>
    </div>
  );
}

export default function AdminDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const currentLocale = (params?.locale as string) || "tr";

  // 1. Fetch dashboard stats
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const res = await apiClient.get("/dashboard/stats");
      return res.data?.data || null;
    },
  });

  // 2. Fetch recent orders
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: async () => {
      const res = await apiClient.get("/orders");
      return res.data?.data || [];
    },
  });

  const recentOrders = React.useMemo(() => {
    return orders.slice(0, 5);
  }, [orders]);

  const cards = [
    {
      title: "Toplam Ciro",
      value: statsData ? `${Number(statsData.totalSales).toLocaleString()} KGS` : "0 KGS",
      subtext: "Tamamlanan sipariş tutarı",
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-100/50",
    },
    {
      title: "Yeni Siparişler",
      value: statsData ? String(statsData.totalOrders) : "0",
      subtext: statsData ? `${statsData.pendingOrders} adet onay bekliyor` : "0 onay bekliyor",
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-100/50",
    },
    {
      title: "Aktif Ürünler",
      value: statsData ? String(statsData.totalProducts) : "0",
      subtext: "Katalogdaki toplam ürün",
      icon: Package,
      color: "text-orange-600",
      bg: "bg-orange-50 border-orange-100/50",
    },
    {
      title: "Kayıtlı Kullanıcı",
      value: statsData ? String(statsData.totalCustomers) : "0",
      subtext: "Aktif müşteri hesapları",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50 border-purple-100/50",
    },
  ];

  const renderSkeletons = () => {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 bg-zinc-100 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-zinc-100 rounded w-16" />
                <div className="h-6 bg-zinc-100 rounded w-24" />
                <div className="h-3 bg-zinc-100 rounded w-32" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 h-96">
            <div className="h-6 bg-zinc-100 rounded w-48 mb-6" />
            <div className="h-64 bg-zinc-50 rounded-xl" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="h-6 bg-zinc-100 rounded w-32 mb-6" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center py-2">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-100" />
                    <div className="space-y-2">
                      <div className="h-3.5 bg-zinc-100 rounded w-24" />
                      <div className="h-3 bg-zinc-100 rounded w-16" />
                    </div>
                  </div>
                  <div className="h-4 bg-zinc-100 rounded w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoadingStats || isLoadingOrders) {
    return renderSkeletons();
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex justify-between items-center bg-gradient-to-r from-[#191833] to-[#25234c] text-white p-6 rounded-2xl shadow-md">
        <div>
          <h2 className="text-xl font-black">Yönetim Paneli Genel Bakış</h2>
          <p className="text-xs text-zinc-300 mt-1 font-medium">Belenay Mobilya mağazanızın gerçek zamanlı finansal ve operasyonel durumu.</p>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#e75f0d] block">Saat Dilimi</span>
          <span className="text-sm font-bold font-mono">Bishkek (UTC+6)</span>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {cards.map((card, i) => (
          <div 
            key={i} 
            className={cn(
              "bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-4 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5",
              card.bg
            )}
          >
            <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-white shadow-sm border border-zinc-100", card.color)}>
              <card.icon className="w-7 h-7" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide truncate">{card.title}</p>
              <p className="text-xl font-black text-secondary mt-0.5 truncate">{card.value}</p>
              <p className="text-[10px] text-zinc-400 font-semibold mt-1 truncate">{card.subtext}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Chart & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Accounting Sales/Expense Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-secondary">Gelir / Gider Grafiği</h3>
              <p className="text-[11px] text-zinc-400 font-medium mt-0.5">Son 6 aya ait muhasebe kasa giriş ve çıkışları</p>
            </div>
            <div className="flex gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-zinc-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Gelir
              </span>
              <span className="flex items-center gap-1.5 text-zinc-500">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Gider
              </span>
            </div>
          </div>

          <div className="w-full flex-1 min-h-[220px]">
            <DashboardChart data={statsData?.monthlyAnalytics || []} />
          </div>
        </motion.div>

        {/* Recent Orders List */}
        <motion.div 
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-secondary">Son Siparişler</h3>
              <p className="text-[11px] text-zinc-400 font-medium mt-0.5">En son alınan 5 sipariş</p>
            </div>
            <button 
              onClick={() => router.push(`/${currentLocale}/admin/orders`)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              Tümünü Gör
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto">
            {recentOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 py-12">
                <AlertCircle className="w-8 h-8 text-zinc-300 mb-2" />
                <p className="text-xs font-semibold">Henüz sipariş bulunmuyor</p>
              </div>
            ) : (
              recentOrders.map((order: any) => {
                const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString("tr-TR") : "-";
                // Simple status display matching the order module status badges
                const statusMap: Record<string, { label: string; color: string }> = {
                  PENDING_APPROVAL: { label: "Onay Bekliyor", color: "bg-yellow-50 text-yellow-600 border border-yellow-100" },
                  APPROVED: { label: "Onaylandı", color: "bg-blue-50 text-blue-600 border border-blue-100" },
                  PREPARING: { label: "Hazırlanıyor", color: "bg-indigo-50 text-indigo-600 border border-indigo-100" },
                  SHIPPED: { label: "Kargoda", color: "bg-purple-50 text-purple-600 border border-purple-100" },
                  COMPLETED: { label: "Tamamlandı", color: "bg-emerald-50 text-emerald-600 border border-emerald-100" },
                  CANCELLED: { label: "İptal", color: "bg-red-50 text-red-600 border border-red-100" },
                };
                const status = statusMap[order.status] || { label: order.status || "Bilinmiyor", color: "bg-zinc-100 text-zinc-600" };

                return (
                  <div 
                    key={order.id} 
                    onClick={() => router.push(`/${currentLocale}/admin/orders`)}
                    className="flex items-center justify-between p-3 border border-gray-50 hover:border-primary/20 hover:bg-zinc-50/50 rounded-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0">
                        <ShoppingBag className="w-5 h-5 text-zinc-500 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-secondary truncate">
                          {order.user?.name || "Ziyaretçi Siparişi"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-zinc-400 font-semibold">{date}</span>
                          <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-black", status.color)}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-secondary">
                        {Number(order.totalAmount).toLocaleString()} KGS
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}


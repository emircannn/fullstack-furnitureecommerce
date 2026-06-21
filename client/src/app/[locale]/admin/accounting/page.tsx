"use client";

import React from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { motion } from "framer-motion";
import { Plus, Wallet, ArrowUpRight, ArrowDownRight, Users, ToggleLeft, ToggleRight, X, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TransactionForm {
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: string;
  description: string;
  date: string;
  employeeId?: string;
}

interface EmployeeForm {
  name: string;
  monthlySalary: string;
  isActive: boolean;
}

export default function AdminAccountingPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<"TRANSACTIONS" | "EMPLOYEES">("TRANSACTIONS");
  const [deleteTxId, setDeleteTxId] = React.useState<string | null>(null);
  const [showTxForm, setShowTxForm] = React.useState(false);
  const [showEmpForm, setShowEmpForm] = React.useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = React.useState<string | null>(null);

  const [filterRange, setFilterRange] = React.useState<"ALL" | "MONTH" | "3MONTH" | "6MONTH" | "YEAR" | "CUSTOM">("ALL");
  const [customStartDate, setCustomStartDate] = React.useState("");
  const [customEndDate, setCustomEndDate] = React.useState("");
  const [filterEmployeeId, setFilterEmployeeId] = React.useState("");
  const [selectedLedgerEmployee, setSelectedLedgerEmployee] = React.useState<any | null>(null);

  const [txForm, setTxForm] = React.useState<TransactionForm>({
    type: "EXPENSE",
    category: "MATERIAL",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    employeeId: "",
  });

  const [empForm, setEmpForm] = React.useState<EmployeeForm>({
    name: "",
    monthlySalary: "",
    isActive: true,
  });

  const queryParams = React.useMemo(() => {
    const params: any = {};
    if (filterEmployeeId) {
      params.employeeId = filterEmployeeId;
    }

    if (filterRange === "ALL") {
      return params;
    }

    const now = new Date();
    let start: Date | null = null;
    const end = new Date();

    if (filterRange === "MONTH") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (filterRange === "3MONTH") {
      start = new Date();
      start.setMonth(start.getMonth() - 3);
    } else if (filterRange === "6MONTH") {
      start = new Date();
      start.setMonth(start.getMonth() - 6);
    } else if (filterRange === "YEAR") {
      start = new Date(now.getFullYear(), 0, 1);
    } else if (filterRange === "CUSTOM") {
      if (customStartDate) params.startDate = customStartDate;
      if (customEndDate) params.endDate = customEndDate;
      return params;
    }

    if (start) {
      params.startDate = start.toISOString().split("T")[0];
      params.endDate = end.toISOString().split("T")[0];
    }
    return params;
  }, [filterRange, customStartDate, customEndDate, filterEmployeeId]);

  const { data: transactions = [], isLoading: isLoadingTx } = useQuery({
    queryKey: ["admin-transactions", queryParams],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/accounting", { params: queryParams });
        return res.data?.data || [];
      } catch {
        return [];
      }
    },
  });

  const { data: employees = [], isLoading: isLoadingEmp } = useQuery({
    queryKey: ["admin-employees"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/accounting/employees");
        return res.data?.data || [];
      } catch {
        return [];
      }
    },
  });

  const { data: ledgerEmployeeDetails, isLoading: isLoadingLedger } = useQuery({
    queryKey: ["admin-employee-ledger", selectedLedgerEmployee?.id],
    queryFn: async () => {
      if (!selectedLedgerEmployee?.id) return null;
      const res = await apiClient.get(`/accounting/employees/${selectedLedgerEmployee.id}`);
      return res.data?.data || null;
    },
    enabled: !!selectedLedgerEmployee?.id,
  });

  const addTxMutation = useMutation({
    mutationFn: async (data: any) => (await apiClient.post("/accounting", data)).data,
    onSuccess: () => {
      toast.success("İşlem başarıyla kaydedildi");
      queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-employees"] });
      setShowTxForm(false);
      setTxForm({
        type: "EXPENSE",
        category: "MATERIAL",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        employeeId: "",
      });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Kayıt başarısız");
    },
  });

  const deleteTxMutation = useMutation({
    mutationFn: async (id: string) => (await apiClient.delete(`/accounting/${id}`)).data,
    onSuccess: () => {
      toast.success("İşlem başarıyla silindi");
      queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-employees"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Silme işlemi başarısız");
    },
  });

  const saveEmpMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingEmployeeId) {
        return (await apiClient.patch(`/accounting/employees/${editingEmployeeId}`, data)).data;
      }
      return (await apiClient.post("/accounting/employees", data)).data;
    },
    onSuccess: () => {
      toast.success(editingEmployeeId ? "Çalışan güncellendi" : "Çalışan eklendi");
      queryClient.invalidateQueries({ queryKey: ["admin-employees"] });
      setShowEmpForm(false);
      setEditingEmployeeId(null);
      setEmpForm({ name: "", monthlySalary: "", isActive: true });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "İşlem başarısız");
    },
  });

  const toggleEmpActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      (await apiClient.patch(`/accounting/employees/${id}`, { isActive })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-employees"] }),
  });

  // Totals calculations
  const totalIncome = transactions
    .filter((t: any) => t.type === "INCOME")
    .reduce((acc: number, t: any) => acc + Number(t.amount || 0), 0);

  const totalExpense = transactions
    .filter((t: any) => t.type === "EXPENSE")
    .reduce((acc: number, t: any) => acc + Number(t.amount || 0), 0);

  const netProfit = totalIncome - totalExpense;

  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      ...txForm,
      amount: parseFloat(txForm.amount) || 0,
      date: txForm.date,
    };
    if (txForm.category !== "EMPLOYEE_SALARY") {
      payload.employeeId = null;
    } else if (!txForm.employeeId) {
      toast.error("Lütfen ödeme yapılan personeli seçin");
      return;
    }
    addTxMutation.mutate(payload);
  };

  const handleEmpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveEmpMutation.mutate({
      ...empForm,
      monthlySalary: parseFloat(empForm.monthlySalary) || 0,
    });
  };

  const openEditEmployee = (emp: any) => {
    setEditingEmployeeId(emp.id);
    setEmpForm({
      name: emp.name || "",
      monthlySalary: String(emp.monthlySalary || ""),
      isActive: emp.isActive ?? true,
    });
    setShowEmpForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 shrink-0">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400">Toplam Gelir</p>
            <p className="text-xl font-black text-secondary">{totalIncome.toLocaleString()} KGS</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-rose-50 text-rose-500 shrink-0">
            <ArrowDownRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400">Toplam Gider</p>
            <p className="text-xl font-black text-secondary">{totalExpense.toLocaleString()} KGS</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", netProfit >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500")}>
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400">Net Kâr / Zarar</p>
            <p className={cn("text-xl font-black", netProfit >= 0 ? "text-emerald-600" : "text-rose-500")}>
              {netProfit.toLocaleString()} KGS
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b border-gray-100 pb-3 justify-between items-center flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("TRANSACTIONS")}
            className={cn(
              "px-4 py-2.5 rounded-xl text-xs font-bold transition-all border",
              activeTab === "TRANSACTIONS"
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-zinc-500 border-gray-200 hover:bg-zinc-50"
            )}
          >
            İşlemler (Gelir / Gider)
          </button>
          <button
            onClick={() => setActiveTab("EMPLOYEES")}
            className={cn(
              "px-4 py-2.5 rounded-xl text-xs font-bold transition-all border",
              activeTab === "EMPLOYEES"
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-zinc-500 border-gray-200 hover:bg-zinc-50"
            )}
          >
            Çalışanlar & Maaş
          </button>
        </div>

        <div>
          {activeTab === "TRANSACTIONS" ? (
            <button
              onClick={() => setShowTxForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Yeni İşlem Ekle
            </button>
          ) : (
            <button
              onClick={() => { setShowEmpForm(true); setEditingEmployeeId(null); setEmpForm({ name: "", monthlySalary: "", isActive: true }); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition-colors"
            >
              <Users className="w-4 h-4" />
              Yeni Çalışan Ekle
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {activeTab === "TRANSACTIONS" ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-wrap gap-4 items-end shadow-sm">
            <div className="flex flex-col gap-1.5 min-w-[150px]">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tarih Aralığı</label>
              <select
                value={filterRange}
                onChange={(e) => setFilterRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary bg-white text-secondary"
              >
                <option value="ALL">Tüm Tarihler</option>
                <option value="MONTH">Bu Ay</option>
                <option value="3MONTH">Son 3 Ay</option>
                <option value="6MONTH">Son 6 Ay</option>
                <option value="YEAR">Bu Yıl</option>
                <option value="CUSTOM">Özel Tarih Aralığı</option>
              </select>
            </div>

            {filterRange === "CUSTOM" && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Başlangıç</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary text-secondary"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Bitiş</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary text-secondary"
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-1.5 min-w-[180px]">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Personel Filtresi</label>
              <select
                value={filterEmployeeId}
                onChange={(e) => setFilterEmployeeId(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary bg-white text-secondary"
              >
                <option value="">Tüm Çalışanlar</option>
                {employees.map((emp: any) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
          </div>

          {isLoadingTx ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-zinc-400 animate-pulse">
              Veriler yükleniyor...
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-zinc-50 text-xs font-bold text-zinc-500 uppercase">
                      <th className="p-4">Türü</th>
                      <th className="p-4">Kategori</th>
                      <th className="p-4">Açıklama</th>
                      <th className="p-4 text-center">Tarih</th>
                      <th className="p-4 text-right">Tutar</th>
                      <th className="p-4 text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-zinc-400">
                          İşlem kaydı bulunamadı.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx: any) => (
                        <tr key={tx.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="p-4">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border",
                                tx.type === "INCOME"
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                  : "bg-rose-50 text-rose-500 border-rose-100"
                              )}
                            >
                              {tx.type === "INCOME" ? "Gelir" : "Gider"}
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-secondary">
                            {tx.category === "EMPLOYEE_SALARY" ? (
                              <span>
                                Personel Maaşı {tx.employee ? `(${tx.employee.name})` : ""}
                              </span>
                            ) : tx.category === "TAX" ? (
                              "Vergi / Harç"
                            ) : tx.category === "MATERIAL" ? (
                              "Malzeme Alımı"
                            ) : tx.category === "INCOME" ? (
                              "Satış Geliri"
                            ) : (
                              "Diğer Giderler"
                            )}
                          </td>
                          <td className="p-4 text-zinc-500">{tx.description || "-"}</td>
                          <td className="p-4 text-center text-zinc-400 text-xs">
                            {tx.date ? new Date(tx.date).toLocaleDateString("tr-TR") : "-"}
                          </td>
                          <td className={cn("p-4 text-right font-black", tx.type === "INCOME" ? "text-emerald-600" : "text-rose-500")}>
                            {tx.type === "INCOME" ? "+" : "-"} {Number(tx.amount || 0).toLocaleString()} KGS
                          </td>
                          <td className="p-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteTxId(tx.id)
                              }}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors inline-flex items-center justify-center"
                              title="Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      ) : (
        isLoadingEmp ? (
          <div className="text-center py-12 text-zinc-400">Yükleniyor...</div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-zinc-50 text-xs font-bold text-zinc-500 uppercase">
                    <th className="p-4">Çalışan Adı</th>
                    <th className="p-4 text-center">İşe Başlama</th>
                    <th className="p-4 text-center">Aylık Maaş</th>
                    <th className="p-4 text-center">Hak Edilen (Maaş)</th>
                    <th className="p-4 text-center">Toplam Ödenen</th>
                    <th className="p-4 text-center">Kalan Bakiye</th>
                    <th className="p-4 text-center">Çalışma Durumu</th>
                    <th className="p-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-zinc-400">
                        Çalışan kaydı bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp: any) => {
                      const balance = emp.balance || 0;
                      return (
                        <tr key={emp.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td
                            className="p-4 font-bold text-primary hover:underline cursor-pointer"
                            onClick={() => setSelectedLedgerEmployee(emp)}
                          >
                            {emp.name}
                          </td>
                          <td className="p-4 text-center text-zinc-500 text-xs">
                            {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString("tr-TR") : "-"}
                          </td>
                          <td className="p-4 text-center font-bold text-zinc-700">
                            {Number(emp.monthlySalary || 0).toLocaleString()} KGS
                          </td>
                          <td className="p-4 text-center text-zinc-500 font-semibold">
                            {Number(emp.totalDeserved || 0).toLocaleString()} KGS ({emp.monthsWorked || 1} Ay)
                          </td>
                          <td className="p-4 text-center text-emerald-600 font-bold">
                            {Number(emp.totalPaid || 0).toLocaleString()} KGS
                          </td>
                          <td className="p-4 text-center">
                            {balance < 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
                                {Math.abs(balance).toLocaleString()} KGS Alacaklı
                              </span>
                            ) : balance > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                {balance.toLocaleString()} KGS Avans
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-50 text-zinc-500 border border-zinc-200">
                                Dengede
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() => toggleEmpActive.mutate({ id: emp.id, isActive: !emp.isActive })}
                              className="text-zinc-600 transition-colors focus:outline-none"
                            >
                              {emp.isActive ? (
                                <ToggleRight className="w-8 h-8 text-emerald-500" />
                              ) : (
                                <ToggleLeft className="w-8 h-8 text-zinc-300" />
                              )}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => openEditEmployee(emp)}
                              className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Transaction Form Modal */}
      {showTxForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-secondary">Yeni Gelir / Gider Ekle</h3>
              <button onClick={() => setShowTxForm(false)} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTxSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-2 bg-zinc-100 p-1.5 rounded-xl border border-zinc-200">
                <button
                  type="button"
                  onClick={() => setTxForm({ ...txForm, type: "EXPENSE", category: "MATERIAL" })}
                  className={cn("py-2 text-xs font-bold rounded-lg transition-colors", txForm.type === "EXPENSE" ? "bg-white text-rose-500 shadow-sm" : "text-zinc-500 hover:text-secondary")}
                >
                  Gider
                </button>
                <button
                  type="button"
                  onClick={() => setTxForm({ ...txForm, type: "INCOME", category: "INCOME" })}
                  className={cn("py-2 text-xs font-bold rounded-lg transition-colors", txForm.type === "INCOME" ? "bg-white text-emerald-500 shadow-sm" : "text-zinc-500 hover:text-secondary")}
                >
                  Gelir
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">Kategori</label>
                <select
                  value={txForm.category}
                  onChange={(e) => setTxForm({ ...txForm, category: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-white text-secondary"
                >
                  {txForm.type === "EXPENSE" ? (
                    <>
                      <option value="MATERIAL">Malzeme Alımı</option>
                      <option value="EMPLOYEE_SALARY">Maaş Ödemesi</option>
                      <option value="TAX">Vergi / Harç</option>
                      <option value="OTHER">Diğer Giderler</option>
                    </>
                  ) : (
                    <>
                      <option value="INCOME">Satış Geliri</option>
                      <option value="OTHER">Diğer Gelirler</option>
                    </>
                  )}
                </select>
              </div>

              {txForm.category === "EMPLOYEE_SALARY" && (
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">Ödeme Yapılan Personel *</label>
                  <select
                    value={txForm.employeeId}
                    onChange={(e) => setTxForm({ ...txForm, employeeId: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-white text-secondary"
                  >
                    <option value="">Seçin...</option>
                    {employees.filter((emp: any) => emp.isActive).map((emp: any) => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">Tutar (KGS) *</label>
                <input
                  type="number"
                  value={txForm.amount}
                  onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary text-secondary"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">İşlem Tarihi *</label>
                <input
                  type="date"
                  value={txForm.date}
                  onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary text-secondary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">Açıklama</label>
                <textarea
                  value={txForm.description}
                  onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary text-secondary resize-none"
                  placeholder="Detaylar..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowTxForm(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold text-secondary hover:bg-zinc-50">İptal</button>
                <button type="submit" disabled={addTxMutation.isPending} className="flex-1 px-4 py-3 bg-primary hover:bg-primary/95 text-white rounded-xl text-sm font-bold disabled:opacity-60">
                  {addTxMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Employee Form Modal */}
      {showEmpForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-secondary">
                {editingEmployeeId ? "Çalışan Bilgilerini Düzenle" : "Yeni Çalışan Tanımla"}
              </h3>
              <button onClick={() => setShowEmpForm(false)} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEmpSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">Çalışan Ad Soyad *</label>
                <input
                  value={empForm.name}
                  onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary text-secondary"
                  placeholder="Ahmet Yılmaz"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">Aylık Maaş (KGS) *</label>
                <input
                  type="number"
                  value={empForm.monthlySalary}
                  onChange={(e) => setEmpForm({ ...empForm, monthlySalary: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary text-secondary"
                  placeholder="0"
                />
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-sm font-semibold text-secondary">Aktif Çalışan</span>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={empForm.isActive}
                      onChange={(e) => setEmpForm({ ...empForm, isActive: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={cn("w-12 h-6 rounded-full transition-colors", empForm.isActive ? "bg-primary" : "bg-zinc-300")} />
                    <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform", empForm.isActive ? "translate-x-7" : "translate-x-1")} />
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEmpForm(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold text-secondary hover:bg-zinc-50">İptal</button>
                <button type="submit" disabled={saveEmpMutation.isPending} className="flex-1 px-4 py-3 bg-primary hover:bg-primary/95 text-white rounded-xl text-sm font-bold disabled:opacity-60">
                  {saveEmpMutation.isPending ? "Kaydediliyor..." : editingEmployeeId ? "Güncelle" : "Ekle"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {/* Employee Ledger Modal */}
      {selectedLedgerEmployee && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-secondary">{selectedLedgerEmployee.name}</h3>
                <p className="text-xs text-zinc-400 font-semibold mt-0.5">Personel Maaş Defteri & Hesap Özeti</p>
              </div>
              <button onClick={() => setSelectedLedgerEmployee(null)} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {isLoadingLedger ? (
                <div className="text-center py-12 text-zinc-400">Ledger verileri yükleniyor...</div>
              ) : (
                <>
                  {/* Summary row */}
                  <div className="grid grid-cols-3 gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Aylık Maaş</span>
                      <span className="text-base font-black text-secondary">{Number(ledgerEmployeeDetails?.monthlySalary || 0).toLocaleString()} KGS</span>
                    </div>
                    <div className="text-center border-x border-zinc-200">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Toplam Hak Edilen</span>
                      <span className="text-base font-black text-secondary">{Number(ledgerEmployeeDetails?.totalDeserved || 0).toLocaleString()} KGS ({ledgerEmployeeDetails?.monthsWorked || 1} Ay)</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Toplam Ödenen</span>
                      <span className="text-base font-black text-emerald-600">{Number(ledgerEmployeeDetails?.totalPaid || 0).toLocaleString()} KGS</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Aylara Göre Hak Ediş ve Ödeme Durumu</h4>
                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 bg-zinc-50 text-[10px] font-bold text-zinc-500 uppercase">
                            <th className="p-3">Dönem</th>
                            <th className="p-3 text-right">Hak Edilen</th>
                            <th className="p-3 text-right">Ödenen</th>
                            <th className="p-3 text-right">Durum</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs">
                          {(() => {
                            const start = new Date(ledgerEmployeeDetails?.createdAt || new Date());
                            const now = new Date();
                            const monthsList: Array<{ year: number; month: number; label: string; deserved: number }> = [];
                            const dateCursor = new Date(start.getFullYear(), start.getMonth(), 1);
                            const monthNames = [
                              "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", 
                              "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
                            ];

                            while (dateCursor <= now) {
                              monthsList.push({
                                year: dateCursor.getFullYear(),
                                month: dateCursor.getMonth(),
                                label: `${monthNames[dateCursor.getMonth()]} ${dateCursor.getFullYear()}`,
                                deserved: Number(ledgerEmployeeDetails?.monthlySalary || 0),
                              });
                              dateCursor.setMonth(dateCursor.getMonth() + 1);
                            }
                            let runningBalance = 0;
                            const processedMonths = monthsList.map((m) => {
                              const monthlyPayments = (ledgerEmployeeDetails?.transactions || []).filter((tx: any) => {
                                const txDate = new Date(tx.date);
                                return txDate.getFullYear() === m.year && txDate.getMonth() === m.month && tx.category === "EMPLOYEE_SALARY";
                              });
                              const paid = monthlyPayments.reduce((acc: number, tx: any) => acc + Number(tx.amount || 0), 0);
                              runningBalance += (paid - m.deserved);
                              return {
                                ...m,
                                paid,
                                monthlyPayments,
                                balance: runningBalance
                              };
                            });

                            processedMonths.reverse();

                            if (processedMonths.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={4} className="p-4 text-center text-zinc-400">Veri bulunmuyor</td>
                                </tr>
                              );
                            }

                            return processedMonths.map((m) => {
                              return (
                                <tr key={m.label} className="hover:bg-zinc-50/50 transition-colors">
                                  <td className="p-3 font-semibold text-secondary">{m.label}</td>
                                  <td className="p-3 text-right text-zinc-500">{m.deserved.toLocaleString()} KGS</td>
                                  <td className="p-3 text-right text-emerald-600 font-semibold">
                                    {m.paid > 0 ? `${m.paid.toLocaleString()} KGS` : "-"}
                                    {m.monthlyPayments.length > 0 && (
                                      <div className="text-[9px] text-zinc-400 font-normal">
                                        ({m.monthlyPayments.length} Ödeme)
                                      </div>
                                    )}
                                  </td>
                                  <td className="p-3 text-right">
                                    {m.balance < 0 ? (
                                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                                        {Math.abs(m.balance).toLocaleString()} KGS Alacak
                                      </span>
                                    ) : m.balance > 0 ? (
                                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                        {m.balance.toLocaleString()} KGS Avans
                                      </span>
                                    ) : (
                                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-50 text-zinc-500 border border-zinc-200">
                                        Ödendi
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-zinc-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLedgerEmployee(null)}
                className="px-5 py-2.5 bg-secondary text-white rounded-xl text-xs font-bold hover:bg-secondary/95 transition-colors"
              >
                Kapat
              </button>
            </div>
          </motion.div>
        </div>
      )}
    
      <ConfirmDialog
        isOpen={deleteTxId !== null}
        onClose={() => setDeleteTxId(null)}
        onConfirm={() => deleteTxMutation.mutate(deleteTxId!)}
        title="İşlemi Sil"
        description="Bu işlem kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
      />
</div>
  );
}

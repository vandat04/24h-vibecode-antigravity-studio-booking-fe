"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import type { ProcessPhase, ProcessStep, ProcessPhaseRequest, ProcessStepRequest } from "@/types";
import { useToast } from "@/context/ToastContext";

const PRESET_ICONS = [
  { name: "groups", label: "Tư vấn/Nhóm" },
  { name: "photo_camera", label: "Chụp ảnh/Máy ảnh" },
  { name: "face_retouching_natural", label: "Hậu kỳ/Làm đẹp" },
  { name: "desktop_windows", label: "Bàn giao/Máy tính" },
  { name: "headset_mic", label: "Chăm sóc/Tai nghe" },
  { name: "favorite", label: "Trái tim/Kết nối" },
  { name: "assignment", label: "Lập kế hoạch" },
  { name: "auto_awesome", label: "Nghệ thuật" },
  { name: "image", label: "Hình ảnh" },
  { name: "handshake", label: "Thỏa thuận" },
];

export default function AdminWorkProcessPage() {
  const { showSuccess, showError, showWarning } = useToast();
  const [activeTab, setActiveTab] = useState<"steps" | "phases">("steps");

  const [phases, setPhases] = useState<ProcessPhase[]>([]);
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [loading, setLoading] = useState(true);

  // Phase Modal State
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<ProcessPhase | null>(null);
  const [phaseCode, setPhaseCode] = useState("");
  const [phaseName, setPhaseName] = useState("");
  const [phaseDesc, setPhaseDesc] = useState("");
  const [phaseSort, setPhaseSort] = useState<number>(1);
  const [phaseDisplayed, setPhaseDisplayed] = useState(true);

  // Step Modal State
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<ProcessStep | null>(null);
  const [stepPhaseId, setStepPhaseId] = useState<number>(0);
  const [stepNumber, setStepNumber] = useState("");
  const [stepTitle, setStepTitle] = useState("");
  const [stepDesc, setStepDesc] = useState("");
  const [stepIcon, setStepIcon] = useState("groups");
  const [stepSort, setStepSort] = useState<number>(1);
  const [stepDisplayed, setStepDisplayed] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [phaseData, stepData] = await Promise.all([
        adminApi.getAdminPhases(),
        adminApi.getAdminSteps(),
      ]);
      setPhases(phaseData || []);
      setSteps(stepData || []);
    } catch (err: any) {
      showError(err.message || "Không thể tải dữ liệu quy trình làm việc.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- PHASE MODAL HANDLERS ---
  const openAddPhaseModal = () => {
    setEditingPhase(null);
    setPhaseCode(`PHASE_${phases.length + 1}`);
    setPhaseName("");
    setPhaseDesc("");
    setPhaseSort(phases.length + 1);
    setPhaseDisplayed(true);
    setIsPhaseModalOpen(true);
  };

  const openEditPhaseModal = (phase: ProcessPhase) => {
    setEditingPhase(phase);
    setPhaseCode(phase.phaseCode);
    setPhaseName(phase.name);
    setPhaseDesc(phase.description || "");
    setPhaseSort(phase.sortOrder || 1);
    setPhaseDisplayed(phase.isDisplayed);
    setIsPhaseModalOpen(true);
  };

  const handlePhaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phaseCode.trim()) return showWarning("Vui lòng nhập mã giai đoạn!");
    if (!phaseName.trim()) return showWarning("Vui lòng nhập tên giai đoạn!");

    setSubmitting(true);
    const payload: ProcessPhaseRequest = {
      phaseCode: phaseCode.trim(),
      name: phaseName.trim(),
      description: phaseDesc.trim(),
      sortOrder: Number(phaseSort) || 0,
      isDisplayed: phaseDisplayed,
    };

    try {
      if (editingPhase) {
        await adminApi.updateAdminPhase(editingPhase.id, payload);
        showSuccess("Cập nhật giai đoạn thành công!");
      } else {
        await adminApi.createAdminPhase(payload);
        showSuccess("Thêm giai đoạn mới thành công!");
      }
      setIsPhaseModalOpen(false);
      fetchData();
    } catch (err: any) {
      showError(err.message || "Thao tác thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePhase = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa giai đoạn này? Lưu ý: Tất cả các bước thuộc giai đoạn này cũng sẽ bị xóa.")) return;
    try {
      await adminApi.deleteAdminPhase(id);
      showSuccess("Đã xóa giai đoạn.");
      fetchData();
    } catch (err: any) {
      showError(err.message || "Xóa thất bại.");
    }
  };

  // --- STEP MODAL HANDLERS ---
  const openAddStepModal = () => {
    setEditingStep(null);
    setStepPhaseId(phases[0]?.id || 0);
    const nextNum = steps.length + 1;
    setStepNumber(nextNum < 10 ? `0${nextNum}` : `${nextNum}`);
    setStepTitle("");
    setStepDesc("");
    setStepIcon("groups");
    setStepSort(steps.length + 1);
    setStepDisplayed(true);
    setIsStepModalOpen(true);
  };

  const openEditStepModal = (step: ProcessStep) => {
    setEditingStep(step);
    setStepPhaseId(step.phaseId);
    setStepNumber(step.stepNumber || "");
    setStepTitle(step.title);
    setStepDesc(step.description);
    setStepIcon(step.iconName || "groups");
    setStepSort(step.sortOrder || 1);
    setStepDisplayed(step.isDisplayed);
    setIsStepModalOpen(true);
  };

  const handleStepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepPhaseId) return showWarning("Vui lòng chọn Giai đoạn!");
    if (!stepTitle.trim()) return showWarning("Vui lòng nhập tiêu đề!");
    if (!stepDesc.trim()) return showWarning("Vui lòng nhập nội dung!");

    setSubmitting(true);
    const payload: ProcessStepRequest = {
      phaseId: Number(stepPhaseId),
      stepNumber: stepNumber.trim(),
      title: stepTitle.trim(),
      description: stepDesc.trim(),
      iconName: stepIcon.trim() || "groups",
      sortOrder: Number(stepSort) || 0,
      isDisplayed: stepDisplayed,
    };

    try {
      if (editingStep) {
        await adminApi.updateAdminStep(editingStep.id, payload);
        showSuccess("Cập nhật bước quy trình thành công!");
      } else {
        await adminApi.createAdminStep(payload);
        showSuccess("Thêm bước quy trình mới thành công!");
      }
      setIsStepModalOpen(false);
      fetchData();
    } catch (err: any) {
      showError(err.message || "Thao tác thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStep = async (step: ProcessStep) => {
    try {
      await adminApi.toggleAdminStepDisplay(step.id);
      showSuccess(`Đã ${step.isDisplayed ? "ẩn" : "hiển thị"} bước "${step.title}".`);
      fetchData();
    } catch (err: any) {
      showError(err.message || "Không thể đổi trạng thái.");
    }
  };

  const handleDeleteStep = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa bước công việc này?")) return;
    try {
      await adminApi.deleteAdminStep(id);
      showSuccess("Đã xóa bước quy trình.");
      fetchData();
    } catch (err: any) {
      showError(err.message || "Xóa thất bại.");
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="font-playfair text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-gold-luxury" style={{ fontSize: 32 }}>
              schema
            </span>
            Quản Lý Quy Trình Làm Việc
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Quản lý các giai đoạn & bước quy trình thực hiện dịch vụ hiển thị ở trang chủ
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === "steps" ? (
            <button
              onClick={openAddStepModal}
              className="bg-gold-luxury hover:bg-gold-dark text-black font-semibold px-4 py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
              Thêm Bước Quy Trình
            </button>
          ) : (
            <button
              onClick={openAddPhaseModal}
              className="bg-gold-luxury hover:bg-gold-dark text-black font-semibold px-4 py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
              Thêm Giai Đoạn Mới
            </button>
          )}
        </div>
      </div>

      {/* Tabs Selection */}
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-1">
        <button
          onClick={() => setActiveTab("steps")}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "steps"
              ? "bg-zinc-800 text-gold-luxury border-b-2 border-gold-luxury"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>format_list_numbered</span>
          Các Bước Quy Trình ({steps.length})
        </button>
        <button
          onClick={() => setActiveTab("phases")}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "phases"
              ? "bg-zinc-800 text-gold-luxury border-b-2 border-gold-luxury"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>view_timeline</span>
          Giai Đoạn Làm Việc ({phases.length})
        </button>
      </div>

      {/* Content for TAB 1: STEPS */}
      {activeTab === "steps" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-zinc-400 flex flex-col items-center gap-3">
              <span className="material-symbols-outlined animate-spin text-gold-luxury" style={{ fontSize: 32 }}>
                progress_activity
              </span>
              <span>Đang tải danh sách...</span>
            </div>
          ) : steps.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 space-y-3">
              <span className="material-symbols-outlined text-zinc-600" style={{ fontSize: 48 }}>folder_off</span>
              <p className="text-sm font-medium">Chưa có bước quy trình nào.</p>
              <button onClick={openAddStepModal} className="text-xs text-gold-luxury underline hover:text-white">
                Tạo bước mới
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-950/70 border-b border-zinc-800 text-xs text-zinc-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5 text-center w-16">Số</th>
                    <th className="px-4 py-3.5 text-center w-16">Icon</th>
                    <th className="px-4 py-3.5">Công việc / Tiêu đề</th>
                    <th className="px-4 py-3.5">Mô tả</th>
                    <th className="px-4 py-3.5">Giai đoạn</th>
                    <th className="px-4 py-3.5 text-center w-20">Thứ tự</th>
                    <th className="px-4 py-3.5 text-center w-28">Trạng thái</th>
                    <th className="px-4 py-3.5 text-right w-28">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {steps.map((s) => (
                    <tr key={s.id} className="hover:bg-zinc-800/40 transition-colors">
                      {/* Step Number */}
                      <td className="px-4 py-4 text-center font-mono font-bold text-gold-luxury text-base">
                        {s.stepNumber || "-"}
                      </td>

                      {/* Icon */}
                      <td className="px-4 py-4 text-center">
                        <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-gold-luxury mx-auto">
                          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                            {s.iconName || "groups"}
                          </span>
                        </div>
                      </td>

                      {/* Title */}
                      <td className="px-4 py-4 font-semibold text-white font-playfair text-base">
                        {s.title}
                      </td>

                      {/* Description */}
                      <td className="px-4 py-4 max-w-xs text-xs text-zinc-400 leading-relaxed line-clamp-2">
                        {s.description}
                      </td>

                      {/* Phase */}
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 rounded bg-zinc-800 text-gold-luxury border border-zinc-700 text-xs font-semibold">
                          {s.phaseCode ? `${s.phaseCode} - ${s.phaseName}` : `Giai đoạn ID: ${s.phaseId}`}
                        </span>
                      </td>

                      {/* Sort */}
                      <td className="px-4 py-4 text-center font-mono text-zinc-400">{s.sortOrder}</td>

                      {/* Status */}
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleToggleStep(s)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                            s.isDisplayed
                              ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800"
                              : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                          }`}
                        >
                          {s.isDisplayed ? "Hiển thị" : "Ẩn"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditStepModal(s)}
                            className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteStep(s.id)}
                            className="p-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/30 cursor-pointer"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Content for TAB 2: PHASES */}
      {activeTab === "phases" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-zinc-400 flex flex-col items-center gap-3">
              <span className="material-symbols-outlined animate-spin text-gold-luxury" style={{ fontSize: 32 }}>
                progress_activity
              </span>
              <span>Đang tải giai đoạn...</span>
            </div>
          ) : phases.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 space-y-3">
              <span className="material-symbols-outlined text-zinc-600" style={{ fontSize: 48 }}>timeline</span>
              <p className="text-sm font-medium">Chưa có giai đoạn nào.</p>
              <button onClick={openAddPhaseModal} className="text-xs text-gold-luxury underline hover:text-white">
                Tạo giai đoạn mới
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-950/70 border-b border-zinc-800 text-xs text-zinc-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Mã Giai Đoạn</th>
                    <th className="px-5 py-3.5">Tên Giai Đoạn</th>
                    <th className="px-5 py-3.5 text-center w-24">Số Bước</th>
                    <th className="px-5 py-3.5 text-center w-24">Thứ tự</th>
                    <th className="px-5 py-3.5 text-center w-32">Trạng thái</th>
                    <th className="px-5 py-3.5 text-right w-36">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {phases.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-gold-luxury">
                        {p.phaseCode}
                      </td>
                      <td className="px-5 py-4 font-semibold text-white uppercase font-hanken tracking-wider">
                        {p.name}
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-zinc-300">
                        {p.steps ? p.steps.length : 0} bước
                      </td>
                      <td className="px-5 py-4 text-center font-mono text-zinc-400">{p.sortOrder}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                          p.isDisplayed ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800" : "bg-zinc-800 text-zinc-400"
                        }`}>
                          {p.isDisplayed ? "Hiển thị" : "Ẩn"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditPhaseModal(p)}
                            className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                          </button>
                          <button
                            onClick={() => handleDeletePhase(p.id)}
                            className="p-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/30 cursor-pointer"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD/EDIT PHASE */}
      {isPhaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-playfair text-lg font-bold text-white">
                {editingPhase ? "Chỉnh Sửa Giai Đoạn" : "Thêm Giai Đoạn Mới"}
              </h3>
              <button onClick={() => setIsPhaseModalOpen(false)} className="text-zinc-400 hover:text-white">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>

            <form onSubmit={handlePhaseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">Mã Giai Đoạn (VD: GIAI ĐOẠN 1)</label>
                <input
                  type="text"
                  required
                  value={phaseCode}
                  onChange={(e) => setPhaseCode(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-gold-luxury"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">Tên Giai Đoạn (VD: TRƯỚC BUỔI CHỤP)</label>
                <input
                  type="text"
                  required
                  value={phaseName}
                  onChange={(e) => setPhaseName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-gold-luxury"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">Thứ tự sắp xếp</label>
                <input
                  type="number"
                  value={phaseSort}
                  onChange={(e) => setPhaseSort(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-gold-luxury"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button type="button" onClick={() => setIsPhaseModalOpen(false)} className="px-3 py-2 text-xs text-zinc-400">Hủy</button>
                <button type="submit" disabled={submitting} className="bg-gold-luxury text-black font-semibold px-4 py-2 rounded text-xs">
                  {submitting ? "Đang lưu..." : editingPhase ? "Cập Nhật" : "Tạo Mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT STEP */}
      {isStepModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-playfair text-lg font-bold text-white">
                {editingStep ? "Chỉnh Sửa Bước Quy Trình" : "Thêm Bước Quy Trình Mới"}
              </h3>
              <button onClick={() => setIsStepModalOpen(false)} className="text-zinc-400 hover:text-white">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>

            <form onSubmit={handleStepSubmit} className="space-y-4">
              {/* Phase Selection */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">Thuộc Giai Đoạn <span className="text-rose-500">*</span></label>
                <select
                  value={stepPhaseId}
                  onChange={(e) => setStepPhaseId(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-gold-luxury"
                >
                  {phases.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.phaseCode} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">Số thứ tự (VD: 01, 02)</label>
                  <input
                    type="text"
                    value={stepNumber}
                    onChange={(e) => setStepNumber(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">Thứ tự ưu tiên</label>
                  <input
                    type="number"
                    value={stepSort}
                    onChange={(e) => setStepSort(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">Tên công việc / Tiêu đề <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={stepTitle}
                  onChange={(e) => setStepTitle(e.target.value)}
                  placeholder="Ví dụ: Tư vấn, Chụp ảnh, Hậu kỳ"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white font-playfair font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">Nội dung mô tả ngắn <span className="text-rose-500">*</span></label>
                <textarea
                  required
                  rows={3}
                  value={stepDesc}
                  onChange={(e) => setStepDesc(e.target.value)}
                  placeholder="Ví dụ: Tư vấn, lắng nghe nhu cầu khách hàng."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">Icon Google Material Symbols</label>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-zinc-950 border border-gold-luxury flex items-center justify-center text-gold-luxury flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                      {stepIcon || "groups"}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={stepIcon}
                    onChange={(e) => setStepIcon(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {PRESET_ICONS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setStepIcon(p.name)}
                      className={`p-1.5 rounded border flex flex-col items-center gap-1 cursor-pointer ${
                        stepIcon === p.name ? "bg-gold-luxury/20 border-gold-luxury text-gold-luxury" : "bg-zinc-950 border-zinc-800 text-zinc-400"
                      }`}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{p.name}</span>
                      <span className="text-[8px] truncate w-full text-center">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button type="button" onClick={() => setIsStepModalOpen(false)} className="px-3 py-2 text-xs text-zinc-400">Hủy</button>
                <button type="submit" disabled={submitting} className="bg-gold-luxury text-black font-semibold px-4 py-2 rounded text-xs">
                  {submitting ? "Đang lưu..." : editingStep ? "Cập Nhật" : "Tạo Mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

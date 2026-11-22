import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Layers, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Image as ImageIcon,
  Download,
  RefreshCw,
  Eye
} from 'lucide-react';

interface Job {
  id: string;
  created_at: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  title: string;
  raw_filename: string;
  remove_bg: boolean;
  model_name: string;
  preset: string;
  width: number;
  height: number;
  bg_color: string;
  transparent_filename?: string;
  output_filename?: string;
  error?: string;
}

export default function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState<'output' | 'transparent' | 'raw'>('output');

  // Form states
  const [title, setTitle] = useState('Game Stone Banner');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeBg, setRemoveBg] = useState(true);
  const [modelName, setModelName] = useState('birefnet-general');
  const [preset, setPreset] = useState('youtube_thumbnail');
  const [width, setWidth] = useState(1280);
  const [height, setHeight] = useState(720);
  const [bgColor, setBgColor] = useState('#1e1e2e');
  
  // Filter states
  const [brightness, setBrightness] = useState(1.0);
  const [contrast, setContrast] = useState(1.05);
  const [saturation, setSaturation] = useState(1.1);
  const [sharpness, setSharpness] = useState(1.2);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchJobs = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/jobs');
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
        if (data.length > 0 && !selectedJob) {
          setSelectedJob(data[0]);
        } else if (selectedJob) {
          const updated = data.find((j: Job) => j.id === selectedJob.id);
          if (updated) setSelectedJob(updated);
        }
      }
    } catch (err) {
      console.error("Không kết nối được server API:", err);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 2000);
    return () => clearInterval(interval);
  }, [selectedJob]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handlePresetChange = (presetKey: string) => {
    setPreset(presetKey);
    if (presetKey === 'youtube_thumbnail') { setWidth(1280); setHeight(720); }
    else if (presetKey === 'fhd_banner') { setWidth(1920); setHeight(1080); }
    else if (presetKey === 'fb_landscape') { setWidth(1200); setHeight(630); }
    else if (presetKey === 'square_post') { setWidth(1080); setHeight(1080); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Vui lòng chọn hoặc kéo thả 1 ảnh!");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('remove_bg', String(removeBg));
    formData.append('model_name', modelName);
    formData.append('preset', preset);
    formData.append('width', String(width));
    formData.append('height', String(height));
    formData.append('bg_color', bgColor);
    formData.append('brightness', String(brightness));
    formData.append('contrast', String(contrast));
    formData.append('saturation', String(saturation));
    formData.append('sharpness', String(sharpness));

    try {
      const res = await fetch('http://localhost:8000/api/jobs/create', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        await fetchJobs();
      }
    } catch (err) {
      alert("Lỗi kết nối tới server local!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0d0e15] text-gray-200 overflow-hidden font-sans">
      {/* CỘT TRÁI: FORM ĐIỀU KHIỂN & CẤU HÌNH */}
      <div className="w-[420px] h-full border-r border-gray-800/80 bg-[#12141e] flex flex-col shadow-2xl z-10">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-wide text-white">STUDIO CONTROL</h1>
              <p className="text-[11px] text-gray-400">Local Banner & BiRefNet Pipeline</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
            BiRefNet Active
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* 1. File Upload / Source */}
          <div className="space-y-1.5">
            <label className="font-semibold text-gray-300">1. Ảnh đầu vào</label>
            <div className="border-2 border-dashed border-gray-700 hover:border-indigo-500 rounded-xl p-3 bg-gray-900/50 transition-colors text-center cursor-pointer relative">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {previewUrl ? (
                <div className="flex items-center gap-3 text-left">
                  <img src={previewUrl} alt="Preview" className="w-14 h-14 object-cover rounded-lg border border-gray-700" />
                  <div className="truncate">
                    <p className="text-gray-200 font-medium truncate">{file?.name}</p>
                    <p className="text-[10px] text-gray-500">{(file?.size ? file.size / 1024 : 0).toFixed(1)} KB</p>
                  </div>
                </div>
              ) : (
                <div className="py-2">
                  <ImageIcon className="w-6 h-6 mx-auto text-gray-500 mb-1" />
                  <p className="text-gray-400 font-medium">Bấm hoặc kéo thả ảnh vào đây</p>
                  <p className="text-[10px] text-gray-600">PNG, JPG, WEBP</p>
                </div>
              )}
            </div>
          </div>

          {/* 2. Tiêu đề Job */}
          <div className="space-y-1.5">
            <label className="font-semibold text-gray-300">2. Tiêu đề / Tên Banner</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-900/80 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* 3. Tách nền SOTA */}
          <div className="p-3 bg-indigo-950/20 border border-indigo-900/40 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-indigo-200">Tách nền BiRefNet</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={removeBg} 
                  onChange={(e) => setRemoveBg(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {removeBg && (
              <div className="space-y-1 pt-1">
                <label className="text-[11px] text-gray-400">Mô hình AI tách nền:</label>
                <select 
                  value={modelName} 
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-gray-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="birefnet-general">BiRefNet (SOTA 2024 - Khuyên dùng)</option>
                  <option value="isnet-general-use">IS-Net DIS (Độ chi tiết cao)</option>
                  <option value="u2net">U2Net (Nhẹ, tốc độ nhanh)</option>
                </select>
              </div>
            )}
          </div>

          {/* 4. Kích thước Banner & Background */}
          <div className="space-y-2.5">
            <label className="font-semibold text-gray-300">4. Kích thước & Màu nền Banner</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'youtube_thumbnail', label: 'YouTube (1280x720)' },
                { key: 'fhd_banner', label: 'Full HD (1920x1080)' },
                { key: 'fb_landscape', label: 'Facebook (1200x630)' },
                { key: 'square_post', label: 'Square (1080x1080)' },
              ].map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handlePresetChange(p.key)}
                  className={`px-2 py-1.5 rounded-lg border text-left truncate transition-colors ${
                    preset === p.key 
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200' 
                      : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <span className="text-[11px] text-gray-400">Background:</span>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={bgColor === 'transparent' ? '#000000' : bgColor} 
                  onChange={(e) => setBgColor(e.target.value)}
                  disabled={bgColor === 'transparent'}
                  className="w-7 h-7 rounded border border-gray-700 bg-transparent cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setBgColor(bgColor === 'transparent' ? '#1e1e2e' : 'transparent')}
                  className={`px-2 py-1 rounded text-[10px] border transition-colors ${
                    bgColor === 'transparent' 
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300' 
                      : 'bg-gray-800 border-gray-700 text-gray-400'
                  }`}
                >
                  {bgColor === 'transparent' ? 'Đang để Trong suốt' : 'Giữ Alpha trong suốt'}
                </button>
              </div>
            </div>
          </div>

          {/* 5. Bộ lọc & Tinh chỉnh ảnh */}
          <div className="p-3 bg-gray-900/40 border border-gray-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-semibold text-gray-300">
              <Sliders className="w-3.5 h-3.5 text-gray-400" />
              <span>5. Bộ lọc màu & Độ nét</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Độ tương phản</span>
                  <span>{contrast}x</span>
                </div>
                <input 
                  type="range" min="0.8" max="1.5" step="0.05" 
                  value={contrast} onChange={(e) => setContrast(parseFloat(e.target.value))} 
                  className="w-full accent-indigo-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Độ nét (Sharp)</span>
                  <span>{sharpness}x</span>
                </div>
                <input 
                  type="range" min="1.0" max="2.0" step="0.1" 
                  value={sharpness} onChange={(e) => setSharpness(parseFloat(e.target.value))} 
                  className="w-full accent-indigo-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Độ bão hòa</span>
                  <span>{saturation}x</span>
                </div>
                <input 
                  type="range" min="0.8" max="1.5" step="0.05" 
                  value={saturation} onChange={(e) => setSaturation(parseFloat(e.target.value))} 
                  className="w-full accent-indigo-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Độ sáng</span>
                  <span>{brightness}x</span>
                </div>
                <input 
                  type="range" min="0.8" max="1.3" step="0.05" 
                  value={brightness} onChange={(e) => setBrightness(parseFloat(e.target.value))} 
                  className="w-full accent-indigo-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Submit Run Button */}
          <button
            type="submit"
            disabled={isSubmitting || !file}
            className={`w-full py-2.5 rounded-xl font-bold text-sm tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 ${
              isSubmitting || !file 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-[0.98]'
            }`}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Đang đẩy vào Hàng đợi...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                XỬ LÝ BANNER NGAY
              </>
            )}
          </button>
        </form>
      </div>

      {/* CỘT GIỮA: LIVE PREVIEW & SO SÁNH 3 TRẠNG THÁI */}
      <div className="flex-1 h-full flex flex-col bg-[#0a0b10] border-r border-gray-800/80">
        <div className="h-14 border-b border-gray-800 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-400" />
            <h2 className="font-semibold text-sm text-gray-200">
              {selectedJob ? selectedJob.title : 'Chưa chọn Job'}
            </h2>
          </div>

          {/* Tabs so sánh */}
          <div className="flex items-center bg-gray-900 border border-gray-800 p-1 rounded-xl gap-1 text-xs">
            <button
              onClick={() => setActiveTab('output')}
              className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                activeTab === 'output' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Banner Thành phẩm
            </button>
            <button
              onClick={() => setActiveTab('transparent')}
              className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                activeTab === 'transparent' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Tách nền BiRefNet (PNG)
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                activeTab === 'raw' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Ảnh gốc (Raw)
            </button>
          </div>
        </div>

        {/* Display Canvas View */}
        <div className="flex-1 p-6 flex items-center justify-center overflow-auto relative">
          {selectedJob ? (
            <div className="max-w-full max-h-full flex flex-col items-center">
              <div className="relative rounded-xl overflow-hidden border border-gray-800 shadow-2xl checkerboard-bg">
                {activeTab === 'output' && (
                  selectedJob.output_filename ? (
                    <img 
                      src={`http://localhost:8000/media/output/${selectedJob.output_filename}`} 
                      alt="Output Banner" 
                      className="max-h-[65vh] object-contain"
                    />
                  ) : (
                    <div className="w-[600px] h-[340px] flex items-center justify-center text-gray-500">
                      {selectedJob.status === 'processing' ? 'Đang tổng hợp banner...' : 'Chưa có banner thành phẩm'}
                    </div>
                  )
                )}

                {activeTab === 'transparent' && (
                  selectedJob.transparent_filename ? (
                    <img 
                      src={`http://localhost:8000/media/transparent/${selectedJob.transparent_filename}`} 
                      alt="Transparent" 
                      className="max-h-[65vh] object-contain"
                    />
                  ) : (
                    <div className="w-[600px] h-[340px] flex items-center justify-center text-gray-500">
                      {selectedJob.status === 'processing' ? 'BiRefNet đang tách nền...' : 'Job này không bật tách nền'}
                    </div>
                  )
                )}

                {activeTab === 'raw' && (
                  selectedJob.raw_filename && (
                    <img 
                      src={`http://localhost:8000/media/raw/${selectedJob.raw_filename}`} 
                      alt="Raw" 
                      className="max-h-[65vh] object-contain"
                    />
                  )
                )}
              </div>

              {/* Thông số bên dưới ảnh */}
              <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                <span>Kích thước: <strong className="text-gray-200">{selectedJob.width} x {selectedJob.height}</strong></span>
                <span>Mô hình: <strong className="text-indigo-400">{selectedJob.model_name}</strong></span>
                {selectedJob.output_filename && (
                  <a 
                    href={`http://localhost:8000/media/output/${selectedJob.output_filename}`} 
                    download 
                    className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold ml-2"
                  >
                    <Download className="w-4 h-4" />
                    Tải ảnh xuống
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-600">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p>Chưa có job nào được chọn hoặc tạo</p>
            </div>
          )}
        </div>
      </div>

      {/* CỘT PHẢI: HÀNG ĐỢI JOBS REAL-TIME */}
      <div className="w-80 h-full bg-[#12141e] flex flex-col">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold text-xs tracking-wider uppercase text-gray-400">
            Hàng đợi ({jobs.length})
          </h3>
          <button 
            onClick={fetchJobs} 
            className="p-1 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => setSelectedJob(job)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedJob?.id === job.id
                  ? 'bg-indigo-950/30 border-indigo-500/60 shadow-lg'
                  : 'bg-gray-900/60 border-gray-800/80 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-xs text-gray-200 truncate pr-2">
                  {job.title}
                </span>
                {job.status === 'completed' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                {job.status === 'processing' && (
                  <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                )}
                {job.status === 'queued' && (
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                {job.status === 'failed' && (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-500">
                <span>{job.width}x{job.height}</span>
                <span className="uppercase font-mono">{job.status}</span>
              </div>

              {job.status === 'processing' && (
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div 
                    className="bg-indigo-500 h-full transition-all duration-300" 
                    style={{ width: `${job.progress}%` }} 
                  />
                </div>
              )}
            </div>
          ))}

          {jobs.length === 0 && (
            <p className="text-center text-xs text-gray-600 py-8">Chưa có job nào trong hàng đợi</p>
          )}
        </div>
      </div>
    </div>
  );
}

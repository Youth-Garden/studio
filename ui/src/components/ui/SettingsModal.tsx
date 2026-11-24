import { useState } from 'react';
import { 
  Globe, 
  Palette, 
  Sparkles, 
  Info,
  Grid
} from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './Dialog';
import { Button } from './Button';
import { Card } from './Card';
import type { PortalProps } from '../../shared/types/portal.types';
import type { Locale } from '../../lib/i18n';
import { useSettingsStore, type AppTheme } from '../../shared/store/settings.store';

export type CanvasPattern = 'dots' | 'lines' | 'cross' | 'none';

export interface SettingsModalData {
  showCloseButton?: boolean;
}

export function SettingsModal({
  onDismiss,
  data,
}: PortalProps<SettingsModalData>) {
  const { 
    locale, 
    theme, 
    canvasPattern, 
    setLocale, 
    setTheme, 
    setCanvasPattern 
  } = useSettingsStore();

  const [selectedLocale, setSelectedLocale] = useState<Locale>(locale);
  const [activeTheme, setActiveTheme] = useState<AppTheme>(theme);
  const [selectedPattern, setSelectedPattern] = useState<CanvasPattern>(canvasPattern);

  const handleSave = () => {
    setLocale(selectedLocale);
    setTheme(activeTheme);
    setCanvasPattern(selectedPattern);
    onDismiss?.();
  };

  return (
    <Dialog 
      onDismiss={onDismiss} 
      showCloseButton={data?.showCloseButton !== false}
      className="max-w-xl bg-[#242424]"
    >
      <DialogHeader>
        <DialogTitle>Cài Đặt Hệ Thống</DialogTitle>
        <DialogDescription>
          Tùy chỉnh ngôn ngữ hiển thị, giao diện, pattern lưới canvas và thông số vận hành studio.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2 text-xs">
        {/* Lựa chọn Ngôn ngữ */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-zinc-400" />
            <span>Ngôn ngữ hiển thị</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { code: 'vi' as Locale, label: 'Tiếng Việt', flag: '🇻🇳' },
              { code: 'en' as Locale, label: 'English', flag: '🇺🇸' },
              { code: 'ja' as Locale, label: '日本語', flag: '🇯🇵' },
            ].map((item) => {
              const isSelected = selectedLocale === item.code;
              return (
                <Card
                  key={item.code}
                  role="button"
                  tabIndex={0}
                  variant="solid"
                  active={isSelected}
                  onClick={() => setSelectedLocale(item.code)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedLocale(item.code);
                    }
                  }}
                  className="flex items-center justify-between p-2.5 text-xs"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-zinc-400">
                      {item.code.toUpperCase()}
                    </span>
                    <span className="text-zinc-200 font-medium">{item.label}</span>
                  </span>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Lựa chọn Background Pattern Canvas */}
        <div className="space-y-2 pt-2 border-t border-zinc-800/80">
          <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
            <Grid className="w-3.5 h-3.5 text-zinc-400" />
            <span>Lưới nền Canvas</span>
          </label>
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { 
                id: 'dots' as CanvasPattern, 
                label: 'Chấm bi',
                preview: (
                  <div className="w-full h-8 rounded bg-[#161616] border border-zinc-800/80 relative overflow-hidden flex items-center justify-center">
                    <div className="w-full h-full opacity-60" style={{
                      backgroundImage: 'radial-gradient(#525252 1px, transparent 1px)',
                      backgroundSize: '6px 6px'
                    }} />
                  </div>
                )
              },
              { 
                id: 'lines' as CanvasPattern, 
                label: 'Kẻ sọc',
                preview: (
                  <div className="w-full h-8 rounded bg-[#161616] border border-zinc-800/80 relative overflow-hidden flex items-center justify-center">
                    <div className="w-full h-full opacity-50" style={{
                      backgroundImage: 'linear-gradient(to right, #383838 1px, transparent 1px), linear-gradient(to bottom, #383838 1px, transparent 1px)',
                      backgroundSize: '8px 8px'
                    }} />
                  </div>
                )
              },
              { 
                id: 'cross' as CanvasPattern, 
                label: 'Dấu cộng',
                preview: (
                  <div className="w-full h-8 rounded bg-[#161616] border border-zinc-800/80 relative overflow-hidden flex items-center justify-center">
                    <div className="text-[10px] text-zinc-500 font-mono tracking-widest select-none opacity-80">
                      + + +
                    </div>
                  </div>
                )
              },
              { 
                id: 'none' as CanvasPattern, 
                label: 'Đen tuyền',
                preview: (
                  <div className="w-full h-8 rounded bg-[#141414] border border-zinc-800/80 relative overflow-hidden flex items-center justify-center">
                    <span className="text-[9px] text-zinc-600 font-mono">Trống</span>
                  </div>
                )
              },
            ].map((p) => {
              const isSelected = selectedPattern === p.id;
              return (
                <Card
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  variant="solid"
                  active={isSelected}
                  onClick={() => setSelectedPattern(p.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedPattern(p.id);
                    }
                  }}
                  className="flex flex-col gap-1.5 p-2 text-left"
                >
                  {/* Ô xem trước (Example Preview) */}
                  {p.preview}

                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-[11px] font-medium truncate text-zinc-300">
                      {p.label}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Lựa chọn Giao diện Theme */}
        <div className="space-y-2 pt-2 border-t border-zinc-800/80">
          <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-zinc-400" />
            <span>Chủ đề Giao diện (Theme)</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'dark', label: 'Tối Trung Tính', bg: '#1e1e1e' },
              { id: 'midnight', label: 'Xám Đêm', bg: '#18181b' },
              { id: 'amoled', label: 'Đen Tuyệt Đối', bg: '#050505' },
              { id: 'light', label: 'Sáng Tinh Tế', bg: '#f4f4f5' },
            ].map((themeItem) => {
              const isSelected = activeTheme === themeItem.id;
              return (
                <Card
                  key={themeItem.id}
                  role="button"
                  tabIndex={0}
                  variant="solid"
                  active={isSelected}
                  onClick={() => {
                    setActiveTheme(themeItem.id as any);
                    setTheme(themeItem.id as any); // Áp dụng ngay tức thì để người dùng thấy thay đổi
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveTheme(themeItem.id as any);
                      setTheme(themeItem.id as any);
                    }
                  }}
                  className="flex flex-col gap-1.5 p-2 text-left"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-zinc-700 shadow-xs"
                      style={{ backgroundColor: themeItem.bg }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-zinc-300 truncate">
                    {themeItem.label}
                  </span>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Thông tin môi trường */}
        <Card className="p-2.5 bg-[#1b1b1b] border-zinc-800/80 space-y-1.5 text-zinc-400 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              <span>BiRefNet AI SOTA:</span>
            </span>
            <span className="text-zinc-300 font-mono text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded">Đã nạp vram</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-zinc-400" />
              <span>Gemini CDP Bridge:</span>
            </span>
            <span className="text-zinc-300 font-mono text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded">127.0.0.1:9222</span>
          </div>
        </Card>
      </div>

      <DialogFooter className="justify-end">
        <Button variant="default" size="sm" onClick={handleSave}>
          Lưu Cài Đặt
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

import type { ComponentType, SVGProps } from "react";
import * as LucideIcons from "lucide-react";
import { StudioLogoIcon } from "./svgs";

export type IconComponent = ComponentType<
  SVGProps<SVGSVGElement> & { size?: number | string }
>;

/**
 * BẮT BUỘC ĐĂNG KÝ VÀO REGISTRY:
 * Mọi icon SVG tùy biến hay từ thư viện dùng trong hệ thống
 * đều được đăng ký tường minh tại đây dưới dạng kebab-case.
 */
export const iconRegistry: Record<string, IconComponent> = {
  // Brand & Logos
  "logo": StudioLogoIcon,
  "studio-logo": StudioLogoIcon,

  // Semantic UI Icons từ Lucide
  "search": LucideIcons.Search,
  "close": LucideIcons.X,
  "x": LucideIcons.X,
  "plus": LucideIcons.Plus,
  "check": LucideIcons.Check,
  "check-circle-2": LucideIcons.CheckCircle2,
  "settings": LucideIcons.Settings,
  "sliders": LucideIcons.Sliders,
  "globe": LucideIcons.Globe,
  "palette": LucideIcons.Palette,
  "grid": LucideIcons.Grid,
  "sparkles": LucideIcons.Sparkles,
  "info": LucideIcons.Info,
  "bot": LucideIcons.Bot,
  "workflow": LucideIcons.Workflow,
  "upload": LucideIcons.Upload,
  "download": LucideIcons.Download,
  "trash-2": LucideIcons.Trash2,
  "arrow-right": LucideIcons.ArrowRight,
  "arrow-left": LucideIcons.ArrowLeft,
  "chevron-right": LucideIcons.ChevronRight,
  "chevron-left": LucideIcons.ChevronLeft,
  "layers": LucideIcons.Layers,
  "play": LucideIcons.Play,
  "save": LucideIcons.Save,
  "refresh-cw": LucideIcons.RefreshCw,
  "history": LucideIcons.History,
  "alert-circle": LucideIcons.AlertCircle,
  "copy": LucideIcons.Copy,
  "rotate-ccw": LucideIcons.RotateCcw,
  "folder-kanban": LucideIcons.FolderKanban,
  "zap": LucideIcons.Zap,
  "layout-template": LucideIcons.LayoutTemplate,
  "image": LucideIcons.Image,
  "split": LucideIcons.Split,
  "stamp": LucideIcons.Stamp,
  "send": LucideIcons.Send,
  "more-vertical": LucideIcons.MoreVertical,
  "eye": LucideIcons.Eye,
  "fast-forward": LucideIcons.FastForward,
  "power": LucideIcons.Power,
  "files": LucideIcons.Files,
};

import {
  Plane, Droplets, Zap, Flame, ShoppingCart, CloudRain,
  Bug, PawPrint, ShieldAlert, Construction, Calendar
} from "lucide-react";

export type AlertSeverity = "critical" | "high" | "medium" | "low" | "info";

export type AlertCategory =
  | "airstrike" | "water" | "electricity" | "gas" | "supplies"
  | "flood" | "outbreak" | "animals" | "security" | "roads" | "holiday";

export interface Alert {
  id: string | number;
  title: string;
  description: string;
  category: AlertCategory;
  severity: AlertSeverity;
  timestamp?: string;
  created_at?: string;
  location?: string;
  location_label?: string;
  isActive?: boolean;
  is_active?: number | boolean;
  alert_type?: 'geo' | 'city' | 'broadcast';
  target_lat?: number;
  target_lng?: number;
  target_radius_km?: number;
  target_cities?: string;
}

export const CATEGORIES: Record<AlertCategory, { label: string; icon: typeof Plane }> = {
  airstrike: { label: "غارة جوية وشيكة", icon: Plane },
  water: { label: "انقطاع المياه", icon: Droplets },
  electricity: { label: "انقطاع الكهرباء", icon: Zap },
  gas: { label: "انقطاع الغاز", icon: Flame },
  supplies: { label: "شراء مؤن طوارئ", icon: ShoppingCart },
  flood: { label: "أمطار غزيرة وفيضانات", icon: CloudRain },
  outbreak: { label: "تفشي وبائي", icon: Bug },
  animals: { label: "حيوانات مفترسة", icon: PawPrint },
  security: { label: "حادث أمني", icon: ShieldAlert },
  roads: { label: "إغلاق طرق", icon: Construction },
  holiday: { label: "عطلة رسمية", icon: Calendar },
};

export const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  critical: "حرج",
  high: "عالي",
  medium: "متوسط",
  low: "منخفض",
  info: "معلومات",
};

export const MOCK_ALERTS: Alert[] = [
  {
    id: "1",
    title: "تحذير: أمطار غزيرة متوقعة في الرمادي",
    description: "تتوقع هيئة الأرصاد الجوية هطول أمطار غزيرة خلال الساعات الـ 12 القادمة. يرجى الابتعاد عن المناطق المنخفضة والأودية. تم تأهيب فرق الإنقاذ.",
    category: "flood",
    severity: "high",
    timestamp: "2026-03-22T14:30:00",
    location: "الرمادي - وسط المدينة",
    isActive: true,
  },
  {
    id: "2",
    title: "انقطاع مياه الشرب في حي التأميم",
    description: "بسبب أعمال صيانة طارئة على الشبكة الرئيسية، سيتم قطع المياه من الساعة 8 مساءً حتى 6 صباحاً. يرجى تخزين كمية كافية من المياه.",
    category: "water",
    severity: "medium",
    timestamp: "2026-03-22T12:00:00",
    location: "الفلوجة - حي التأميم",
    isActive: true,
  },
  {
    id: "3",
    title: "إغلاق الطريق الدولي السريع مؤقتاً",
    description: "تم إغلاق الطريق الدولي السريع بين الرمادي والفلوجة بسبب حادث مروري. يرجى استخدام الطرق البديلة.",
    category: "roads",
    severity: "low",
    timestamp: "2026-03-22T10:15:00",
    location: "الطريق الدولي - الرمادي/الفلوجة",
    isActive: true,
  },
  {
    id: "4",
    title: "عطلة رسمية يوم الأحد",
    description: "تعلن محافظة الأنبار عن تعليق الدوام الرسمي يوم الأحد المقبل بمناسبة المولد النبوي الشريف.",
    category: "holiday",
    severity: "info",
    timestamp: "2026-03-21T09:00:00",
    location: "عموم محافظة الأنبار",
    isActive: false,
  },
  {
    id: "5",
    title: "انقطاع التيار الكهربائي في هيت",
    description: "انقطاع التيار الكهربائي عن عدة أحياء في مدينة هيت بسبب عطل في المحولة الرئيسية. فرق الصيانة تعمل على الإصلاح.",
    category: "electricity",
    severity: "medium",
    timestamp: "2026-03-21T16:45:00",
    location: "هيت - عدة أحياء",
    isActive: false,
  },
];

import type { EventCategory } from '../types/event';

export const EventCategoryColors: Record<
  EventCategory,
  { primary: string; background: string; text: string; badgeBg: string }
> = {
  workshop: {
    primary: '#8B5CF6',
    background: '#F5F3FF',
    badgeBg: 'rgba(139, 92, 246, 0.2)',
    text: '#6D28D9',
  },
  academic: {
    primary: '#3B82F6',
    background: '#EFF6FF',
    badgeBg: 'rgba(59, 130, 246, 0.2)',
    text: '#1D4ED8',
  },
  sports: {
    primary: '#10B981',
    background: '#ECFDF5',
    badgeBg: 'rgba(16, 185, 129, 0.2)',
    text: '#047857',
  },
  social: {
    primary: '#F59E0B',
    background: '#FFFBEB',
    badgeBg: 'rgba(245, 158, 11, 0.25)',
    text: '#B45309',
  },
  career: {
    primary: '#EF4444',
    background: '#FEF2F2',
    badgeBg: 'rgba(239, 68, 68, 0.2)',
    text: '#B91C1C',
  },
};

export function getCategoryLabel(category: EventCategory): string {
  const labels: Record<EventCategory, string> = {
    workshop: 'เวิร์กช็อปเทคนิค',
    academic: 'วิจัยฟิลด์รีเสิร์ช',
    sports: 'ยิม & PvP แบทเทิล',
    social: 'คอมมิวนิตี้มีตอัป',
    career: 'เทรด & ซาฟารี',
  };
  return labels[category] || category;
}

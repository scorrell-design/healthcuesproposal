import type { LucideIcon } from 'lucide-react';

export const IconRing = ({ Icon, size = 88 }: { Icon: LucideIcon; size?: number }) => (
  <div
    className="relative flex items-center justify-center rounded-full p-[2px]"
    style={{
      width: size,
      height: size,
      background: 'linear-gradient(135deg, #2FBF8F 0%, #3F7FF4 100%)',
    }}
  >
    <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
      <Icon
        size={size * 0.45}
        strokeWidth={1.5}
        className="text-brand-blue"
      />
    </div>
  </div>
);

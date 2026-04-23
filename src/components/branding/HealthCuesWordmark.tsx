import { HealthCuesMark } from './HealthCuesMark';

export function HealthCuesWordmark({ size = 32 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <HealthCuesMark size={size} />
      <span style={{ fontSize: size * 0.5, lineHeight: 1, color: '#0F172A' }}>
        <span className="font-bold">Health</span>
        <span className="font-normal">Cues</span>
      </span>
    </span>
  );
}

import type { RiskLevel } from '../../types';

const styles: Record<RiskLevel, string> = {
  Low: 'badge-low',
  Medium: 'badge-medium',
  High: 'badge-high',
  Critical: 'badge-critical',
};

export default function RiskBadge({ level }: { level: RiskLevel }) {
  return <span className={styles[level]}>{level}</span>;
}

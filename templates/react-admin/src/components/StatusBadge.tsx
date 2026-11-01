import type { UserStatus } from '../services/users';

export function StatusBadge({
  status,
  label,
}: {
  status: UserStatus;
  label: string;
}) {
  return <span className={`status-label ${status}`}>{label}</span>;
}

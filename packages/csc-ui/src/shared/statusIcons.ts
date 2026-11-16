/**
 * The icon of each status type, shared by c-alert, c-toast and c-status's
 * icon marker so one status draws the same icon everywhere (ADR-0087).
 */
import {
  mdiAlert,
  mdiCheckCircle,
  mdiCloseCircle,
  mdiInformation,
} from '@mdi/js';

/** A status type, as c-alert, c-toast and c-status spell it. */
type StatusType = 'error' | 'info' | 'success' | 'warning';

export const STATUS_ICONS: Readonly<Record<StatusType, string>> = {
  error: mdiCloseCircle,
  info: mdiInformation,
  success: mdiCheckCircle,
  warning: mdiAlert,
};

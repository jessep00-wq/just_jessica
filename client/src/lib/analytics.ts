type UmamiApi = {
  track?: (eventName: string, data?: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    umami?: UmamiApi;
  }
}

export function trackUxEvent(eventName: string, data?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  window.umami?.track?.(eventName, data);
}

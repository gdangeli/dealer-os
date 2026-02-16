/**
 * Notification trigger utilities
 * Call these after relevant events to send notifications
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || '';

/**
 * Trigger new lead notification email
 * Call this after creating a new lead
 */
export async function triggerNewLeadNotification(lead: {
  dealer_id: string;
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  vehicle_id?: string;
  source?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Only trigger server-side or in production
    if (typeof window !== 'undefined') {
      // Client-side: make API call
      const response = await fetch('/api/notifications/new-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lead),
      });

      if (!response.ok) {
        const error = await response.json();
        console.warn('Failed to trigger notification:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } else {
      // Server-side: use internal URL
      const baseUrl = APP_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/notifications/new-lead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lead),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message };
      }

      return { success: true };
    }
  } catch (error) {
    console.error('Error triggering notification:', error);
    return { success: false, error: String(error) };
  }
}

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AnnouncementPopup from '../components/AnnouncementPopup';

// Mock AuthContext
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'customer-test-123', email: 'farmer@agrimart.farm' },
    isAuthenticated: true,
  }),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

// Mock firebase database
const mockAnnouncement = {
  message: 'Subsidized DAP available at Phagwara Hub',
  type: 'once',
  createdAt: '2026-11-21T07:48:56.496Z',
};

let rtdbData = {
  'announcements/current': mockAnnouncement,
  'announcements/seen/user_customer-test-123': null,
};

vi.mock('firebase/database', () => ({
  getDatabase: vi.fn(() => ({})),
  ref: vi.fn((db, path) => ({ db, path })),
  onValue: vi.fn((refObj, callback) => {
    callback({
      exists: () => Boolean(rtdbData[refObj.path]),
      val: () => rtdbData[refObj.path],
    });
    return vi.fn(); // unsubscribe
  }),
  get: vi.fn((refObj) => {
    return Promise.resolve({
      exists: () => Boolean(rtdbData[refObj.path]),
      val: () => rtdbData[refObj.path],
    });
  }),
  set: vi.fn((refObj, val) => {
    rtdbData[refObj.path] = val;
    return Promise.resolve();
  }),
}));

describe('AnnouncementPopup Component', () => {
  beforeEach(() => {
    localStorage.clear();
    rtdbData['announcements/current'] = { ...mockAnnouncement };
    rtdbData['announcements/seen/user_customer-test-123'] = null;
  });

  it('renders announcement popup with message when published and unseen', async () => {
    render(<AnnouncementPopup />);

    await waitFor(() => {
      expect(screen.getByText('Official Announcement')).toBeDefined();
      expect(screen.getByText('Subsidized DAP available at Phagwara Hub')).toBeDefined();
    });
  });

  it('dismisses announcement and records seen state on acknowledge button click', async () => {
    render(<AnnouncementPopup />);

    await waitFor(() => {
      expect(screen.getByText('Subsidized DAP available at Phagwara Hub')).toBeDefined();
    });

    const dismissBtn = screen.getByRole('button', { name: /Acknowledge & Dismiss/i });
    fireEvent.click(dismissBtn);

    await waitFor(() => {
      expect(screen.queryByText('Subsidized DAP available at Phagwara Hub')).toBeNull();
    });
  });
});

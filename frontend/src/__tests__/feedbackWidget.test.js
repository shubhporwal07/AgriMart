import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FeedbackWidget from '../components/FeedbackWidget';

// Mock navigation
const mockPush = vi.fn();
let mockPathname = '/';
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock AuthContext
let mockAuthState = {
  user: null,
  isAuthenticated: false,
};
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

// Mock Firebase RTDB
const mockSet = vi.fn().mockResolvedValue();
const mockPushRef = vi.fn().mockReturnValue({ key: 'test_feedback_key_123' });
vi.mock('../config/firebase', () => ({
  realtimeDb: {},
}));

vi.mock('firebase/database', () => ({
  ref: vi.fn(),
  push: (...args) => mockPushRef(...args),
  set: (...args) => mockSet(...args),
}));

describe('Customer Feedback Widget Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/';
    mockAuthState = { user: null, isAuthenticated: false };
  });

  it('renders the small floating feedback tag on public storefront', () => {
    render(<FeedbackWidget />);
    const tag = screen.getByRole('button', { name: /open feedback form/i });
    expect(tag).toBeInTheDocument();
    expect(tag).toHaveTextContent(/feedback/i);
  });

  it('hides the floating feedback tag when on /admin or /admin/panel paths', () => {
    mockPathname = '/admin/panel';
    const { container } = render(<FeedbackWidget />);
    expect(screen.queryByRole('button', { name: /open feedback form/i })).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });

  it('prompts unauthenticated users to log in when opened', () => {
    mockAuthState = { user: null, isAuthenticated: false };
    render(<FeedbackWidget />);

    const tag = screen.getByRole('button', { name: /open feedback form/i });
    fireEvent.click(tag);

    expect(screen.getByText(/Sign In Required to Give Feedback/i)).toBeInTheDocument();
    expect(
      screen.getByText(/feedback and suggestions can only be submitted by registered users/i)
    ).toBeInTheDocument();

    const signInBtn = screen.getByRole('button', { name: /sign in to give feedback/i });
    expect(signInBtn).toBeInTheDocument();

    fireEvent.click(signInBtn);
    expect(mockPush).toHaveBeenCalledWith('/login?redirect=%2F');
  });

  it('displays the feedback form with user email and 500-char counter for logged-in users', () => {
    mockAuthState = {
      user: {
        uid: 'user_pranav_123',
        email: 'pranavsinghkia@gmail.com',
        displayName: 'Pranav Singh',
      },
      isAuthenticated: true,
    };
    render(<FeedbackWidget />);

    const tag = screen.getByRole('button', { name: /open feedback form/i });
    fireEvent.click(tag);

    // Verified account pill
    expect(screen.getByText('Pranav Singh')).toBeInTheDocument();
    expect(screen.getByText('pranavsinghkia@gmail.com')).toBeInTheDocument();
    expect(screen.getByText(/Verified Account/i)).toBeInTheDocument();

    // Live character counter starts at 0 / 500
    expect(screen.getByText('0 / 500')).toBeInTheDocument();

    // Topic chips exist
    expect(screen.getByRole('button', { name: /general suggestion/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /seed & fertilizer quality/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pricing & kisan subsidy/i })).toBeInTheDocument();

    // Textarea enforces maxLength 500
    const textarea = screen.getByPlaceholderText(/under 500 characters/i);
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('maxLength', '500');
  });

  it('updates live character counter as user types and submits to RTDB', async () => {
    mockAuthState = {
      user: {
        uid: 'user_pranav_123',
        email: 'pranavsinghkia@gmail.com',
        displayName: 'Pranav Singh',
      },
      isAuthenticated: true,
    };
    render(<FeedbackWidget />);

    const tag = screen.getByRole('button', { name: /open feedback form/i });
    fireEvent.click(tag);

    const textarea = screen.getByPlaceholderText(/under 500 characters/i);
    const feedbackText = 'AgriMart has excellent F1 hybrid tomato seeds! Please add drip irrigation accessories.';
    fireEvent.change(textarea, { target: { value: feedbackText } });

    expect(screen.getByText(`${feedbackText.length} / 500`)).toBeInTheDocument();

    // Switch topic chip to Seed & Fertilizer Quality
    const qualityChip = screen.getByRole('button', { name: /seed & fertilizer quality/i });
    fireEvent.click(qualityChip);

    // Submit feedback
    const submitBtn = screen.getByRole('button', { name: /submit feedback/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'test_feedback_key_123' }),
        expect.objectContaining({
          id: 'test_feedback_key_123',
          userId: 'user_pranav_123',
          userName: 'Pranav Singh',
          userEmail: 'pranavsinghkia@gmail.com',
          category: 'Seed & Fertilizer Quality',
          message: feedbackText,
        })
      );
    });

    // Success feedback message is displayed
    expect(screen.getByText(/Feedback Submitted Successfully!/i)).toBeInTheDocument();
  });
});

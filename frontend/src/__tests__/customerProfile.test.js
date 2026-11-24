import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfilePage from '../views/ProfilePage';

// Mock Next.js navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/profile',
}));

// Mock Navbar & Footer to keep view tests isolated
vi.mock('../components/Navbar', () => ({
  default: () => <nav data-testid="mock-navbar" />,
}));

vi.mock('../components/Footer', () => ({
  default: () => <footer data-testid="mock-footer" />,
}));

// Mock AuthContext
let mockUser = {
  uid: 'cust-shubh-123',
  displayName: 'Shubh Porwal',
  email: 'shubhporwal83@gmail.com',
};
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}));

// Mock LocationContext
vi.mock('../contexts/LocationContext', () => ({
  useLocationContext: () => ({
    location: { name: 'Phagwara Hub' },
    isServiceable: true,
    hubDistance: 3.2,
    presetLocations: [],
  }),
}));

// Mock ProductContext
vi.mock('../contexts/ProductContext', () => ({
  useProducts: () => ({
    cartCount: 0,
    wishlistCount: 2,
    cartTotal: 0,
    filters: {},
    setSearchQuery: vi.fn(),
    products: [],
    categories: [],
  }),
}));

// Mock Firebase
vi.mock('../config/firebase', () => ({
  db: {},
  realtimeDb: {},
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn().mockResolvedValue({ exists: () => false }),
  setDoc: vi.fn().mockResolvedValue(),
}));

vi.mock('firebase/database', () => ({
  ref: vi.fn(),
  get: vi.fn().mockResolvedValue({ exists: () => false }),
  set: vi.fn().mockResolvedValue(),
}));

describe('Customer Profile Page Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders customer profile with farmer name, Kisan ID, Aadhaar number, contact number, and address', () => {
    render(<ProfilePage />);

    // Farmer Name
    expect(screen.getAllByText(/Shubh Porwal/i).length).toBeGreaterThan(0);

    // Kisan ID presence
    expect(screen.getAllByText(/KISAN-PB-2024/i).length).toBeGreaterThan(0);

    // Aadhaar number (masked by default)
    expect(screen.getAllByText(/•••• •••• 9142/i).length).toBeGreaterThan(0);

    // Contact number
    expect(screen.getAllByText(/9876543210/i).length).toBeGreaterThan(0);

    // Address
    expect(screen.getAllByText(/Farm No. 14/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Phagwara/i).length).toBeGreaterThan(0);

    // Agricultural details
    expect(screen.getAllByText(/12.5 Acres/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Basmati Rice/i).length).toBeGreaterThan(0);
  });

  it('toggles Aadhaar visibility when clicking the Show/Hide button', () => {
    render(<ProfilePage />);

    // Initially masked in both the card and the details panel
    expect(screen.getAllByText('•••• •••• 9142').length).toBeGreaterThanOrEqual(1);

    // Click Show
    const toggleBtns = screen.getAllByRole('button', { name: /show/i });
    fireEvent.click(toggleBtns[0]);

    // Now unmasked
    expect(screen.getAllByText('5849 2038 9142').length).toBeGreaterThanOrEqual(1);
  });

  it('switches to editing mode when Edit Profile button is clicked', () => {
    render(<ProfilePage />);

    const editBtn = screen.getByRole('button', { name: /edit profile/i });
    fireEvent.click(editBtn);

    // Input fields should now be present
    expect(screen.getByDisplayValue('Shubh Porwal')).toBeInTheDocument();
    expect(screen.getByDisplayValue('9876543210')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });
});

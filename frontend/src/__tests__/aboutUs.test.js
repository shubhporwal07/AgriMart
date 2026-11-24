import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AboutUsPage from '../views/AboutUsPage';

// Mock Next.js navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/about-us',
}));

// Mock Navbar & Footer to keep view tests isolated
vi.mock('../components/Navbar', () => ({
  default: () => <nav data-testid="mock-navbar" />,
}));

vi.mock('../components/Footer', () => ({
  default: () => <footer data-testid="mock-footer" />,
}));

describe('AboutUsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders hero headline, mission, and toll-free helpline', () => {
    render(<AboutUsPage />);

    expect(screen.getByText(/Protecting India's Farmers From Counterfeits/i)).toBeInTheDocument();
    expect(screen.getAllByText(/1800-AGRI-MART/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/250,000\+/i)).toBeInTheDocument();
  });

  it('renders the four pillars of AgriMart', () => {
    render(<AboutUsPage />);

    expect(screen.getByText('Breeder Direct Contracts')).toBeInTheDocument();
    expect(screen.getByText('Dual Lab Batch Testing')).toBeInTheDocument();
    expect(screen.getByText('Cold Dark Store Hubs')).toBeInTheDocument();
    expect(screen.getByText('Direct Farm Dispatch')).toBeInTheDocument();
  });

  it('renders regional dark store hubs and allows toggling between Phagwara and Etawah', () => {
    render(<AboutUsPage />);

    // Phagwara active by default
    expect(screen.getByText(/AgriMart Kisan Hub #01 \(Punjab\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Lovely Professional University Agro Corridor/i)).toBeInTheDocument();

    // Click Etawah hub tab
    const etawahBtn = screen.getByRole('button', { name: /AgriMart Kisan Hub #02/i });
    fireEvent.click(etawahBtn);

    // Etawah details should now be visible
    expect(screen.getByText(/AgriMart Kisan Hub #02 \(Uttar Pradesh\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Civil Lines, Near Agriculture Mandi/i)).toBeInTheDocument();
  });

  it('renders certifications and farmer testimonials', () => {
    render(<AboutUsPage />);

    // Certifications
    expect(screen.getByText(/Seed Act 1966 & Rules 1968/i)).toBeInTheDocument();
    expect(screen.getByText(/Fertilizer Control Order \(FCO\) 1985/i)).toBeInTheDocument();

    // Farmer Testimonials
    expect(screen.getByText(/Sardar Gurpreet Singh/i)).toBeInTheDocument();
    expect(screen.getByText(/Rameshwar Dayal Yadav/i)).toBeInTheDocument();
    expect(screen.getByText(/Harjit Kaur/i)).toBeInTheDocument();
  });
});

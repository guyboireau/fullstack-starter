import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const MockChild = () => <div data-testid="protected">Protected Content</div>;

describe('ProtectedRoute', () => {
  it('shows loading spinner while loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
    } as unknown as ReturnType<typeof useAuth>);
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <MockChild />
        </ProtectedRoute>
      </MemoryRouter>,
    );
    expect(document.querySelector('.spinner')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
    } as unknown as ReturnType<typeof useAuth>);
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div data-testid="login">Login</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MockChild />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('login')).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: '1' },
      loading: false,
    } as unknown as ReturnType<typeof useAuth>);
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <MockChild />
        </ProtectedRoute>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('protected')).toBeInTheDocument();
  });
});

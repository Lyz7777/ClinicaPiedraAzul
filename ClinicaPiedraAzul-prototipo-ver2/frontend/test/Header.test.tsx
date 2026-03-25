import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Header from '../src/app/components/Header';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.location.reload
const reloadMock = vi.fn();
Object.defineProperty(window, 'location', {
  value: { reload: reloadMock },
});

describe('Header component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with default values when no token', () => {
    localStorageMock.getItem.mockReturnValue(null);

    render(<Header />);

    expect(screen.getByText('Clínica PiedraAzul')).toBeDefined();
    expect(screen.getByText('Centro de Especialidades Médicas')).toBeDefined();
    expect(screen.getByText('Admin')).toBeDefined();
  });

  it('should render with token data', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwidXNlcm5hbWUiOiJqb2huZG9lIn0';
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') return token;
      if (key === 'rol') return 'doctor';
      if (key === 'username') return 'johndoe';
      return null;
    });

    render(<Header />);

    expect(screen.getByText('johndoe')).toBeDefined();
  });

  it('should show current date', () => {
    localStorageMock.getItem.mockReturnValue(null);

    render(<Header />);

    const dateElement = screen.getByText(/lunes|martes|miércoles|jueves|viernes|sábado|domingo/);
    expect(dateElement).toBeDefined();
  });

  it('should call cerrarSesion and reload on logout click', () => {
    localStorageMock.getItem.mockReturnValue(null);

    render(<Header />);

    const logoutButton = screen.getByRole('button', { name: /salir/i });
    fireEvent.click(logoutButton);

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('rol');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('username');
    expect(reloadMock).toHaveBeenCalled();
  });
});
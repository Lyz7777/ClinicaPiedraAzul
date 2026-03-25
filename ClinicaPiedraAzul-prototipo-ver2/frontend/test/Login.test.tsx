import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../src/app/components/Login';

describe('Login component', () => {
  const onLoginMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('should render with usuario and contraseña', () => {
    render(<Login onLogin={onLoginMock} />);
    expect(screen.getByPlaceholderText('Usuario')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
  });

  it('should show alert with empty fields', () => {
    render(<Login onLogin={onLoginMock} />);
    fireEvent.click(screen.getByRole('button', { name: /Entrar al sistema/i }));
    expect(window.alert).toHaveBeenCalledWith('Por favor ingrese usuario y contraseña');
  });
});
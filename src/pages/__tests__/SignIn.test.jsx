import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SignIn from '../SignIn';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import api from '../../utils/api';

// Mock dependencies
vi.mock('../../utils/api');
vi.mock('../../components/OAuth', () => ({
  default: () => <button data-testid="oauth-button">Google OAuth</button>
}));

const mockStore = configureStore([]);

describe('SignIn Page', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      user: { loading: false, error: null, currentUser: null }
    });
    vi.clearAllMocks();
  });

  const renderSignIn = (customStore = store) => {
    return render(
      <Provider store={customStore}>
        <BrowserRouter>
          <SignIn />
        </BrowserRouter>
      </Provider>
    );
  };

  it('renders sign in form correctly', () => {
    renderSignIn();
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('updates input fields on typing', () => {
    renderSignIn();
    const emailInput = screen.getByPlaceholderText('Email Address');
    const passwordInput = screen.getByPlaceholderText('Password');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('dispatches signInStart and signInSuccess on successful login', async () => {
    const userProfile = { id: 1, name: 'Test User' };
    api.post.mockResolvedValueOnce({ userProfile });

    renderSignIn();
    
    fireEvent.change(screen.getByPlaceholderText('Email Address'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    // Check if loading state triggers disabled button (optimistic UI)
    // Note: Since we are mocking store, the component won't re-render with loading=true unless we update the mock store, 
    // but we can check if the correct actions were dispatched.
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/signin', {
        emailId: 'test@example.com',
        password: 'password123',
      });
    });

    const actions = store.getActions();
    // Expect clearError to be dispatched first on mount
    expect(actions[0]).toEqual(expect.objectContaining({ type: 'auth/clearError' }));
    expect(actions[1]).toEqual({ type: 'auth/signInStart' });
    expect(actions[2]).toEqual({ type: 'auth/signInSuccess', payload: userProfile });
  });

  it('dispatches signInFailure on API error', async () => {
    const errorMsg = 'Invalid credentials';
    api.post.mockRejectedValueOnce({
      response: { data: { message: errorMsg } }
    });

    renderSignIn();

    fireEvent.change(screen.getByPlaceholderText('Email Address'), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toContainEqual(expect.objectContaining({ 
        type: 'auth/signInFailure',
        payload: errorMsg 
      }));
    });
  });

  it('shows error message when Redux has error state', () => {
    store = mockStore({
      user: { loading: false, error: 'User not found', currentUser: null }
    });
    renderSignIn(store);
    expect(screen.getByText('User not found')).toBeInTheDocument();
  });
});

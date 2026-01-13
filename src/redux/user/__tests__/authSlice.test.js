import authReducer, {
  signInStart,
  signInSuccess,
  signInFailure,
  signOut,
  updateProfile,
  clearError
} from '../authSlice';
import { describe, it, expect } from 'vitest';

describe('authSlice Reducer', () => {
  const initialState = {
    currentUser: null,
    loading: false,
    error: null,
  };

  it('should handle initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle signInStart', () => {
    const actual = authReducer(initialState, signInStart());
    expect(actual.loading).toEqual(true);
    expect(actual.error).toBeNull();
  });

  it('should handle signInSuccess', () => {
    const user = { id: 1, name: 'Test User' };
    const actual = authReducer({ ...initialState, loading: true }, signInSuccess(user));
    expect(actual.loading).toEqual(false);
    expect(actual.currentUser).toEqual(user);
    expect(actual.error).toBeNull();
  });

  it('should handle signInFailure', () => {
    const errorMsg = 'Auth Failed';
    const actual = authReducer({ ...initialState, loading: true }, signInFailure(errorMsg));
    expect(actual.loading).toEqual(false);
    expect(actual.currentUser).toBeNull();
    expect(actual.error).toEqual(errorMsg);
  });

  it('should handle signOut', () => {
    const loggedInState = {
      currentUser: { id: 1 },
      loading: false,
      error: null
    };
    const actual = authReducer(loggedInState, signOut());
    expect(actual.currentUser).toBeNull();
    expect(actual.loading).toBe(false);
    expect(actual.error).toBeNull();
  });

  it('should handle updateProfile', () => {
    const loggedInState = {
      currentUser: { id: 1, name: 'Old Name', email: 'test@test.com' },
      loading: false,
      error: null
    };
    const update = { name: 'New Name' };
    const actual = authReducer(loggedInState, updateProfile(update));
    expect(actual.currentUser).toEqual({ id: 1, name: 'New Name', email: 'test@test.com' });
  });

  it('should not update profile if no user is logged in', () => {
    const actual = authReducer(initialState, updateProfile({ name: 'New Name' }));
    expect(actual.currentUser).toBeNull();
  });

  it('should handle clearError', () => {
    const errorState = { ...initialState, error: 'Some error' };
    const actual = authReducer(errorState, clearError());
    expect(actual.error).toBeNull();
  });
});

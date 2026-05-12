import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { apiClient } from '../api/client';

interface User {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  roles: string[];
  created_at: string;
  access_token?: string;
  token_type?: string;
  [key: string]: any; // Allow dynamic property access
}

interface AuthState {
  user: User | null;
  access_token: string | null;
  token_type: string | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  addRole: (role: string) => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; access_token: string; token_type: string } }
  | { type: 'LOGIN_FAILURE'; payload: { error: string } }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: { user: User; access_token: string; token_type: string } }
  | { type: 'REGISTER_FAILURE'; payload: { error: string } }
  | { type: 'FETCH_USER_START' }
  | { type: 'FETCH_USER_SUCCESS'; payload: { user: User } }
  | { type: 'FETCH_USER_FAILURE'; payload: { error: string } }
  | { type: 'ADD_ROLE_START' }
  | { type: 'ADD_ROLE_SUCCESS'; payload: { roles: string[] } }
  | { type: 'ADD_ROLE_FAILURE'; payload: { error: string } }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  access_token: null,
  token_type: null,
  isLoading: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
    case 'FETCH_USER_START':
    case 'ADD_ROLE_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        access_token: action.payload.access_token,
        token_type: action.payload.token_type,
        isLoading: false,
        error: null,
      };

    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
    case 'FETCH_USER_FAILURE':
    case 'ADD_ROLE_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        tokenType: null,
        isLoading: false,
        error: null,
      };

    case 'FETCH_USER_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isLoading: false,
        error: null,
      };

    case 'ADD_ROLE_SUCCESS':
      return {
        ...state,
        user: {
          ...state.user!,
          roles: action.payload.roles,
        },
        isLoading: false,
        error: null,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type');
    const userInfo = localStorage.getItem('user_info');

    if (token && tokenType && userInfo) {
      try {
        const user = JSON.parse(userInfo);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, access_token: token, token_type: tokenType }
        });
      } catch (error) {
        console.error('Failed to parse user info from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_type');
        localStorage.removeItem('user_info');
      }
    }
  }, []);

  // Also fetch user info on initial load if token exists
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      apiClient.getCurrentUser().then(user => {
        if (user) {
          dispatch({
            type: 'FETCH_USER_SUCCESS',
            payload: { user }
          });
        }
      }).catch(error => {
        console.error('Failed to fetch user info:', error);
        dispatch({
          type: 'FETCH_USER_FAILURE',
          payload: { error: error.message || 'Failed to fetch user info' }
        });
      });
    }
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await apiClient.login(email, password);
      
      // Store in localStorage
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('token_type', response.token_type);
      
      // Fetch user info to get roles
      const userInfo = await apiClient.getCurrentUser();
      localStorage.setItem('user_info', JSON.stringify(userInfo));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: userInfo, access_token: response.access_token, token_type: response.token_type }
      });
    } catch (error: any) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: { error: error.response?.data?.detail || 'Login failed' }
      });
    }
  };

  const register = async (name: string, email: string, password: string) => {
    dispatch({ type: 'REGISTER_START' });
    
    try {
      const response = await apiClient.register(name, email, password);
      
      // Store in localStorage
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('token_type', response.token_type);
      localStorage.setItem('user_info', JSON.stringify(response));

      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: { user: response, token: response.access_token, tokenType: response.token_type }
      });
    } catch (error: any) {
      dispatch({
        type: 'REGISTER_FAILURE',
        payload: { error: error.response?.data?.detail || 'Registration failed' }
      });
    }
  };

  const logout = async () => {
    dispatch({ type: 'LOGOUT' });
    
    try {
      await apiClient.logout();
      
      // Clear localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('user_info');
    } catch (error: any) {
      console.error('Logout error:', error);
    }
  };

  const addRole = async (role: string) => {
    dispatch({ type: 'ADD_ROLE_START' });
    
    try {
      await apiClient.addRole(role);
      
      // Update user info
      const userInfo = await apiClient.getCurrentUser();
      localStorage.setItem('user_info', JSON.stringify(userInfo));

      dispatch({
        type: 'ADD_ROLE_SUCCESS',
        payload: { roles: userInfo.roles }
      });
    } catch (error: any) {
      dispatch({
        type: 'ADD_ROLE_FAILURE',
        payload: { error: error.response?.data?.detail || 'Failed to add role' }
      });
    }
  };

  const fetchUser = async () => {
    dispatch({ type: 'FETCH_USER_START' });
    
    try {
      const userInfo = await apiClient.getCurrentUser();
      
      dispatch({
        type: 'FETCH_USER_SUCCESS',
        payload: { user: userInfo }
      });
    } catch (error: any) {
      dispatch({
        type: 'FETCH_USER_FAILURE',
        payload: { error: error.response?.data?.detail || 'Failed to fetch user' }
      });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    state,
    login,
    register,
    logout,
    addRole,
    fetchUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

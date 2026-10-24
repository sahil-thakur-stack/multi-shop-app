import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import React, {
  createContext, useCallback, useContext, useEffect, useState,
} from 'react';

export type UserRole = 'Buyer' | 'Seller';

export interface User {
  userId: number;
  phoneNumber: string;
  fullName: string;
  role: UserRole;
}

export interface SessionContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authToken: string | null;
  registrationToken: string | null;
  pendingRegistration: { fullName: string; role: UserRole } | null;

  // Auth actions
  sendOtp: (phoneNumber: string) => Promise<void>;
  verifyOtp: (phoneNumber: string, otp: string) => Promise<{ isNewUser: boolean; role?: UserRole; approvalStatus?: string | null }>;
  selectRole: (fullName: string, role: UserRole) => Promise<void>;
  setPendingRegistration: (data: { fullName: string; role: UserRole } | null) => void;
  logout: () => Promise<void>;

  // Dev action
  devLogin: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

let BACKEND_URL = 'https://localhost:7179';
if (Platform.OS === 'android') {
  BACKEND_URL = 'http://10.0.2.2:7179';
} else if (Platform.OS === 'ios') {
  BACKEND_URL = 'https://localhost:7179';
}

const STORAGE_KEY_TOKEN = 'auth-token';
const STORAGE_KEY_REFRESH_TOKEN = 'refresh-token';
const STORAGE_KEY_USER = 'auth-user';
const STORAGE_KEY_REG_TOKEN = 'registration-token';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [registrationToken, setRegistrationToken] = useState<string | null>(null);
  const [pendingRegistration, setPendingRegistration] = useState<{ fullName: string; role: UserRole } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session from storage and set up token refresh
  useEffect(() => {
    const loadSession = async () => {
      try {
        const [storedToken, storedRefreshToken, storedUser, storedRegToken] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_TOKEN),
          AsyncStorage.getItem(STORAGE_KEY_REFRESH_TOKEN),
          AsyncStorage.getItem(STORAGE_KEY_USER),
          AsyncStorage.getItem(STORAGE_KEY_REG_TOKEN),
        ]);

        if (storedToken) setAuthToken(storedToken);
        if (storedRefreshToken) setRefreshToken(storedRefreshToken);
        if (storedRegToken) setRegistrationToken(storedRegToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            // Ignore parse errors
          }
        }
      } catch (error) {
        console.error('Failed to load session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const sendOtp = useCallback(async (phoneNumber: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('SendOtp error:', error);
      throw error;
    }
  }, []);

  const verifyOtp = useCallback(async (phoneNumber: string, otp: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp }),
        credentials: 'include', // Include cookies for cross-origin requests
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to verify OTP');
      }

      const data = await response.json();

      if (data.isNewUser) {
        // Store registration token for new users
        setRegistrationToken(data.registrationToken);
        await AsyncStorage.setItem(STORAGE_KEY_REG_TOKEN, data.registrationToken);
      } else {
        // Existing user - store user data and tokens
        setUser({
          userId: data.userId,
          phoneNumber: data.phoneNumber,
          fullName: data.fullName,
          role: data.role,
        });
        setAuthToken(data.token);
        setRefreshToken(data.refreshToken);

        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify({
            userId: data.userId,
            phoneNumber: data.phoneNumber,
            fullName: data.fullName,
            role: data.role,
          })),
          AsyncStorage.setItem(STORAGE_KEY_TOKEN, data.token),
          AsyncStorage.setItem(STORAGE_KEY_REFRESH_TOKEN, data.refreshToken),
        ]);
      }

      // For existing sellers, check approval status
      let approvalStatus = null;
      if (!data.isNewUser && data.role === 'Seller') {
        try {
          console.log('🔍 Checking approval status for seller...');
          const approvalResponse = await fetch(`${BACKEND_URL}/api/seller/approval-status`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.token}`
            },
            credentials: 'include',
          });
          console.log('📡 Approval response status:', approvalResponse.status);

          if (approvalResponse.ok) {
            const approvalData = await approvalResponse.json();
            console.log('✅ Approval data:', approvalData);
            approvalStatus = approvalData.data?.approvalStatus;
          } else {
            const errorText = await approvalResponse.text();
            console.error('❌ Approval response error:', errorText);
          }
        } catch (error) {
          console.error('❌ Failed to check approval status:', error);
        }
      }

      const isNewUser = data.isNewUser === true;
      console.log('📤 VerifyOtp returning:', { isNewUser, role: data.role, approvalStatus });

      return {
        isNewUser: isNewUser,
        role: data.role as UserRole,
        approvalStatus: approvalStatus,
      };
    } catch (error) {
      console.error('VerifyOtp error:', error);
      throw error;
    }
  }, []);

  const setPendingRegistrationHandler = (data: { fullName: string; role: UserRole } | null) => {
    setPendingRegistration(data);
  };

  const selectRole = useCallback(async (fullName: string, role: UserRole) => {
    try {
      // Get registration token from storage (not from state due to race condition)
      const storedRegToken = await AsyncStorage.getItem(STORAGE_KEY_REG_TOKEN);
      if (!storedRegToken) {
        throw new Error('Registration token not found');
      }

      console.log('🎯 selectRole called with:', { fullName, role, roleType: typeof role });
      const roleValue = role === 'Seller' ? 2 : 1;
      console.log('📤 Sending roleValue:', roleValue, '(role was:', role, ')');

      const response = await fetch(`${BACKEND_URL}/api/auth/select-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storedRegToken}`,
        },
        body: JSON.stringify({
          FullName: fullName,
          Role: roleValue
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to select role');
      }

      const data = await response.json();

      // Store user data after role selection with tokens
      setUser({
        userId: data.userId,
        phoneNumber: data.phoneNumber,
        fullName: data.fullName,
        role: data.role,
      });
      setAuthToken(data.token);
      setRefreshToken(data.refreshToken);
      setRegistrationToken(null);

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify({
          userId: data.userId,
          phoneNumber: data.phoneNumber,
          fullName: data.fullName,
          role: data.role,
        })),
        AsyncStorage.setItem(STORAGE_KEY_TOKEN, data.token),
        AsyncStorage.setItem(STORAGE_KEY_REFRESH_TOKEN, data.refreshToken),
        AsyncStorage.removeItem(STORAGE_KEY_REG_TOKEN),
      ]);
    } catch (error) {
      console.error('SelectRole error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setAuthToken(null);
    setRefreshToken(null);
    setRegistrationToken(null);
    setIsLoading(false);

    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEY_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEY_REFRESH_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEY_USER),
      AsyncStorage.removeItem(STORAGE_KEY_REG_TOKEN),
    ]);

    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const devLogin = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/dev-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Dev login failed');
      }

      const data = await response.json();

      // Set user and tokens from response
      setUser({
        userId: data.userId,
        phoneNumber: data.phoneNumber,
        fullName: data.fullName,
        role: data.role,
      });

      setAuthToken(data.token);
      setRefreshToken(data.refreshToken);

      // Store in AsyncStorage
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify({
          userId: data.userId,
          phoneNumber: data.phoneNumber,
          fullName: data.fullName,
          role: data.role,
        })),
        AsyncStorage.setItem(STORAGE_KEY_TOKEN, data.token),
        AsyncStorage.setItem(STORAGE_KEY_REFRESH_TOKEN, data.refreshToken),
      ]);
    } catch (error) {
      console.error('Dev login error:', error);
      throw error;
    }
  }, []);

  // Refresh token when access token expires
  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();

      setAuthToken(data.accessToken);
      setRefreshToken(data.refreshToken);

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEY_TOKEN, data.accessToken),
        AsyncStorage.setItem(STORAGE_KEY_REFRESH_TOKEN, data.refreshToken),
      ]);

      return data.accessToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout user
      await logout();
      throw error;
    }
  }, [refreshToken]);

  const value: SessionContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    authToken,
    registrationToken,
    pendingRegistration,
    sendOtp,
    verifyOtp,
    selectRole,
    setPendingRegistration: setPendingRegistrationHandler,
    logout,
    devLogin,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

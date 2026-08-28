import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { authApi } from '../../api/authApi'
import type { UserProfile, LoginPayload } from '../../api/authApi'

export interface AuthState {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  isCheckingAuth: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,
  error: null,
}

export const checkAuth = createAsyncThunk<UserProfile | null, void>(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const profile = await authApi.getMe()
      return profile
    } catch {
      // Try refresh
      const refreshed = await authApi.refresh()
      if (refreshed) {
        try {
          return await authApi.getMe()
        } catch {
          return rejectWithValue(null)
        }
      }
      return rejectWithValue(null)
    }
  }
)

export const loginUser = createAsyncThunk<UserProfile, LoginPayload, { rejectValue: string }>(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      await authApi.login(payload)
      const profile = await authApi.getMe()
      return profile
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed'
      return rejectWithValue(message)
    }
  }
)

export const logoutUser = createAsyncThunk<void, void>(
  'auth/logout',
  async () => {
    await authApi.logout()
  }
)

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Check Auth
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isCheckingAuth = true
      })
      .addCase(checkAuth.fulfilled, (state, action: PayloadAction<UserProfile | null>) => {
        state.isCheckingAuth = false
        state.user = action.payload
        state.isAuthenticated = !!action.payload
        state.error = null
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isCheckingAuth = false
        state.user = null
        state.isAuthenticated = false
      })

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Login failed'
      })

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null
      state.isAuthenticated = false
      state.error = null
    })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer

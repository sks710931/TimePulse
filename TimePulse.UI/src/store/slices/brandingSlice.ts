import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { brandingApi } from '../../api/brandingApi'
import type { BrandSettings, UpdateBrandPayload } from '../../api/brandingApi'

export interface BrandingState {
  appName: string
  logoData: string | null
  logoType: string
  isCustom: boolean
  isLoading: boolean
  isSaving: boolean
  error: string | null
  successMessage: string | null
}

const initialState: BrandingState = {
  appName: 'TimePulse',
  logoData: null,
  logoType: 'Default',
  isCustom: false,
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null,
}

export const fetchBranding = createAsyncThunk<BrandSettings, void>(
  'branding/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await brandingApi.getBranding()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch branding'
      return rejectWithValue(message)
    }
  }
)

export const saveBranding = createAsyncThunk<BrandSettings, UpdateBrandPayload, { rejectValue: string }>(
  'branding/save',
  async (payload, { rejectWithValue }) => {
    try {
      return await brandingApi.updateBranding(payload)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save branding'
      return rejectWithValue(message)
    }
  }
)

export const resetBranding = createAsyncThunk<BrandSettings, void, { rejectValue: string }>(
  'branding/reset',
  async (_, { rejectWithValue }) => {
    try {
      return await brandingApi.resetBranding()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reset branding'
      return rejectWithValue(message)
    }
  }
)

export const brandingSlice = createSlice({
  name: 'branding',
  initialState,
  reducers: {
    clearBrandingMessages: (state) => {
      state.error = null
      state.successMessage = null
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder
      .addCase(fetchBranding.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchBranding.fulfilled, (state, action: PayloadAction<BrandSettings>) => {
        state.isLoading = false
        state.appName = action.payload.appName
        state.logoData = action.payload.logoData
        state.logoType = action.payload.logoType
        state.isCustom = action.payload.isCustom
      })
      .addCase(fetchBranding.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to load branding'
      })

    // Save
    builder
      .addCase(saveBranding.pending, (state) => {
        state.isSaving = true
        state.error = null
        state.successMessage = null
      })
      .addCase(saveBranding.fulfilled, (state, action: PayloadAction<BrandSettings>) => {
        state.isSaving = false
        state.appName = action.payload.appName
        state.logoData = action.payload.logoData
        state.logoType = action.payload.logoType
        state.isCustom = action.payload.isCustom
        state.successMessage = 'Branding updated successfully!'
      })
      .addCase(saveBranding.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.payload || 'Failed to save branding'
      })

    // Reset
    builder
      .addCase(resetBranding.pending, (state) => {
        state.isSaving = true
        state.error = null
        state.successMessage = null
      })
      .addCase(resetBranding.fulfilled, (state, action: PayloadAction<BrandSettings>) => {
        state.isSaving = false
        state.appName = action.payload.appName
        state.logoData = action.payload.logoData
        state.logoType = action.payload.logoType
        state.isCustom = action.payload.isCustom
        state.successMessage = 'Branding reset to default!'
      })
      .addCase(resetBranding.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.payload || 'Failed to reset branding'
      })
  },
})

export const { clearBrandingMessages } = brandingSlice.actions
export default brandingSlice.reducer

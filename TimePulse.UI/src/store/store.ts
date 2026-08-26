import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import brandingReducer from './slices/brandingSlice'
import themeReducer from './slices/themeSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    branding: brandingReducer,
    theme: themeReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

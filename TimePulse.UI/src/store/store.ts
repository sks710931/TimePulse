import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './slices/counterSlice'
import authReducer from './slices/authSlice'
import brandingReducer from './slices/brandingSlice'
import themeReducer from './slices/themeSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth: authReducer,
    branding: brandingReducer,
    theme: themeReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

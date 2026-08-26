import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './slices/counterSlice'
import authReducer from './slices/authSlice'
import brandingReducer from './slices/brandingSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth: authReducer,
    branding: brandingReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

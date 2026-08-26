import { useAppDispatch, useAppSelector } from './store/hooks'
import { increment, decrement, incrementByAmount, reset } from './store/slices/counterSlice'
import './App.css'

function App() {
  const count = useAppSelector((state) => state.counter.value)
  const dispatch = useAppDispatch()

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>TimePulse UI</h1>
      <p style={{ color: '#666' }}>React + TypeScript + Redux Toolkit</p>

      <div style={{ margin: '30px 0', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Counter: {count}</h2>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
          <button onClick={() => dispatch(decrement())} style={{ padding: '8px 16px' }}>- 1</button>
          <button onClick={() => dispatch(increment())} style={{ padding: '8px 16px' }}>+ 1</button>
          <button onClick={() => dispatch(incrementByAmount(5))} style={{ padding: '8px 16px' }}>+ 5</button>
          <button onClick={() => dispatch(reset())} style={{ padding: '8px 16px' }}>Reset</button>
        </div>
      </div>
    </div>
  )
}

export default App

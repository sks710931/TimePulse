import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { increment, decrement, incrementByAmount } from '../../store/slices/counterSlice'
import { Sliders, Plus, Minus, Layers } from 'lucide-react'

export function ReduxDemoTab() {
  const dispatch = useAppDispatch()
  const count = useAppSelector((state) => state.counter.value)
  const fullState = useAppSelector((state) => state)

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-200/40 dark:shadow-none transition-colors duration-200">
      <div className="flex items-center gap-2 mb-2">
        <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Redux Toolkit State Demo</h2>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
        Demonstrates global state dispatching (counter slice, auth slice, theme slice, branding slice).
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 p-6 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 mb-6">
        <div className="text-4xl font-bold font-mono text-indigo-600 dark:text-indigo-400 w-24 text-center">
          {count}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch(decrement())}
            className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
            title="Decrement"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => dispatch(increment())}
            className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
            title="Increment"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => dispatch(incrementByAmount(5))}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            +5 Bonus
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-2">
          <Layers className="w-4 h-4" />
          <span>Full Redux Store Inspector</span>
        </div>
        <pre className="p-4 bg-slate-950 text-indigo-400 text-xs font-mono rounded-xl overflow-x-auto border border-slate-800 max-h-64">
          {JSON.stringify(fullState, null, 2)}
        </pre>
      </div>
    </div>
  )
}

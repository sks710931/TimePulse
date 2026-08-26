import { ForecastCard, type WeatherItem } from './ForecastCard'
import { Alert } from '../common/Alert'
import { CloudSun, RefreshCw, Loader2, Code2 } from 'lucide-react'

interface ApiTesterTabProps {
  forecasts: WeatherItem[]
  isLoading: boolean
  error: string | null
  onRefresh: () => void
}

export function ApiTesterTab({
  forecasts,
  isLoading,
  error,
  onRefresh,
}: ApiTesterTabProps) {
  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-200/40 dark:shadow-none transition-colors duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CloudSun className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Protected API Data (Weather Forecast)</h2>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
        Demonstrates endpoint access guarded by <strong>[Authorize]</strong> JWT cookie tokens with transparent 401 refresh retry.
      </p>

      {error && <Alert type="error" message={error} className="mb-4" />}

      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <span className="text-xs">Fetching protected records...</span>
        </div>
      ) : forecasts.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500">
          No forecasts returned.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {forecasts.map((f, i) => (
            <ForecastCard key={i} forecast={f} />
          ))}
        </div>
      )}

      {/* Raw JSON viewer */}
      {forecasts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-2">
            <Code2 className="w-4 h-4" />
            <span>Raw Response Payload</span>
          </div>
          <pre className="p-3 bg-slate-950 text-emerald-400 text-xs font-mono rounded-xl overflow-x-auto border border-slate-800 max-h-48">
            {JSON.stringify(forecasts, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

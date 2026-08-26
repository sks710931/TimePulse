import { CloudSun } from 'lucide-react'

export interface WeatherItem {
  date: string
  temperatureC: number
  temperatureF: number
  summary: string
}

interface ForecastCardProps {
  forecast: WeatherItem
}

export function ForecastCard({ forecast }: ForecastCardProps) {
  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
          <CloudSun className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white">
            {forecast.summary}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {forecast.date}
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="text-lg font-bold text-slate-900 dark:text-white">
          {forecast.temperatureC}°C
        </div>
        <div className="text-xs text-slate-400">
          {forecast.temperatureF}°F
        </div>
      </div>
    </div>
  )
}

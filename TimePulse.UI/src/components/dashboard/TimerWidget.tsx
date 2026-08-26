import { useState, useEffect } from 'react'
import { Play, Square, Tag, Folder, RotateCcw } from 'lucide-react'

export function TimerWidget() {
  const [isRunning, setIsRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [taskName, setTaskName] = useState('')

  useEffect(() => {
    let interval: any = null
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1)
      }, 1000)
    } else if (!isRunning && seconds !== 0) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isRunning, seconds])

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600)
    const mins = Math.floor((totalSecs % 3600) / 60)
    const secs = totalSecs % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setSeconds(0)
  }

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Task description input */}
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            placeholder="What are you working on right now?"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="w-full sm:flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              className="flex-1 sm:flex-initial px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Folder className="w-3.5 h-3.5 text-indigo-500" />
              <span>Project</span>
            </button>
            <button
              type="button"
              className="flex-1 sm:flex-initial px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Tag className="w-3.5 h-3.5 text-purple-500" />
              <span>Tag</span>
            </button>
          </div>
        </div>

        {/* Timer Display & Action */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <span className="font-mono text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {formatTime(seconds)}
          </span>

          {seconds > 0 && !isRunning && (
            <button
              onClick={resetTimer}
              title="Reset Timer"
              className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={toggleTimer}
            className={`px-5 py-3 rounded-xl font-bold text-sm text-white flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
              isRunning
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
            }`}
          >
            {isRunning ? (
              <>
                <Square className="w-4 h-4" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Start</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

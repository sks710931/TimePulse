import { useState, useRef, useEffect } from 'react'
import { PlusCircle, Folder, Search, Check, X } from 'lucide-react'
import type { ProjectDto } from '../../api/projectApi'

interface ProjectPickerDropdownProps {
  projects: ProjectDto[]
  selectedProjectId?: string | null
  onSelectProject: (projectId: string | null) => void
  disabled?: boolean
}

export function ProjectPickerDropdown({
  projects,
  selectedProjectId,
  onSelectProject,
  disabled = false,
}: ProjectPickerDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedProject = projects.find((p) => p.id === selectedProjectId)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.clientName && p.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${
          selectedProject
            ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
            : 'text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 border border-transparent'
        }`}
      >
        {selectedProject ? (
          <>
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: selectedProject.colorHex || '#0284c7' }}
            />
            <span className="truncate max-w-[130px]">{selectedProject.name}</span>
          </>
        ) : (
          <>
            <PlusCircle className="w-3.5 h-3.5 text-sky-500" />
            <span>Project</span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Search Box */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 ml-1.5 shrink-0" />
            <input
              type="text"
              placeholder="Find project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full text-xs bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Project List */}
          <div className="max-h-60 overflow-y-auto py-1 text-xs divide-y divide-slate-50 dark:divide-slate-800/40">
            {/* Clear / No Project option */}
            <button
              type="button"
              onClick={() => {
                onSelectProject(null)
                setIsOpen(false)
              }}
              className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Folder className="w-3.5 h-3.5 text-slate-400" />
                <span>No Project</span>
              </div>
              {!selectedProjectId && <Check className="w-3.5 h-3.5 text-sky-500" />}
            </button>

            {filteredProjects.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">
                No matching projects found
              </div>
            ) : (
              filteredProjects.map((p) => {
                const isSelected = p.id === selectedProjectId
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSelectProject(p.id)
                      setIsOpen(false)
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected ? 'bg-sky-50/60 dark:bg-sky-950/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: p.colorHex || '#0284c7' }}
                      />
                      <div className="truncate">
                        <span className="font-semibold text-slate-900 dark:text-white truncate block">
                          {p.name}
                        </span>
                        {p.clientName && (
                          <span className="text-[10px] text-slate-400 block truncate">
                            {p.clientName}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-sky-500 shrink-0" />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

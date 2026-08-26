import { useAppSelector } from '../store/hooks'
import { Clock } from 'lucide-react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showText?: boolean
  textClassName?: string
  isSquare?: boolean
}

export function Logo({
  size = 'md',
  className = '',
  showText = false,
  textClassName = '',
  isSquare = false,
}: LogoProps) {
  const { appName, logoData, logoType } = useAppSelector((state) => state.branding)

  const defaultSquareClasses = {
    sm: { box: 'w-7 h-7 rounded-lg', icon: 'w-3.5 h-3.5', text: 'text-sm font-bold' },
    md: { box: 'w-8 h-8 rounded-xl', icon: 'w-4 h-4', text: 'text-base font-bold' },
    lg: { box: 'w-12 h-12 rounded-2xl', icon: 'w-6 h-6', text: 'text-xl font-bold' },
    xl: { box: 'w-16 h-16 rounded-3xl', icon: 'w-8 h-8', text: 'text-2xl font-extrabold' },
  }[size]

  const customSizingClasses = {
    sm: isSquare ? 'w-7 h-7 max-w-full max-h-full' : 'h-6 max-w-[120px] w-auto',
    md: isSquare ? 'w-8 h-8 max-w-full max-h-full' : 'h-7 max-w-[130px] w-auto',
    lg: isSquare ? 'w-12 h-12 max-w-full max-h-full' : 'h-10 max-w-[180px] w-auto',
    xl: isSquare ? 'w-16 h-16 max-w-full max-h-full' : 'h-12 max-w-[220px] w-auto',
  }[size]

  const altText = appName || 'Brand Logo'

  const renderLogoGraphic = () => {
    // 1. Custom SVG
    if (logoType === 'Svg' && logoData) {
      if (logoData.startsWith('<svg') || logoData.includes('</svg>')) {
        return (
          <div
            className={`inline-flex items-center justify-start ${customSizingClasses} [&>svg]:h-full [&>svg]:w-auto [&>svg]:max-h-full [&>svg]:max-w-full [&>svg]:object-contain overflow-hidden ${className}`}
            dangerouslySetInnerHTML={{ __html: logoData }}
          />
        )
      }

      // If SVG is a data-url or regular url
      return (
        <img
          src={logoData}
          alt={altText}
          className={`${customSizingClasses} object-contain ${className}`}
        />
      )
    }

    // 2. Custom Image (PNG / JPG / WebP / Data URL / Web URL)
    if ((logoType === 'Image' || logoType === 'Url') && logoData) {
      return (
        <img
          src={logoData}
          alt={altText}
          className={`${customSizingClasses} object-contain ${className}`}
        />
      )
    }

    // 3. Default TimePulse Logo (Clock icon)
    return (
      <div
        className={`${defaultSquareClasses.box} inline-flex items-center justify-center bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shadow-inner ${className}`}
      >
        <Clock className={defaultSquareClasses.icon} />
      </div>
    )
  }

  if (showText && appName) {
    return (
      <div className="inline-flex items-center gap-2.5">
        {renderLogoGraphic()}
        <span className={`text-slate-900 dark:text-white tracking-tight ${defaultSquareClasses.text} ${textClassName}`}>
          {appName}
        </span>
      </div>
    )
  }

  return renderLogoGraphic()
}

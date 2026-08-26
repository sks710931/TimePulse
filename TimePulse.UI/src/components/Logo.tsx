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
    sm: { box: 'w-8 h-8 rounded-lg', icon: 'w-4 h-4', text: 'text-sm font-bold' },
    md: { box: 'w-10 h-10 rounded-xl', icon: 'w-5 h-5', text: 'text-lg font-bold' },
    lg: { box: 'w-14 h-14 rounded-2xl', icon: 'w-7 h-7', text: 'text-2xl font-bold' },
    xl: { box: 'w-20 h-20 rounded-3xl', icon: 'w-10 h-10', text: 'text-3xl font-extrabold' },
  }[size]

  const customSizingClasses = {
    sm: isSquare ? 'w-8 h-8 max-w-full max-h-full' : 'max-h-8 max-w-[160px] w-auto h-auto',
    md: isSquare ? 'w-10 h-10 max-w-full max-h-full' : 'max-h-10 max-w-[200px] w-auto h-auto',
    lg: isSquare ? 'w-14 h-14 max-w-full max-h-full' : 'max-h-14 max-w-[260px] w-auto h-auto',
    xl: isSquare ? 'w-20 h-20 max-w-full max-h-full' : 'max-h-20 max-w-[320px] w-auto h-auto',
  }[size]

  const altText = appName || 'Brand Logo'

  const renderLogoGraphic = () => {
    // 1. Custom SVG
    if (logoType === 'Svg' && logoData) {
      if (logoData.startsWith('<svg') || logoData.includes('</svg>')) {
        return (
          <div
            className={`inline-flex items-center justify-center ${customSizingClasses} [&>svg]:w-auto [&>svg]:h-full [&>svg]:max-h-full [&>svg]:max-w-full [&>svg]:object-contain overflow-visible ${className}`}
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
      <div className="inline-flex items-center gap-3">
        {renderLogoGraphic()}
        <span className={`text-slate-900 dark:text-white tracking-tight ${defaultSquareClasses.text} ${textClassName}`}>
          {appName}
        </span>
      </div>
    )
  }

  return renderLogoGraphic()
}

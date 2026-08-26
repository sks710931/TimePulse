import { useAppSelector } from '../store/hooks'
import { Clock } from 'lucide-react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showText?: boolean
  textClassName?: string
}

export function Logo({
  size = 'md',
  className = '',
  showText = false,
  textClassName = '',
}: LogoProps) {
  const { appName, logoData, logoType } = useAppSelector((state) => state.branding)

  const sizeClasses = {
    sm: { box: 'w-8 h-8 rounded-lg', icon: 'w-4 h-4', text: 'text-sm font-bold' },
    md: { box: 'w-10 h-10 rounded-xl', icon: 'w-5 h-5', text: 'text-lg font-bold' },
    lg: { box: 'w-14 h-14 rounded-2xl', icon: 'w-7 h-7', text: 'text-2xl font-bold' },
    xl: { box: 'w-20 h-20 rounded-3xl', icon: 'w-10 h-10', text: 'text-3xl font-extrabold' },
  }[size]

  const displayName = appName || 'TimePulse'

  const renderLogoGraphic = () => {
    // 1. Custom SVG
    if (logoType === 'Svg' && logoData) {
      if (logoData.startsWith('<svg') || logoData.includes('</svg>')) {
        return (
          <div
            className={`${sizeClasses.box} flex items-center justify-center overflow-hidden [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain ${className}`}
            dangerouslySetInnerHTML={{ __html: logoData }}
          />
        )
      }

      // If SVG is a data-url or regular url
      return (
        <img
          src={logoData}
          alt={displayName}
          className={`${sizeClasses.box} object-contain ${className}`}
        />
      )
    }

    // 2. Custom Image (PNG / JPG / WebP / Data URL / Web URL)
    if ((logoType === 'Image' || logoType === 'Url') && logoData) {
      return (
        <img
          src={logoData}
          alt={displayName}
          className={`${sizeClasses.box} object-contain rounded-xl ${className}`}
        />
      )
    }

    // 3. Default TimePulse Logo
    return (
      <div
        className={`${sizeClasses.box} inline-flex items-center justify-center bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shadow-inner ${className}`}
      >
        <Clock className={sizeClasses.icon} />
      </div>
    )
  }

  if (showText) {
    return (
      <div className="inline-flex items-center gap-3">
        {renderLogoGraphic()}
        <span className={`text-white tracking-tight ${sizeClasses.text} ${textClassName}`}>
          {displayName}
        </span>
      </div>
    )
  }

  return renderLogoGraphic()
}

import { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

const sizeMap = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-9 w-9 text-sm',
  lg: 'h-11 w-11 text-base',
  xl: 'h-14 w-14 text-lg'
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function getColor(name: string) {
  const colors = ['from-blue-500 to-indigo-600','from-purple-500 to-pink-600','from-emerald-500 to-teal-600','from-amber-500 to-orange-600','from-red-500 to-rose-600','from-cyan-500 to-blue-600']
  return colors[name.charCodeAt(0) % colors.length]
}

export function Avatar({ src, name, size = 'md', className, ...props }: AvatarProps) {
  return (
    <div className={cn('relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br', getColor(name), sizeMap[size], className)} {...props}>
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="font-semibold text-white">{getInitials(name)}</span>
      )}
    </div>
  )
}

import React from 'react'

interface CleaveLogoProps {
  size?: number
  className?: string
}

export default function CleaveLogo({ size = 34, className = '' }: CleaveLogoProps): React.JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 38 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="cleave-top-face" x1="4" y1="3" x2="34" y2="17" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="cleave-mid-face" x1="4" y1="12" x2="34" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="cleave-bot-face" x1="4" y1="21" x2="34" y2="33" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>

      {/* Layer 1 - Top Slab */}
      <g>
        {/* Top slab bevel/side */}
        <path
          d="M4 11.2C4 11.2 5.5 14 18 19C30.5 14 32 11.2 32 11.2V13.8C32 14.8 31.2 15.7 30.3 16.1L19.2 20.6C18.4 20.9 17.6 20.9 16.8 20.6L5.7 16.1C4.8 15.7 4 14.8 4 13.8V11.2Z"
          fill="#1D4ED8"
          opacity="0.9"
        />
        {/* Top slab face */}
        <path
          d="M17.2 2.7C17.7 2.4 18.3 2.4 18.8 2.7L31 8.8C31.8 9.2 32.2 10.1 31.8 10.9C31.5 11.5 30.9 11.9 30.2 12.2L18.8 17.3C18.3 17.5 17.7 17.5 17.2 17.3L5.8 12.2C5.1 11.9 4.5 11.5 4.2 10.9C3.8 10.1 4.2 9.2 5 8.8L17.2 2.7Z"
          fill="url(#cleave-top-face)"
        />
      </g>

      {/* Layer 2 - Middle Slab */}
      <g>
        <path
          d="M4 19.5C4 19.5 5.5 22.3 18 27.3C30.5 22.3 32 19.5 32 19.5V21.5C32 22.5 31.2 23.4 30.3 23.8L19.2 28.3C18.4 28.6 17.6 28.6 16.8 28.3L5.7 23.8C4.8 23.4 4 22.5 4 21.5V19.5Z"
          fill="#1E40AF"
        />
        <path
          d="M17.2 12.5C17.7 12.2 18.3 12.2 18.8 12.5L30.2 18.2C30.9 18.5 31.5 18.9 31.8 19.5C31.2 20.1 30.2 20.6 29.5 20.9L18.8 25.3C18.3 25.5 17.7 25.5 17.2 25.3L6.5 20.9C5.8 20.6 4.8 20.1 4.2 19.5C4.5 18.9 5.1 18.5 5.8 18.2L17.2 12.5Z"
          fill="url(#cleave-mid-face)"
        />
      </g>

      {/* Layer 3 - Bottom Slab */}
      <g>
        <path
          d="M4 27.5C4 27.5 5.5 30.3 18 35.3C30.5 30.3 32 27.5 32 27.5V29.2C32 30.2 31.2 31.1 30.3 31.5L19.2 36C18.4 36.3 17.6 36.3 16.8 36L5.7 31.5C4.8 31.1 4 30.2 4 29.2V27.5Z"
          fill="#172554"
        />
        <path
          d="M17.2 20.5C17.7 20.2 18.3 20.2 18.8 20.5L30.2 26.2C30.9 26.5 31.5 26.9 31.8 27.5C31.2 28.1 30.2 28.6 29.5 28.9L18.8 33.3C18.3 33.5 17.7 33.5 17.2 33.3L6.5 28.9C5.8 28.6 4.8 28.1 4.2 27.5C4.5 26.9 5.1 26.5 5.8 26.2L17.2 20.5Z"
          fill="url(#cleave-bot-face)"
        />
      </g>
    </svg>
  )
}

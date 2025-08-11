import React from 'react'
import { cn } from '@/lib/utils'

export interface BarChartProps {
  data: Array<{
    label: string
    value: number
    maxValue?: number
  }>
  height?: number
  width?: number
  className?: string
  showValues?: boolean
  color?: string
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 200,
  width = 400,
  className,
  showValues = true,
  color = 'currentColor'
}) => {
  if (!data.length) return null
  
  const maxValue = Math.max(...data.map(d => d.maxValue || d.value))
  const barWidth = width / data.length
  const barSpacing = barWidth * 0.1
  
  return (
    <div className={cn("w-full", className)}>
      <svg
        width={width}
        height={height}
        className="w-full h-auto"
        aria-label="Bar chart"
      >
        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? (item.value / maxValue) * (height - 40) : 0
          const x = index * barWidth + barSpacing / 2
          const y = height - barHeight - 20
          
          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth - barSpacing}
                height={barHeight}
                fill={color}
                className="transition-all duration-300 ease-out hover:opacity-80"
                rx={4}
              />
              
              {/* Value label */}
              {showValues && (
                <text
                  x={x + (barWidth - barSpacing) / 2}
                  y={y - 8}
                  textAnchor="middle"
                  className="text-xs font-medium fill-current"
                >
                  {item.value}
                </text>
              )}
              
              {/* X-axis label */}
              <text
                x={x + (barWidth - barSpacing) / 2}
                y={height - 5}
                textAnchor="middle"
                className="text-xs fill-muted-foreground"
              >
                {item.label}
              </text>
            </g>
          )
        })}
        
        {/* Y-axis grid lines */}
        {Array.from({ length: 5 }, (_, i) => {
          const y = height - 20 - (i * (height - 40)) / 4
          const value = Math.round((i * maxValue) / 4)
          
          return (
            <g key={`grid-${i}`}>
              <line
                x1={0}
                y1={y}
                x2={width}
                y2={y}
                stroke="currentColor"
                strokeWidth={0.5}
                className="text-muted/20"
              />
              <text
                x={width + 5}
                y={y + 3}
                className="text-xs fill-muted-foreground"
              >
                {value}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

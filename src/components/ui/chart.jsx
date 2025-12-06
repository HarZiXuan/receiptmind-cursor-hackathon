import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "../../utils/cn"

// ChartConfig type definition (for reference)
// ChartConfig is an object where keys map to chart data keys
// Each value has optional: label, color, theme
export const ChartConfig = {} // Placeholder for type reference

// Chart container component
const ChartContainer = React.forwardRef(
  ({ id, config, children, className, ...props }, ref) => {
    const uniqueId = React.useId()
    const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

    return (
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-gray-500 dark:[&_.recharts-cartesian-axis-tick_text]:fill-gray-400 [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-gray-200 dark:[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-gray-700 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-gray-300 dark:[&_.recharts-curve.recharts-tooltip-cursor]:stroke-gray-600 [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-gray-200 dark:[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-gray-700 [&_.recharts-radial-bar-background-sector]:fill-gray-100 dark:[&_.recharts-radial-bar-background-sector]:fill-gray-800 [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-gray-100 dark:[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-gray-800 [&_.recharts-reference-line-line]:stroke-gray-300 dark:[&_.recharts-reference-line-line]:stroke-gray-600 [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    )
  }
)
ChartContainer.displayName = "Chart"

// Chart style component for CSS variables
const ChartStyle = ({ id, config }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(config)
          .filter(([_, config]) => config.theme || config.color)
          .map(([key, itemConfig]) => {
            const color = itemConfig.theme?.light || itemConfig.color || "hsl(var(--chart-1))"
            return `[data-chart=${id}] .color-${key} { color: ${color}; }`
          })
          .join("\n"),
      }}
    />
  )
}

// Chart tooltip component
const ChartTooltip = RechartsPrimitive.Tooltip

// Chart tooltip content component
const ChartTooltipContent = React.forwardRef(
  (
    {
      active,
      payload,
      label,
      indicator = "dot",
      nameKey,
      labelKey,
      labelFormatter,
      valueFormatter,
      className,
      ...props
    },
    ref
  ) => {
    const tooltipLabel = React.useMemo(() => {
      if (labelFormatter) {
        return labelFormatter(label, payload)
      }

      if (typeof label === "string" || typeof label === "number") {
        return label
      }

      if (labelKey && typeof payload?.[0]?.payload === "object") {
        return payload[0].payload[labelKey]
      }

      return label
    }, [label, labelFormatter, labelKey, payload])

    if (!active || !payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-white dark:bg-gray-800 px-2.5 py-1.5 text-xs shadow-md",
          className
        )}
        {...props}
      >
        <div className="grid gap-1.5">
          {tooltipLabel && (
            <div className="font-medium text-gray-900 dark:text-white">
              {tooltipLabel}
            </div>
          )}
          <div className="grid gap-1.5">
            {payload.map((item, index) => {
              const key = `${item.dataKey || item.name || "value"}-${index}`
              const itemConfig = item.payload?.config?.[item.dataKey || ""] || {}
              const indicatorColor = item.payload?.fill || item.color || item.payload?.fill

              const value = valueFormatter
                ? valueFormatter(item.value, item.payload, item, index)
                : item.value

              return (
                <div
                  key={key}
                  className="flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground"
                >
                  {indicator === "dot" && (
                    <div
                      className="mt-0.5 shrink-0 rounded-full border-[1.5px] border-current opacity-50"
                      style={{
                        backgroundColor: indicatorColor,
                        borderColor: indicatorColor,
                      }}
                    />
                  )}
                  {indicator === "line" && (
                    <div
                      className="mt-0.5 shrink-0 border-[1.5px] border-current opacity-50"
                      style={{
                        borderColor: indicatorColor,
                      }}
                    />
                  )}
                  <div
                    className={cn(
                      "flex flex-1 justify-between leading-none",
                      "gap-4 [&>dt]:text-muted-foreground [&>dd]:font-medium tabular-nums"
                    )}
                  >
                    <dt className="text-gray-600 dark:text-gray-400">
                      {itemConfig?.label || item.name}
                    </dt>
                    <dd className="text-gray-900 dark:text-white">
                      {value}
                    </dd>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

// Chart legend component
const ChartLegend = React.forwardRef(
  ({ payload, nameKey, className, ...props }, ref) => {
    if (!payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-wrap justify-center gap-4",
          className
        )}
        {...props}
      >
        {payload.map((item) => {
          const key = `${item.dataKey || item.value}`
          const itemConfig = item.payload?.config?.[item.dataKey || ""] || {}

          return (
            <div
              key={item.value}
              className={cn(
                "group/legend-item flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
              )}
            >
              <div
                className="rounded-[2px] border-[1.5px] border-current opacity-50"
                style={{
                  backgroundColor: item.color,
                  borderColor: item.color,
                }}
              />
              <span className="text-muted-foreground text-xs">
                {itemConfig?.label || item.value}
              </span>
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegend.displayName = "ChartLegend"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartStyle,
}


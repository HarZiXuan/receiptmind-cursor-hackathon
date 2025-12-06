import * as React from "react"
import { CartesianGrid, Line, LineChart as RechartsLineChart, XAxis, YAxis } from "recharts"
import { formatAmount } from '../../utils/formatAmount'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart"

const LINE_COLOR = "#0000E6"

export default function LineChart({ data, minDate, maxDate }) {
  // Sort data by date to ensure proper ordering
  const sortedData = React.useMemo(() => {
    if (!data || data.length === 0) return []
    
    return [...data]
      .sort((a, b) => {
        const dateA = new Date(a.date || 0)
        const dateB = new Date(b.date || 0)
        return dateA - dateB
      })
      .map(item => ({
        date: item.date,
        amount: item.amount || 0,
      }))
  }, [data])

  if (!sortedData || sortedData.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
        No data available for graph
      </div>
    )
  }

  if (sortedData.length < 2) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
        Need at least 2 data points to display graph
      </div>
    )
  }

  const chartConfig = {
    amount: {
      label: "Amount",
      color: LINE_COLOR,
    },
  }

  // Format date for x-axis
  const formatDateLabel = (value) => {
    try {
      const date = new Date(value)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    } catch (e) {
      return value
    }
  }

  // Format date for tooltip
  const formatTooltipDate = (value) => {
    try {
      const date = new Date(value)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch (e) {
      return value
    }
  }

  // Format amount for tooltip
  const formatTooltipAmount = (value) => {
    return formatAmount(value)
  }

  return (
    <div className="relative w-full h-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <RechartsLineChart
          data={sortedData}
          margin={{
            left: 12,
            right: 12,
            top: 12,
            bottom: 24,
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false}
            stroke="#e5e7eb"
            className="dark:stroke-gray-700"
          />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={formatDateLabel}
            tick={{ fill: '#6b7280', fontSize: 10 }}
            className="dark:[&_text]:fill-gray-400"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => formatAmount(value)}
            tick={{ fill: '#6b7280', fontSize: 10 }}
            className="dark:[&_text]:fill-gray-400"
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={formatTooltipDate}
                valueFormatter={formatTooltipAmount}
                nameKey="amount"
              />
            }
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke={LINE_COLOR}
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: LINE_COLOR, strokeWidth: 0 }}
          />
        </RechartsLineChart>
      </ChartContainer>
    </div>
  )
}

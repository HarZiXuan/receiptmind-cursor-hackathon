import * as React from "react"
import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { formatAmount } from '../../utils/formatAmount'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart"

const BAR_COLOR = "#0000E6"

export default function BarChart({ data, minDate, maxDate, preset }) {
  // Calculate date range in days
  const getDateRangeDays = () => {
    if (!minDate || !maxDate) return null
    const start = new Date(minDate)
    const end = new Date(maxDate)
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  }

  const dateRangeDays = getDateRangeDays()

  // Create fixed date buckets based on preset and aggregate data
  const createFixedBuckets = React.useMemo(() => {
    if (!minDate || !maxDate) {
      // Fallback: use data as-is if no date range
      return data.map(d => ({ ...d, bucketDate: d.date }))
    }

    const start = new Date(minDate)
    const end = new Date(maxDate)
    const buckets = []

    // 7D: Create 7 bars for Monday-Sunday (7 days of the week)
    if (preset === '7D') {
      // Find the Monday of the week containing the end date (most recent week)
      const monday = new Date(end)
      const dayOfWeek = monday.getDay() // 0 = Sunday, 1 = Monday, etc.
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // If Sunday, go back 6 days
      monday.setDate(monday.getDate() + daysToMonday)
      monday.setHours(0, 0, 0, 0)
      
      // Create 7 daily buckets (Monday to Sunday)
      for (let i = 0; i < 7; i++) {
        const bucketDate = new Date(monday)
        bucketDate.setDate(monday.getDate() + i)
        bucketDate.setHours(0, 0, 0, 0)
        const bucketEnd = new Date(bucketDate)
        bucketEnd.setHours(23, 59, 59, 999)
        
        const dateKey = bucketDate.toISOString().split('T')[0]
        
        // Aggregate all data that falls on this specific day
        let dayAmount = 0
        data.forEach(d => {
          if (d.date) {
            const dataDate = new Date(d.date)
            dataDate.setHours(0, 0, 0, 0)
            if (dataDate.getTime() === bucketDate.getTime()) {
              dayAmount += d.amount || 0
            }
          }
        })
        
        buckets.push({
          date: dateKey,
          amount: dayAmount,
          bucketDate: dateKey
        })
      }
    }
    // 30D: Create bars for each day in the date range (30/31 days)
    else if (preset === '30D') {
      const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      
      for (let i = 0; i < totalDays; i++) {
        const bucketDate = new Date(start)
        bucketDate.setDate(start.getDate() + i)
        bucketDate.setHours(0, 0, 0, 0)
        if (bucketDate > end) break
        
        const bucketEnd = new Date(bucketDate)
        bucketEnd.setHours(23, 59, 59, 999)
        if (bucketEnd > end) bucketEnd.setTime(end.getTime())
        
        const dateKey = bucketDate.toISOString().split('T')[0]
        
        // Aggregate all data that falls on this specific day
        let dayAmount = 0
        data.forEach(d => {
          if (d.date) {
            const dataDate = new Date(d.date)
            dataDate.setHours(0, 0, 0, 0)
            if (dataDate.getTime() === bucketDate.getTime()) {
              dayAmount += d.amount || 0
            }
          }
        })
        
        buckets.push({
          date: dateKey,
          amount: dayAmount,
          bucketDate: dateKey
        })
      }
    }
    // 3M: Create 12 bars for 12 weeks (3 months = ~12 weeks)
    else if (preset === '3M') {
      // Find the Monday of the week containing the start date
      const monday = new Date(start)
      const dayOfWeek = monday.getDay()
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      monday.setDate(monday.getDate() + daysToMonday)
      monday.setHours(0, 0, 0, 0)
      
      // Create 12 weekly buckets
      for (let i = 0; i < 12; i++) {
        const weekStart = new Date(monday)
        weekStart.setDate(monday.getDate() + (i * 7))
        weekStart.setHours(0, 0, 0, 0)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        weekEnd.setHours(23, 59, 59, 999)
        if (weekEnd > end) weekEnd.setTime(end.getTime())
        if (weekStart > end) break
        
        // Aggregate all data within this week
        let weekAmount = 0
        const weekStartKey = weekStart.toISOString().split('T')[0]
        
        data.forEach(d => {
          if (d.date) {
            const dataDate = new Date(d.date)
            dataDate.setHours(0, 0, 0, 0)
            if (dataDate >= weekStart && dataDate <= weekEnd) {
              weekAmount += d.amount || 0
            }
          }
        })
        
        buckets.push({
          date: weekStartKey,
          amount: weekAmount,
          bucketDate: weekStartKey
        })
      }
    }
    // 6M: Create 24 bars for 24 weeks (6 months = ~24 weeks)
    else if (preset === '6M') {
      // Find the Monday of the week containing the start date
      const monday = new Date(start)
      const dayOfWeek = monday.getDay()
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      monday.setDate(monday.getDate() + daysToMonday)
      monday.setHours(0, 0, 0, 0)
      
      // Create 24 weekly buckets
      for (let i = 0; i < 24; i++) {
        const weekStart = new Date(monday)
        weekStart.setDate(monday.getDate() + (i * 7))
        weekStart.setHours(0, 0, 0, 0)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        weekEnd.setHours(23, 59, 59, 999)
        if (weekEnd > end) weekEnd.setTime(end.getTime())
        if (weekStart > end) break
        
        // Aggregate all data within this week
        let weekAmount = 0
        const weekStartKey = weekStart.toISOString().split('T')[0]
        
        data.forEach(d => {
          if (d.date) {
            const dataDate = new Date(d.date)
            dataDate.setHours(0, 0, 0, 0)
            if (dataDate >= weekStart && dataDate <= weekEnd) {
              weekAmount += d.amount || 0
            }
          }
        })
        
        buckets.push({
          date: weekStartKey,
          amount: weekAmount,
          bucketDate: weekStartKey
        })
      }
    }
    // 12M (1Y): Create 12 bars for 12 months (January-December)
    else if (preset === '12M') {
      const startMonth = start.getMonth()
      const startYear = start.getFullYear()
      
      for (let i = 0; i < 12; i++) {
        const monthDate = new Date(startYear, startMonth + i, 1)
        monthDate.setHours(0, 0, 0, 0)
        if (monthDate > end) break
        
        const monthEnd = new Date(startYear, startMonth + i + 1, 0)
        monthEnd.setHours(23, 59, 59, 999)
        if (monthEnd > end) monthEnd.setTime(end.getTime())
        
        // Aggregate all data within this month
        let monthAmount = 0
        const monthStartKey = monthDate.toISOString().split('T')[0]
        
        data.forEach(d => {
          if (d.date) {
            const dataDate = new Date(d.date)
            dataDate.setHours(0, 0, 0, 0)
            if (dataDate >= monthDate && dataDate <= monthEnd) {
              monthAmount += d.amount || 0
            }
          }
        })
        
        buckets.push({
          date: monthStartKey,
          amount: monthAmount,
          bucketDate: monthDate.toISOString().split('T')[0]
        })
      }
    }
    // Default: use data as-is if no preset or custom range
    else {
      return data.map(d => ({ ...d, bucketDate: d.date }))
    }

    return buckets
  }, [data, minDate, maxDate, preset])

  const visibleData = createFixedBuckets

  if (!visibleData || visibleData.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
        No data available for graph
      </div>
    )
  }

  const chartConfig = {
    amount: {
      label: "Amount",
      color: BAR_COLOR,
    },
  }

  // Format date label based on preset
  const formatDateLabel = (value) => {
    if (!value) return ''
    try {
      const date = new Date(value)
      
      // 7D: Show day name (Monday, Tuesday, etc.)
      if (preset === '7D') {
        return date.toLocaleDateString('en-US', { weekday: 'short' })
      }
      
      // 30D: Show date as "12/7", "12/8" format
      if (preset === '30D') {
        return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
      }
      
      // 3M: Show date format like "12/1"
      if (preset === '3M') {
        return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
      }
      
      // 6M: Show date format like "12/1"
      if (preset === '6M') {
        return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
      }
      
      // 12M (1Y): Show month name (Jan, Feb, etc.)
      if (preset === '12M') {
        return date.toLocaleDateString('en-US', { month: 'short' })
      }
      
      // Default: show weekday and month
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    } catch (e) {
      return value
    }
  }

  // Filter labels for 30D to show every 3rd label (not all 30 labels)
  const getTickFormatter = () => {
    if (preset === '30D' && visibleData.length > 10) {
      // Return a function that only shows every 3rd tick
      return (value, index) => {
        if (index === 0 || index === visibleData.length - 1) return formatDateLabel(value)
        return index % 3 === 0 ? formatDateLabel(value) : ''
      }
    }
    return formatDateLabel
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
        <RechartsBarChart
          data={visibleData}
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
            dataKey="bucketDate"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={getTickFormatter()}
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
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={formatTooltipDate}
                valueFormatter={formatTooltipAmount}
                nameKey="amount"
              />
            }
          />
          <Bar 
            dataKey="amount" 
            fill={BAR_COLOR} 
            radius={[4, 4, 0, 0]}
          />
        </RechartsBarChart>
      </ChartContainer>
    </div>
  )
}

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  ComposedChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { money, monthLabel, number } from '../lib/format'
import type { Bucket, CategoryStat, Histogram } from '../lib/stats'
import { useStore } from '../state/store'

const tooltipStyle = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-line)',
  borderRadius: '0.6rem',
  fontSize: '12px',
  color: 'var(--color-ink)',
  boxShadow: '0 8px 24px rgb(0 0 0 / 0.12)',
}

function useFmt() {
  const { settings } = useStore()
  return {
    m: (v: number) => money(v, settings.displayCurrency, settings.locale),
    mc: (v: number) => money(v, settings.displayCurrency, settings.locale, true),
    n: (v: number) => number(v, settings.locale),
    locale: settings.locale,
  }
}

export function SpendOverTime({ data, height = 260 }: { data: Bucket[]; height?: number }) {
  const { m, mc, locale } = useFmt()
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.45} />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="key" tickFormatter={(k: string) => monthLabel(k, locale)} minTickGap={28} tickLine={false} axisLine={false} />
        <YAxis tickFormatter={mc} width={72} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={(k) => monthLabel(String(k), locale)}
          formatter={(v, name) => [name === 'amount' ? m(Number(v)) : String(v), name === 'amount' ? 'Spend' : 'Orders']}
        />
        <Area type="monotone" dataKey="amount" stroke="var(--color-accent)" strokeWidth={2} fill="url(#spendFill)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function SpendPerYear({ data, height = 260 }: { data: Bucket[]; height?: number }) {
  const { m, mc, n } = useFmt()
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="key" tickLine={false} axisLine={false} />
        <YAxis yAxisId="left" tickFormatter={mc} width={72} tickLine={false} axisLine={false} />
        <YAxis yAxisId="right" orientation="right" width={40} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v, name) => (name === 'amount' ? [m(Number(v)), 'Spend'] : [n(Number(v)), 'Orders'])}
        />
        <Bar yAxisId="left" dataKey="amount" fill="var(--color-accent)" radius={[4, 4, 0, 0]} maxBarSize={44} />
        <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export function CategoryDonut({ data, height = 260 }: { data: CategoryStat[]; height?: number }) {
  const { m } = useFmt()
  const { colors } = useStore()
  const top = data.slice(0, 10).map((d) => ({ ...d, fill: colors[d.category] ?? '#94a3b8' }))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={top} dataKey="amount" nameKey="category" innerRadius="55%" outerRadius="85%" paddingAngle={2} stroke="none" />
        <Tooltip contentStyle={tooltipStyle} formatter={(v, name) => [m(Number(v)), String(name)]} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function HistogramChart({
  data,
  height = 220,
  mode = 'value',
  color = 'var(--color-accent)',
}: {
  data: Histogram[]
  height?: number
  mode?: 'value' | 'count'
  color?: string
}) {
  const { m, mc, n } = useFmt()
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} interval={data.length > 26 ? 'preserveStartEnd' : 0} minTickGap={2} />
        <YAxis tickFormatter={mode === 'value' ? mc : n} width={56} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v, key) => (key === 'value' ? [m(Number(v)), 'Spend'] : [n(Number(v)), 'Orders'])}
        />
        <Bar dataKey={mode} fill={color} radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )
}

/** Horizontal bars — the readable choice when the labels are category names. */
export function HorizontalBars({
  data,
  mode = 'value',
  color = 'var(--color-accent)',
}: {
  data: Histogram[]
  mode?: 'value' | 'count'
  color?: string
}) {
  const { m, mc, n } = useFmt()
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 28 + 24)}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" tickFormatter={mode === 'value' ? mc : n} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="label" width={150} interval={0} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: 'var(--color-canvas)' }}
          formatter={(v, key) => (key === 'value' ? [m(Number(v)), 'Spend'] : [n(Number(v)), 'Items'])}
        />
        <Bar dataKey={mode} fill={color} radius={[0, 4, 4, 0]} maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  )
}

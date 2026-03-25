import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

function PopulationChart({ data }) {
  if (!data || data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
        <XAxis dataKey="annee" tick={{ fontSize: 11 }} />
        <YAxis
          tick={{ fontSize: 11 }}
          width={50}
          tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
        />
        <Tooltip
          formatter={(value) => [value.toLocaleString(), 'Population']}
          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
        />
        <Area
          type="monotone"
          dataKey="population"
          stroke="#4F46E5"
          fill="#e2dfff"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default PopulationChart

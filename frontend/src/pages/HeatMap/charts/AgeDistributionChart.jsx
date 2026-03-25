import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

function AgeDistributionChart({ data }) {
  if (!data || data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} unit="%" />
        <YAxis dataKey="tranche" type="category" tick={{ fontSize: 11 }} width={40} />
        <Tooltip
          formatter={(value) => [`${value}%`, 'Part']}
          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
        />
        <Bar dataKey="pourcentage" fill="#4F46E5" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default AgeDistributionChart

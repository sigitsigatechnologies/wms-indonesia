'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface ChartData {
  date: string
  label: string
  revenue: number
  profit: number
}

interface DashboardChartProps {
  data: ChartData[]
  title: string
}

export default function DashboardChart({ data, title }: DashboardChartProps) {
  return (
    <div className="interactive-card general-card" style={{ 
      padding: '1.5rem',
      backgroundColor: '#F2F2F2',
      borderRadius: '12px',
      border: '1px solid #D6E3E2',
    }}>
      <h3 style={{ margin: '0 0 1rem 0', color: '#202124', fontSize: '1.1rem', fontWeight: '600' }}>{title}</h3>
      <div style={{ height: '300px', width: '100%', transform: 'translate3d(0,0,0)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D6E3E2" />
            <XAxis dataKey="label" stroke="rgba(32, 33, 36, 0.6)" fontSize={12} />
            <YAxis 
              stroke="rgba(32, 33, 36, 0.6)" 
              fontSize={12}
              tickFormatter={(value) => `Rp ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              formatter={(value) => [`Rp ${Number(value).toLocaleString('id-ID')}`, '']}
              labelStyle={{ color: '#202124' }}
              contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #F2F2F2', borderRadius: '8px' }}
            />
            <Legend />
            <Bar dataKey="revenue" name="Revenue" fill="#1A73E8" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="profit" name="Profit" fill="#34A853" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

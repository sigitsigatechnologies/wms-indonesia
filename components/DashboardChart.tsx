'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

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
      <h3 style={{ margin: '0 0 1rem 0', color: '#1A2B4C', fontSize: '1.1rem', fontWeight: '600' }}>{title}</h3>
      <div style={{ height: '300px', width: '100%', transform: 'translate3d(0,0,0)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D6E3E2" />
            <XAxis dataKey="label" stroke="rgba(26, 43, 76, 0.6)" fontSize={12} />
            <YAxis 
              stroke="rgba(26, 43, 76, 0.6)" 
              fontSize={12}
              tickFormatter={(value) => `Rp ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              formatter={(value) => [`Rp ${Number(value).toLocaleString('id-ID')}`, '']}
              labelStyle={{ color: '#1A2B4C' }}
              contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #F2F2F2', borderRadius: '8px' }}
            />
            <Legend />
            <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#1E4FCF" strokeWidth={2} dot={{ fill: '#1E4FCF' }} isAnimationActive={false} />
            <Line type="monotone" dataKey="profit" name="Profit" stroke="#FF4D5A" strokeWidth={2} dot={{ fill: '#FF4D5A' }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

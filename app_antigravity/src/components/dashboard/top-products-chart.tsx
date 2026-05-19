"use client"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Cell,
} from "recharts"

type TopProduct = {
    nombre: string
    unidades: number
}

const COLORS = ["#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe"]

export function TopProductsChart({ data }: { data: TopProduct[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[200px] flex items-center justify-center text-slate-300 text-sm">
                Sin datos de ventas este mes
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={220}>
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
            >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                <XAxis
                    type="number"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v} ud.`}
                />
                <YAxis
                    dataKey="nombre"
                    type="category"
                    width={110}
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#475569" }}
                    tickFormatter={(val: string) => val.length > 14 ? val.slice(0, 13) + "…" : val}
                />
                <Tooltip
                    cursor={{ fill: "#f1f5f9" }}
                    contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
                        fontSize: "12px",
                    }}
                    formatter={(value: any) => [`${value} unidades`, "Vendidas"]}
                />
                <Bar dataKey="unidades" radius={[0, 6, 6, 0]} animationDuration={1200}>
                    {data.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}

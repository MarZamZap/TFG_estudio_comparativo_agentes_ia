"use client"

import {
    AreaChart,
    Area,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts"
import { formatCurrency } from "@/lib/utils"

export function OverviewChart({ data }: { data: { name: string; total: number }[] }) {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />
                <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                />
                <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatCurrency(value)}
                    width={70}
                />
                <Tooltip
                    cursor={{ stroke: "#4f46e5", strokeWidth: 1, strokeDasharray: "4 4" }}
                    contentStyle={{
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.12)",
                        fontSize: "13px",
                    }}
                    formatter={(value: any) => [formatCurrency(value), "Ingresos"]}
                    labelStyle={{ fontWeight: "bold", color: "#334155", marginBottom: "4px" }}
                />
                <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    fill="url(#colorTotal)"
                    dot={{ r: 4, fill: "#4f46e5", strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#4f46e5", strokeWidth: 2, stroke: "#fff" }}
                    animationDuration={1200}
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}


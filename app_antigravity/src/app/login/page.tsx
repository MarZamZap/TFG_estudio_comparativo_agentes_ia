"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { loginAction, seedInitialAdminData } from "@/actions/auth"
import toast from "react-hot-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Glasses } from "lucide-react"

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [creds, setCreds] = useState({ username: "", password: "" })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const res = await loginAction(creds.username, creds.password)

        if (res.success) {
            toast.success("¡Bienvenido!")
            router.push("/")
            router.refresh()
        } else {
            toast.error(res.error || "Credenciales incorrectas")
        }

        setLoading(false)
    }

    // Utilidad extra para el deploy inicial si la BD está vacía
    const handleSeed = async () => {
        const res = await seedInitialAdminData()
        if (res.success) {
            toast.success(res.message || "Admin creado")
            setCreds({ username: "admin", password: "admin" })
        } else {
            toast.error(res.error || "Error al crear datos semilla")
        }
    }

    return (
        <div className="w-full max-w-sm px-4">
            <Card className="border-0 shadow-lg ring-1 ring-slate-100 animate-in fade-in zoom-in-95 duration-500">
                <CardHeader className="space-y-2 text-center pb-6">
                    <div className="mx-auto bg-indigo-50 w-14 h-14 rounded-full flex items-center justify-center mb-2">
                        <Glasses className="w-7 h-7 text-indigo-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-slate-800">
                        Sistema Óptica
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                        Ingrese sus credenciales corporativas
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Usuario</Label>
                            <Input
                                id="username"
                                autoComplete="username"
                                required
                                value={creds.username}
                                onChange={e => setCreds(prev => ({ ...prev, username: e.target.value }))}
                                className="bg-slate-50/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Contraseña</Label>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={creds.password}
                                onChange={e => setCreds(prev => ({ ...prev, password: e.target.value }))}
                                className="bg-slate-50/50"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                        >
                            {loading ? "Verificando..." : "Ingresar"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

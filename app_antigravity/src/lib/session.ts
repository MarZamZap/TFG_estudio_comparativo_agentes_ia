import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

// Define in .env for production
const secretKey = process.env.SESSION_SECRET || 'tfg_optica_super_secret_key_2026_dev_only'
const encodedKey = new TextEncoder().encode(secretKey)

export type SessionPayload = {
    usuarioId: string
    tiendaId: string
    username: string
    nombre: string
    expiresAt: Date
}

export async function encrypt(payload: SessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1d')
        .sign(encodedKey)
}

export async function decrypt(session: string | undefined = '') {
    try {
        const { payload } = await jwtVerify(session, encodedKey, {
            algorithms: ['HS256'],
        })
        return payload as SessionPayload
    } catch (error) {
        // console.log('Failed to verify session')
        return null
    }
}

export async function createSession(usuarioId: string, tiendaId: string, username: string, nombre: string) {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
    const session = await encrypt({ usuarioId, tiendaId, username, nombre, expiresAt })

    const cookieStore = await cookies()
    cookieStore.set('session', session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    })
}

export async function verifySession() {
    const cookieStore = await cookies()
    const cookie = cookieStore.get('session')?.value
    const session = await decrypt(cookie)

    if (!session?.usuarioId) {
        return { isAuth: false }
    }

    return { isAuth: true, session }
}

export async function deleteSession() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
}

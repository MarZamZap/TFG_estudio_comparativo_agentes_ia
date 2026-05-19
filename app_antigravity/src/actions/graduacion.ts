"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"
import { z } from "zod"

const graduacionSchema = z.object({
    odEsfera: z.number(),
    odCilindro: z.number(),
    odEje: z.number().min(0).max(180),
    odAdicion: z.number().optional().nullable(),
    odAgudezaVisual: z.string().optional().nullable(),
    oiEsfera: z.number(),
    oiCilindro: z.number(),
    oiEje: z.number().min(0).max(180),
    oiAdicion: z.number().optional().nullable(),
    oiAgudezaVisual: z.string().optional().nullable(),
    distanciaInter: z.number().positive().optional().nullable(),
    notas: z.string().optional().nullable(),
})

export async function createGraduacion(clienteId: string, data: {
    odEsfera: number;
    odCilindro: number;
    odEje: number;
    odAdicion?: number;
    odAgudezaVisual?: string;
    oiEsfera: number;
    oiCilindro: number;
    oiEje: number;
    oiAdicion?: number;
    oiAgudezaVisual?: string;
    distanciaInter?: number;
    notas?: string;
}) {
    try {
        const parsed = graduacionSchema.safeParse(data);
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0].message };
        }
        const validData = parsed.data;

        const graduacion = await prisma.clienteGraduacion.create({
            data: {
                clienteId,
                odEsfera: new Prisma.Decimal(validData.odEsfera),
                odCilindro: new Prisma.Decimal(validData.odCilindro),
                odEje: validData.odEje,
                odAdicion: validData.odAdicion ? new Prisma.Decimal(validData.odAdicion) : null,
                odAgudezaVisual: validData.odAgudezaVisual || null,
                oiEsfera: new Prisma.Decimal(validData.oiEsfera),
                oiCilindro: new Prisma.Decimal(validData.oiCilindro),
                oiEje: validData.oiEje,
                oiAdicion: validData.oiAdicion ? new Prisma.Decimal(validData.oiAdicion) : null,
                oiAgudezaVisual: validData.oiAgudezaVisual || null,
                distanciaInter: validData.distanciaInter ? new Prisma.Decimal(validData.distanciaInter) : null,
                notas: validData.notas || null,
            },
        });

        revalidatePath(`/clientes/${clienteId}`);
        return { success: true, data: { id: graduacion.id } };
    } catch (error) {
        console.error("Error creating graduacion:", error);
        return { success: false, error: "Error al registrar la graduación clínica." };
    }
}

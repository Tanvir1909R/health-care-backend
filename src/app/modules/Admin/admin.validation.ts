import {z} from 'zod'

export const adminUpdateZodSchema = z.object({
    body:z.object({
        name:z.string().optional(),
        contactNumber:z.string().optional()
    }).strict()
})
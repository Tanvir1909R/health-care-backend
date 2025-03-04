import {z} from 'zod'

export const createSpecialtiesZodSchema = z.object({
    title:z.string({
        required_error:"title is required"
    })
})
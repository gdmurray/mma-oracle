import * as z from "zod"

export const Reference = z.object({
    $ref: z.string(),
})

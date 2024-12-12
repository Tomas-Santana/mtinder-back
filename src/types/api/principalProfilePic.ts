import z from "zod"

export const principalProfilePicSchema = z.object({
  index: z.number(),
})

export type PrincipalProfilePic = z.infer<typeof principalProfilePicSchema>
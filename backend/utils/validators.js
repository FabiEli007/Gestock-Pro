import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Le nom est requis"),
  email: z.string().trim().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caracteres"),
  role: z.enum(["admin", "manager", "cashier"]).optional()
});

export const loginSchema = z.object({
  email: z.string().trim().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis")
});

export const productSchema = z.object({
  name: z.string().trim().min(2),
  reference: z.string().trim().min(2),
  category: z.string().trim().min(2),
  purchasePrice: z.coerce.number().min(0),
  sellingPrice: z.coerce.number().min(0),
  quantity: z.coerce.number().int().min(0).default(0),
  threshold: z.coerce.number().int().min(0).default(5),
  image: z.string().optional().nullable()
});

export const productUpdateSchema = productSchema.partial();

export const stockMovementSchema = z.object({
  product: z.string().min(1),
  type: z.enum(["IN", "OUT"]),
  quantity: z.coerce.number().int().positive(),
  reason: z.string().trim().min(2)
});

export const saleSchema = z.object({
  products: z
    .array(
      z.object({
        product: z.string().min(1),
        quantity: z.coerce.number().int().positive(),
        price: z.coerce.number().min(0).optional()
      })
    )
    .min(1, "Une vente doit contenir au moins un produit")
});

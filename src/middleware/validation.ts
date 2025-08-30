import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorDetails =
          (error as any).errors?.map((err: any) => ({
            field: err.path?.join(".") || "unknown",
            message: err.message || "Validation error",
          })) || [];

        return res.status(400).json({
          error: "Validation failed",
          details: errorDetails,
        });
      }
      return res.status(400).json({ error: "Invalid request body" });
    }
  };
}

export function validateParams<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.params);
      req.params = validatedData as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorDetails =
          (error as any).errors?.map((err: any) => ({
            field: err.path?.join(".") || "unknown",
            message: err.message || "Validation error",
          })) || [];

        return res.status(400).json({
          error: "Invalid parameters",
          details: errorDetails,
        });
      }
      return res.status(400).json({ error: "Invalid parameters" });
    }
  };
}

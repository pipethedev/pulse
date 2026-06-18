import { z } from "zod";
import { CheckStatus } from "../types/enums.js";

const checkStatusSchema = z.nativeEnum(CheckStatus);

export function toCheckStatus(value: string): CheckStatus {
  return checkStatusSchema.parse(value);
}

export function toNullableNumber(value: number | string | null): number | null {
  if (value === null) return null;
  return Number(value);
}

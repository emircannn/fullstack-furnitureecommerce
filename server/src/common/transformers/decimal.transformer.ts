// ============================================================
// Belenay Mobilya - Decimal Transformer
// TypeORM MySQL'den gelen decimal string değerlerini
// number tipine dönüştürmek için kullanılır.
// ============================================================

import { ValueTransformer } from 'typeorm';

export const DecimalTransformer: ValueTransformer = {
  // Veritabanına yazarken: number → string (MySQL için)
  to(value: number | null | undefined): number | null | undefined {
    return value;
  },
  // Veritabanından okurken: string → number
  from(value: string | null | undefined): number | null | undefined {
    if (value === null) return null;
    if (value === undefined) return undefined;
    return parseFloat(value);
  },
};

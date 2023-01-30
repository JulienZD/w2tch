import type { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';

export const PrismaError = {
  UNIQUE_CONSTRAINT: 'Unique constraint failure',
  REQUIRED_RECORD_NOT_FOUND: 'Item could not be found',
  NO_RELATION_FOUND: 'Related item could not be found',
  UNKNOWN: 'An unknown error occurred',
} as const;

const errorCodesMap = {
  P2002: new TRPCError({ code: 'CONFLICT', message: PrismaError.UNIQUE_CONSTRAINT }),
  P2003: new TRPCError({ code: 'NOT_FOUND', message: PrismaError.NO_RELATION_FOUND }),
  P2025: new TRPCError({ code: 'NOT_FOUND', message: PrismaError.REQUIRED_RECORD_NOT_FOUND }),
} satisfies Record<string, TRPCError>;

export const createTRPCErrorFromDatabaseError = (error: Prisma.PrismaClientKnownRequestError): TRPCError => {
  const trpcError = errorCodesMap[error.code as never];
  return trpcError ?? new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: PrismaError.UNKNOWN });
};

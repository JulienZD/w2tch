import { z } from 'zod';
import { getBaseUrl } from '~/utils/trpc';

export const expiryOptionsInHours = [1, 6, 24, 168] as const;

export const zInvite = z.object({
  expiresAfterHours: z
    .preprocess(Number, z.number())
    .refine((n) => (expiryOptionsInHours as readonly number[]).includes(n)),
  hasUnlimitedUsages: z.boolean(),
  maxUses: z.preprocess(Number, z.number().int().positive()).or(z.null()),
});

type ExpirationOption = {
  label: string;
  hours: number;
};

export const expiryOptions = expiryOptionsInHours.map((hours) => ({
  hours,
  label: new Intl.RelativeTimeFormat().format(hours <= 24 ? hours : hours / 24, hours <= 24 ? 'hour' : 'day'),
})) satisfies ExpirationOption[];

export const createInviteUrl = (inviteId: string) => `${getBaseUrl()}/join/${inviteId}`;

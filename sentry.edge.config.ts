import * as Sentry from '@sentry/nextjs';
import { ExtraErrorData as ExtraErrorDataIntegration } from '@sentry/integrations';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const isProduction =
  process.env.NODE_ENV === 'production' &&
  (process.env.VERCEL_ENV === 'production' || process.env.NEXT_PUBLIC_VERCEL_ENV === 'production');

const ignoredAuthRoutes = ['/api/auth/session', '/api/auth/providers', '/api/auth/csrf'];

if (isProduction && SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampler: (samplingContext) => {
      if (samplingContext?.request?.url && ignoredAuthRoutes.includes(samplingContext?.request?.url)) {
        return 0;
      }

      return 0.25;
    },
    integrations: [new ExtraErrorDataIntegration()],
  });
}

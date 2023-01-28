// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import { ExtraErrorData as ExtraErrorDataIntegration } from '@sentry/integrations';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (process.env.NODE_ENV !== 'development' && SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.2,
    tracesSampler: (samplingContext) => {
      // Ignore auth session requests
      if (samplingContext?.request?.url === '/api/auth/session') {
        return 0;
      }

      return 0.2;
    },
    integrations: [new ExtraErrorDataIntegration()],
  });
}

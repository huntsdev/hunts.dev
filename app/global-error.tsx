'use client'

import * as React from 'react'
import posthog from 'posthog-js'

import { ErrorPage } from '@/components/ErrorPage'

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    if (
      process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN &&
      process.env.NEXT_PUBLIC_POSTHOG_HOST
    ) {
      posthog.captureException(error)
    }

    console.error(error)
  }, [error])

  return (
    <html lang='en'>
      <body>
        <ErrorPage statusCode={500} onRetry={reset} />
      </body>
    </html>
  )
}

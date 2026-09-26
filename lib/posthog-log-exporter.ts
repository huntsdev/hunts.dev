import { SeverityNumber, type Logger } from '@opentelemetry/api-logs'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import {
  LoggerProvider,
  SimpleLogRecordProcessor
} from '@opentelemetry/sdk-logs'
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions'

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST

let loggerProvider: LoggerProvider | undefined
let posthogLogger: Logger | undefined

if (!projectToken || !posthogHost) {
  if (process.env.NODE_ENV !== 'production') {
    const missingVariable = !projectToken
      ? 'NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN'
      : 'NEXT_PUBLIC_POSTHOG_HOST'

    throw new Error(
      `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`
    )
  }
} else {
  const exporter = new OTLPLogExporter({
    url: `${posthogHost.replace(/\/$/, '')}/i/v1/logs`,
    headers: {
      Authorization: `Bearer ${projectToken}`
    }
  })
  loggerProvider = new LoggerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'nextjs-notion-starter-kit'
    }),
    processors: [new SimpleLogRecordProcessor({ exporter })]
  })

  posthogLogger = loggerProvider.getLogger('posthog-integration')
}

export function logNotionSearchStarted() {
  posthogLogger?.emit({
    severityNumber: SeverityNumber.INFO,
    severityText: 'INFO',
    body: 'Notion search started',
    attributes: {
      operation: 'notion_search'
    }
  })
}

export function logNotionSearchCompleted() {
  posthogLogger?.emit({
    severityNumber: SeverityNumber.INFO,
    severityText: 'INFO',
    body: 'Notion search completed',
    attributes: {
      operation: 'notion_search'
    }
  })
}

export async function flushPostHogLogs() {
  await loggerProvider?.forceFlush()
}

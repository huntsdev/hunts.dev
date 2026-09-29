import cs from 'classnames'
import type { ButtonBlock, ExtendedRecordMap } from 'notion-types'
import { getTextContent } from 'notion-utils'
import { Button, useNotionContext } from 'react-notion-x'

import styles from './NotionButton.module.css'

type Automation = { properties?: { name?: string } }
type AutomationRecord =
  | Automation
  | { value: Automation | { value: Automation } }

export function NotionButton({
  block,
  blockId,
  className
}: {
  block: ButtonBlock
  blockId: string
  className?: string
}) {
  const { recordMap } = useNotionContext()
  const automationId = block.format?.automation_id
  const automations = (
    recordMap as ExtendedRecordMap & {
      automation?: Record<string, AutomationRecord>
    }
  ).automation
  const entry = automationId ? automations?.[automationId] : undefined
  const value = entry && 'value' in entry ? entry.value : entry
  const automation = value && 'value' in value ? value.value : value
  const label =
    automation?.properties?.name || getTextContent(block.properties?.title)
  const isSource =
    label.trim().replace(/\s+/g, ' ').toLowerCase() === 'view source'

  return (
    <Button
      block={{ ...block, format: { ...block.format, block_color: undefined } }}
      blockId={blockId}
      className={cs(className, styles.button, isSource && styles.source)}
    />
  )
}

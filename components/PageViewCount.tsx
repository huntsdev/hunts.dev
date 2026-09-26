'use client'

import * as React from 'react'
import { parsePageId } from 'notion-utils'

import { EyeIcon } from '@/lib/icons/eye'

import styles from './styles.module.css'

export function PageViewCount({ pageId }: { pageId: string }) {
  const [count, setCount] = React.useState<number | null>(null)
  const countedPageId = React.useRef<string | null>(null)
  const canonicalPageId = parsePageId(pageId, { uuid: false }) ?? pageId

  React.useEffect(() => {
    if (countedPageId.current === canonicalPageId) {
      return
    }

    countedPageId.current = canonicalPageId

    fetch('/api/page-views', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ pageId: canonicalPageId })
    })
      .then((response) =>
        response.ok
          ? (response.json() as Promise<{ count?: number }>)
          : undefined
      )
      .then((result) => {
        if (typeof result?.count === 'number') {
          setCount(result.count)
        }
      })
      .catch(() => {})
  }, [canonicalPageId])

  if (count === null) {
    return null
  }

  return (
    <span className={styles.pageViewCount} aria-label={`${count} views`}>
      <EyeIcon />
      <span>{count.toLocaleString()}</span>
    </span>
  )
}

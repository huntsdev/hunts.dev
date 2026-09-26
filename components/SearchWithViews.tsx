'use client'

import {
  getBlockParentPage,
  getBlockTitle,
  getBlockValue,
  parsePageId
} from 'notion-utils'
import * as React from 'react'
import type { ExtendedRecordMap } from 'notion-types'
import { useNotionContext } from 'react-notion-x'

import { EyeIcon } from '@/lib/icons/eye'

import styles from './styles.module.css'

type SearchRow = {
  id: string
  pageId: string
  title: string
  href: string
  excerpt: string
}

export function SearchWithViews() {
  const { mapPageUrl, rootPageId, searchNotion } = useNotionContext()
  const [isOpen, setIsOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [rows, setRows] = React.useState<SearchRow[]>([])
  const [counts, setCounts] = React.useState<Record<string, number>>({})
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const onGlobalKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        openSearch()
      }
    }

    window.addEventListener('keydown', onGlobalKeyDown)
    return () => window.removeEventListener('keydown', onGlobalKeyDown)
  }, [])

  React.useEffect(() => {
    if (!isOpen) {
      return
    }

    inputRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  React.useEffect(() => {
    const trimmedQuery = query.trim()
    if (!isOpen || !trimmedQuery || !searchNotion || !rootPageId) {
      setRows([])
      setIsLoading(false)
      return
    }

    let isCurrent = true
    setIsLoading(true)
    const timeout = window.setTimeout(async () => {
      try {
        const result = await searchNotion({
          query: trimmedQuery,
          ancestorId: rootPageId
        })
        const recordMap = result.recordMap as ExtendedRecordMap
        const nextRows = result.results
          .map((searchResult) => {
            const block = getBlockValue(recordMap.block[searchResult.id])
            if (!block) {
              return
            }

            const page = getBlockParentPage(block, recordMap, {
              inclusive: true
            })
            const pageId = page?.id
            const title = page && getBlockTitle(page, recordMap)
            if (!pageId || !title) {
              return
            }

            return {
              id: searchResult.id,
              pageId: parsePageId(pageId, { uuid: false }) ?? pageId,
              title,
              href: mapPageUrl(pageId, recordMap),
              excerpt: searchResult.highlight?.text
                ?.replaceAll(/<\/?gzknfouu>/gi, '')
                .trim()
            }
          })
          .filter((row): row is SearchRow => !!row)
        const uniqueRows = [
          ...new Map(nextRows.map((row) => [row.pageId, row])).values()
        ]

        if (isCurrent) {
          setRows(uniqueRows)
          setActiveIndex(0)
          setIsLoading(false)

          const pageIds = [...new Set(uniqueRows.map((row) => row.pageId))]
          if (pageIds.length) {
            const response = await fetch(
              `/api/page-views?ids=${encodeURIComponent(pageIds.join(','))}`
            )
            if (response.ok && isCurrent) {
              const data = (await response.json()) as {
                counts: Record<string, number>
              }
              setCounts(data.counts)
            }
          }
        }
      } catch {
        if (isCurrent) {
          setRows([])
          setIsLoading(false)
        }
      }
    }, 220)

    return () => {
      isCurrent = false
      window.clearTimeout(timeout)
    }
  }, [isOpen, mapPageUrl, query, rootPageId, searchNotion])

  function openSearch() {
    setQuery('')
    setRows([])
    setCounts({})
    setIsOpen(true)
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' && rows.length) {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % rows.length)
    } else if (event.key === 'ArrowUp' && rows.length) {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + rows.length) % rows.length)
    } else if (event.key === 'Enter' && rows[activeIndex]) {
      window.location.assign(rows[activeIndex]!.href)
    }
  }

  return (
    <>
      <button
        type='button'
        className={styles.searchTrigger}
        aria-label='Search pages'
        title='Search pages'
        onClick={openSearch}
      >
        <svg viewBox='0 0 24 24' aria-hidden='true'>
          <circle cx='10.8' cy='10.8' r='6.8' />
          <path d='m16 16 5 5' />
        </svg>
      </button>

      {isOpen && (
        <div
          className={styles.viewSearchOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false)
            }
          }}
        >
          <section
            className={styles.viewSearchDialog}
            role='dialog'
            aria-modal='true'
            aria-label='Search pages'
          >
            <div className={styles.viewSearchInputRow}>
              <svg viewBox='0 0 24 24' aria-hidden='true'>
                <circle cx='10.8' cy='10.8' r='6.8' />
                <path d='m16 16 5 5' />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder='Search projects and writeups...'
                aria-label='Search projects and writeups'
              />
              <button
                type='button'
                className={styles.viewSearchClose}
                aria-label='Close search'
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>

            {query.trim() && (
              <div className={styles.viewSearchResults} aria-live='polite'>
                {isLoading ? (
                  <p className={styles.viewSearchEmpty}>Searching...</p>
                ) : rows.length ? (
                  rows.map((row, index) => (
                    <a
                      className={`${styles.viewSearchResult}${index === activeIndex ? ` ${styles.viewSearchResultActive}` : ''}`}
                      href={row.href}
                      key={row.id}
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      <span className={styles.viewSearchResultMain}>
                        <strong>{row.title}</strong>
                        {row.excerpt && <span>{row.excerpt}</span>}
                      </span>
                      <span className={styles.viewSearchCount}>
                        <EyeIcon />
                        {Number(counts[row.pageId] ?? 0).toLocaleString()}
                      </span>
                    </a>
                  ))
                ) : (
                  <p className={styles.viewSearchEmpty}>No matching pages</p>
                )}
              </div>
            )}

            <footer className={styles.viewSearchFooter}>
              ↑ ↓ choose <span>↵ open</span> <span>esc close</span>
            </footer>
          </section>
        </div>
      )}
    </>
  )
}

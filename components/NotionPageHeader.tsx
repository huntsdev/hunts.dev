import type * as types from 'notion-types'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as React from 'react'
import { Header, useNotionContext } from 'react-notion-x'

import {
  domain,
  github,
  isSearchEnabled,
  linkedin,
  navigationLinks,
  navigationStyle,
  twitter
} from '@/lib/config'
import { GitHubIcon } from '@/lib/icons/github'
import { LinkedInIcon } from '@/lib/icons/linkedin'
import { MoonIcon } from '@/lib/icons/moon'
import { SunIcon } from '@/lib/icons/sun'
import { TwitterIcon } from '@/lib/icons/twitter'
import { useDarkMode } from '@/lib/use-dark-mode'

import { SearchWithViews } from './SearchWithViews'
import styles from './styles.module.css'

function ToggleThemeButton() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  return (
    <button
      type='button'
      className={styles.iconButton}
      onClick={toggleDarkMode}
      aria-label='Toggle color theme'
      title='Toggle color theme'
    >
      {isDarkMode ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}

export function NotionPageHeader({
  block
}: {
  block: types.CollectionViewPageBlock | types.PageBlock
}) {
  const { components, mapPageUrl } = useNotionContext()
  const pathname = usePathname()

  if (navigationStyle === 'default') {
    return <Header block={block} />
  }

  return (
    <header className={styles.siteHeader}>
      <nav className={styles.headerInner} aria-label='Main navigation'>
        <Link href='/' className={styles.brand}>
          {domain}
        </Link>

        <div className={styles.primaryLinks}>
          {navigationLinks?.map((link, index) => {
            if (!link?.pageId && !link?.url) {
              return null
            }

            const href = link.pageId ? mapPageUrl(link.pageId) : link.url!
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`)
            const className = `${styles.navLink}${isActive ? ` ${styles.activeNavLink}` : ''}`

            return link.pageId ? (
              <components.PageLink
                href={href}
                key={index}
                className={className}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.title}
              </components.PageLink>
            ) : (
              <components.Link
                href={href}
                key={index}
                className={className}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.title}
              </components.Link>
            )
          })}
        </div>

        <div className={styles.headerActions}>
          {twitter && (
            <a
              href={`https://x.com/${twitter}`}
              className={styles.iconButton}
              aria-label={`X @${twitter}`}
              title={`X @${twitter}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              <TwitterIcon />
            </a>
          )}
          {github && (
            <a
              href={`https://github.com/${github}`}
              className={styles.iconButton}
              aria-label={`GitHub @${github}`}
              title={`GitHub @${github}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              <GitHubIcon />
            </a>
          )}
          {linkedin && (
            <a
              href={`https://www.linkedin.com/in/${linkedin}`}
              className={styles.iconButton}
              aria-label={`LinkedIn ${linkedin}`}
              title={`LinkedIn ${linkedin}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              <LinkedInIcon />
            </a>
          )}
          <ToggleThemeButton />
          {isSearchEnabled && (
            <div className={styles.searchButton}>
              <SearchWithViews />
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}

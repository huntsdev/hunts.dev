import * as React from 'react'
import Link from 'next/link'

import * as config from '@/lib/config'
import { MoonIcon } from '@/lib/icons/moon'
import { SunIcon } from '@/lib/icons/sun'
import { useDarkMode } from '@/lib/use-dark-mode'

import styles from './styles.module.css'

export function FooterImpl() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const footerLinks = config.navigationLinks?.slice().reverse() ?? []

  return (
    <footer className={styles.footer}>
      <div className={styles.footerIdentity}>
        {config.author} <span aria-hidden='true'>·</span> {config.domain}
      </div>

      <nav className={styles.footerNavigation} aria-label='Footer navigation'>
        {footerLinks.map((link) => {
          if (!link?.url && !link?.pageId) {
            return null
          }

          const href = link.url ?? `/${link.pageId}`

          return (
            <Link className={styles.footerLink} href={href} key={link.title}>
              {link.title}
            </Link>
          )
        })}

        <button
          className={styles.footerThemeButton}
          type='button'
          onClick={toggleDarkMode}
          aria-label='Toggle color theme'
          title='Toggle color theme'
        >
          {isDarkMode ? <MoonIcon /> : <SunIcon />}
        </button>
      </nav>
    </footer>
  )
}

export const Footer = React.memo(FooterImpl)

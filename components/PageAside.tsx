import { type Block, type ExtendedRecordMap } from 'notion-types'

import { getPageTweet } from '@/lib/get-page-tweet'

import { PageActions } from './PageActions'
import { PageViewCount } from './PageViewCount'
import styles from './styles.module.css'

export function PageAside({
  block,
  recordMap,
  isBlogPost
}: {
  block: Block
  recordMap: ExtendedRecordMap
  isBlogPost: boolean
}) {
  if (!block) {
    return null
  }

  // only display comments and page actions on blog post pages
  if (isBlogPost) {
    const tweet = getPageTweet(block, recordMap)

    return (
      <div className={styles.articlePageAside}>
        <PageViewCount pageId={block.id} />
        {tweet && <PageActions tweet={tweet} />}
      </div>
    )
  }

  return null
}

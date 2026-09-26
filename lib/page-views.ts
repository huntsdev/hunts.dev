import KeyvRedis from '@keyvhq/redis'

import {
  isRedisEnabled,
  redisHost,
  redisNamespace,
  redisPassword,
  redisUrl
} from './config'

const localPageViews = new Map<string, number>()
let redis: InstanceType<typeof KeyvRedis.Redis> | undefined

function getRedis() {
  if (
    !isRedisEnabled ||
    (!process.env.REDIS_URL && (!redisHost || !redisPassword))
  ) {
    return
  }

  redis ??= new KeyvRedis.Redis(redisUrl!)
  return redis
}

function getRedisKey(pageId: string) {
  return `${redisNamespace}:page-views:${pageId}`
}

export async function incrementPageView(pageId: string) {
  const client = getRedis()

  if (client) {
    return {
      count: await client.incr(getRedisKey(pageId)),
      persistent: true
    }
  }

  const count = (localPageViews.get(pageId) ?? 0) + 1
  localPageViews.set(pageId, count)
  return { count, persistent: false }
}

export async function getPageViews(pageIds: string[]) {
  const client = getRedis()

  if (client) {
    const values = await client.mget(...pageIds.map(getRedisKey))
    return Object.fromEntries(
      pageIds.map((pageId, index) => [pageId, Number(values[index] ?? 0)])
    )
  }

  return Object.fromEntries(
    pageIds.map((pageId) => [pageId, localPageViews.get(pageId) ?? 0])
  )
}

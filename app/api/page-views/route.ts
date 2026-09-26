import { parsePageId } from 'notion-utils'

import { getPageViews, incrementPageView } from '@/lib/page-views'

const maxPageIds = 50

export async function GET(request: Request) {
  const rawIds = new URL(request.url).searchParams.get('ids')
  const pageIds = parsePageIds(rawIds?.split(',') ?? [])

  if (!pageIds || pageIds.length === 0) {
    return Response.json({ error: 'invalid page ids' }, { status: 400 })
  }

  return Response.json({ counts: await getPageViews(pageIds) })
}

export async function POST(request: Request) {
  let input: unknown

  try {
    input = await request.json()
  } catch {
    return Response.json({ error: 'invalid JSON body' }, { status: 400 })
  }

  if (!isRecord(input) || typeof input.pageId !== 'string') {
    return Response.json({ error: 'invalid page id' }, { status: 400 })
  }

  const pageIds = parsePageIds([input.pageId])
  if (!pageIds) {
    return Response.json({ error: 'invalid page id' }, { status: 400 })
  }

  return Response.json(await incrementPageView(pageIds[0]!))
}

function parsePageIds(rawIds: string[]): string[] | undefined {
  if (rawIds.length > maxPageIds) {
    return
  }

  const pageIds = rawIds.map((rawId) => parsePageId(rawId, { uuid: false }))
  if (pageIds.some((pageId) => !pageId)) {
    return
  }

  return [...new Set(pageIds as string[])]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

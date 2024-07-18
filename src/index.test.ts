import { Client, MCEvent } from '@managed-components/types'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { onEvent } from '.'

describe('Twitter Analytics MC', () => {
  let mockClient: Client
  let mockEvent: MCEvent

  beforeEach(() => {
    vi.clearAllMocks()

    mockClient = {
      emitter: 'browser',
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      language: 'en-GB,en-US;q=0.9,en;q=0.8',
      referer: 'https://google.com',
      ip: '::1',
      title: 'My Website',
      timestamp: 1692890759111,
      url: new URL('http://127.0.0.1:1337/?twclid=1234'),
      fetch: vi.fn().mockResolvedValue({ ok: true }),
      set: vi.fn(),
      get: vi.fn(),
    } as unknown as Client

    mockEvent = {
      payload: { txn_id: '123456789' },
      client: mockClient,
    } as MCEvent
  })

  it('should make pageview requests with the correct base URLs and query parameters', async () => {
    const wrappedOnEvent = onEvent(true) // Set pageview to true
    await wrappedOnEvent(mockEvent)

    const expectedBaseUrls = [
      'https://analytics.twitter.com/i/adsct',
      'https://t.co/i/adsct',
    ]

    const requiredParams = [
      'type',
      'version',
      'p_id',
      'p_user_id',
      'tw_sale_amount',
      'tw_order_quantity',
      'tw_iframe_status',
      'tpx_cb',
      'tw_document_href',
      'txn_id',
      'events',
      'event_id',
      'clid_src',
    ]

    const fetchCalls = vi.mocked(mockClient.fetch).mock.calls
    expect(fetchCalls.length).toBe(2)

    fetchCalls.forEach((call, index) => {
      const [url] = call
      const parsedUrl = new URL(url)
      expect(parsedUrl.origin + parsedUrl.pathname).toBe(
        expectedBaseUrls[index]
      )

      requiredParams.forEach(param => {
        expect(parsedUrl.searchParams.has(param)).toBe(true)
      })
    })
  })
})

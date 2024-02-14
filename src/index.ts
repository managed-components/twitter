import { ComponentSettings, Manager, MCEvent } from '@managed-components/types'
import post from './templates/post.html'
import style from '../dist/output.css'
import mustache from 'mustache'
import { numberFormatter, base64Encode } from './utils'
import heartIcon from '../assets/icons/heart.svg'
import commentIcon from '../assets/icons/comment.svg'
import linkIcon from '../assets/icons/link.svg'
import xIcon from '../assets/icons/x.svg'
import tooltipIcon from '../assets/icons/tool-tip.svg'
const CLICK_ID_PARAM = 'twclid'
const CLICK_ID_COOKIE = `_${CLICK_ID_PARAM}`
const CLICK_SOURCE_PARAM = 'clid_src'
const ONE_MONTH = 2628000000

const getStandardParams = (event: MCEvent, settings: ComponentSettings) => {
  return {
    type: 'javascript',
    version: '2.3.29',
    p_id: 'Twitter',
    p_user_id: 0,
    tw_sale_amount: 0,
    tw_order_quantity: 0,
    tw_iframe_status: 0,
    tpx_cb: 'twttr.conversion.loadPixels',
    tw_document_href: event.client.url.href,
    txn_id: settings['txn_id'],
  }
}

const endpoints = [
  {
    url: 'https://analytics.twitter.com/i/adsct',
    data: { tpx_cb: 'twttr.conversion.loadPixels' },
  },
  { url: 'https://t.co/i/adsct', data: {} },
]

const onEvent =
  (pageview = false, settings: ComponentSettings) =>
  async (event: MCEvent) => {
    for (const { url, data } of endpoints) {
      const payload = {
        ...getStandardParams(event, settings),
        ...data,
        ...event.payload,
      }
      if (pageview) payload.events = '[["pageview", null]]'

      // Handle twitter click id
      if (event.client.url.searchParams.get(CLICK_ID_PARAM)) {
        event.client.set(
          CLICK_ID_COOKIE,
          encodeURIComponent(
            JSON.stringify({
              pixelVersion: '2.3.29',
              timestamp: Date.now(),
              twclid: event.client.url.searchParams.get(CLICK_ID_PARAM),
              source: 1,
            })
          ),
          { expiry: ONE_MONTH }
        )
      }

      // tw_clid_src: 1 if value comes from parameter present in the URL, 2 if coming from the cookie
      // *order matters* 1/ check param 2/ check cookie
      const clid_src = event.client.url.searchParams.get(CLICK_ID_PARAM)
        ? 1
        : event.client.get(CLICK_ID_COOKIE)
        ? 2
        : null
      clid_src && (payload[CLICK_SOURCE_PARAM] = clid_src)

      // twclid
      const clid = event.client.get(CLICK_ID_COOKIE)
      clid &&
        (payload[CLICK_ID_PARAM] = JSON.parse(decodeURIComponent(clid))?.twclid)

      const params = new URLSearchParams(payload).toString()
      event.client.fetch(`${url}?${params}`, {
        credentials: 'include',
        keepalive: true,
        mode: 'no-cors',
      })
    }
  }

export default async function (manager: Manager, settings: ComponentSettings) {
  manager.addEventListener('pageview', onEvent(true, settings))
  manager.addEventListener('event', onEvent(false, settings))

  manager.registerEmbed('post', async ({ parameters }) => {
    const tweetId = parameters['tweet-id']
    const randomToken = [...Array(11)]
      .map(() => (Math.random() * 36).toString(36)[2])
      .join('')
    const tweetResponse = await manager.useCache(
      'tweet_' + tweetId,
      async () => {
        const res = await fetch(
          `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=${randomToken}`
        )
        return await res.json()
      },
      600 // Cache the Tweet for 10 minutes
    )

    const { user, created_at } = tweetResponse
    const dt = new Date(created_at)

    const datetime =
      dt.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }) +
      ' · ' +
      dt.toLocaleString('en-US', { month: 'short' }) +
      ' ' +
      dt.getDate() +
      ', ' +
      dt.getFullYear()

    let profileImage = manager.get('profileImage_' + user.screen_name)

    if (!profileImage) {
      const res = await fetch(user.profile_image_url_https)
      profileImage = base64Encode(await res.arrayBuffer())
      manager.set('profileImage_' + user.screen_name, profileImage)
    }

    const output = mustache.render(post, {
      text: tweetResponse.text,
      name: user.name,
      username: user.screen_name,
      picture: 'data:image/jpeg;base64,' + profileImage,
      datetime,
      likes: numberFormatter(tweetResponse.favorite_count, 1),
      replies: numberFormatter(tweetResponse.conversation_count, 1),
      heartIcon,
      commentIcon,
      linkIcon,
      tweetId,
      xIcon,
      tooltipIcon,
    })

    return `<div><style>${style}</style>${output}</div>`
  })
}

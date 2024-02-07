import { Manager, MCEvent } from '@managed-components/types'
import post from './templates/post.html'
import style from '../dist/output.css'
import mustache from 'mustache'
import { numberFormatter, base64Encode } from './utils'
import heartIcon from '../assets/icons/heart.svg'
import commentIcon from '../assets/icons/comment.svg'
import linkIcon from '../assets/icons/link.svg'
import xIcon from '../assets/icons/x.svg'
import tooltipIcon from '../assets/icons/tool-tip.svg'
import UAParser from 'ua-parser-js'

interface EmbedFunctionParams {
  parameters: { [key: string]: unknown };
  userAgent: string; // Assuming userAgent is a string
}


const CLICK_ID_PARAM = 'twclid'
const CLICK_ID_COOKIE = `_${CLICK_ID_PARAM}`
const CLICK_SOURCE_PARAM = 'clid_src'
const ONE_MONTH = 2628000000

const getStandardParams = (event: MCEvent) => {
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
  (pageview = false) =>
  async (event: MCEvent) => {
    for (const { url, data } of endpoints) {
      const payload = {
        ...getStandardParams(event),
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

export default async function (manager: Manager) {
  manager.addEventListener('pageview', onEvent(true))
  manager.addEventListener('event', onEvent())

  manager.registerEmbed('post', async ({ parameters, userAgent }: EmbedFunctionParams) => {
    const tweetId = parameters['tweet-id']
    const randomToken = [...Array(11)]
      .map(() => (Math.random() * 36).toString(36)[2])
      .join('')
    const parsedUserAgent = UAParser(userAgent)
    const tweetResponse = await manager.useCache(
      'tweet_' + tweetId,
      async () => {
        const res = await manager.fetch(
          `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=${randomToken}`,
          {
            headers: {
              accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
              'User-Agent': `${parsedUserAgent}`,
            },
          }
        )
        const responseString = await res.json()
        return JSON.stringify(responseString)
      },
      600 // Cache the Tweet for 10 minutes
    )

    const {
      user,
      created_at,
      text,
      favorite_count,
      conversation_count,
      quoted_tweet,
    } = JSON.parse(tweetResponse)
    const dt = new Date(created_at)

    const datetime = `${dt.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    })} · ${dt.toLocaleString('en-US', {
      month: 'short',
    })} ${dt.getDate()}, ${dt.getFullYear()}`

    let profileImage = manager.get('profileImage_' + user.screen_name)

    if (!profileImage) {
      const res = await manager.fetch(user.profile_image_url_https, {
        headers: {
          Accept: 'image/jpeg,image/png,image/*,*/*;q=0.8',
          'User-Agent': `${parsedUserAgent}`,
        },
        method: 'GET',
      })
      profileImage = base64Encode(await res.arrayBuffer())
      manager.set('profileImage_' + user.screen_name, profileImage)
    }

    // in case of retweet add the retweet post url
    function getRetweetUrl(retweetDetails: {
      user: {
        screen_name: string
      }
      id_str: string
    }) {
      if (!retweetDetails) {
        return ''
      } else {
        const retweetUser = retweetDetails.user.screen_name
        const retweetId = retweetDetails.id_str
        return `https://twitter.com/${retweetUser}/status/${retweetId}`
      }
    }
    const retweetUrl = getRetweetUrl(quoted_tweet)

    const output = mustache.render(post, {
      text,
      name: user.name,
      username: user.screen_name,
      picture: 'data:image/jpeg;base64,' + profileImage,
      datetime,
      likes: numberFormatter(favorite_count, 1),
      replies: numberFormatter(conversation_count, 1),
      heartIcon,
      commentIcon,
      linkIcon,
      tweetId,
      xIcon,
      tooltipIcon,
      retweetUrl,
    })

    return `<div><style>${style}</style>${output}</div>`
  })
}

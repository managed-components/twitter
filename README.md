# Twitter Pixel Managed Component

Find out more about Managed Components [here](https://blog.cloudflare.com/zaraz-open-source-managed-components-and-webcm/) for inspiration and motivation details.

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-3-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

[![Released under the Apache license.](https://img.shields.io/badge/license-apache-blue.svg)](./LICENSE)
[![PRs welcome!](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## 🚀 Quickstart local dev environment

1. Make sure you're running node version >=18.
2. Install dependencies with `npm i`
3. Run unit test watcher with `npm run test:dev`

## 🧱 Fields Description

### Twitter Pixel ID `number` _required_

`txn_id` is the unique identifier of your Twitter Pixel. You can find it inside the Twitter snippet, as `twq('init','twitter_pixel_id');`. [Learn more](https://business.twitter.com/en/help/campaign-measurement-and-analytics/conversion-tracking-for-websites.html)

## ⎙ Embeds

### Post

This Managed Component uses the [Embeds API](https://managedcomponents.dev/specs/embed-and-widgets/embeds) to render tweets on a web page, with its embed `twitter-post`. This Embed accepts the folowing parameters:

#### Tweet ID _required_

Specify the post you wish to render using the `tweet-id` parameter. You can find the tweed ID in the URL when you open it in the browser.

---

**Examples:**

1. To place an embed on a page using WebCM, use a placeholder div element with the following attributes:

```html
<div
  data-component-embed="twitter-post"
  data-tweet-id="1754336034228171055"
></div>
```

2.  To place an embed on a page using Cloudflare Zaraz, use a placeholder `twitter-post` HTML element with the following attributes:

```html
<twitter-post component="twitter" tweet-id="1754336034228171055"></twitter-post>
```

### Support

This Managed Component only supports the display of the tweet’s text, account and profile information, date and time, as well as likes, replies, and other engagement metrics.
◊

## 📝 License

Licensed under the [Apache License](./LICENSE).

## 💜 Thanks

Thanks to everyone contributing in any manner for this repo and to everyone working on Open Source in general.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/simonabadoiu"><img src="https://avatars.githubusercontent.com/u/1610123?v=4?s=75" width="75px;" alt=""/><br /><sub><b>Simona Badoiu</b></sub></a><br /><a href="https://github.com/managed-components/@managed-components/twitter/commits?author=simonabadoiu" title="Code">💻</a></td>
    <td align="center"><a href="https://yoavmoshe.com/about"><img src="https://avatars.githubusercontent.com/u/55081?v=4?s=75" width="75px;" alt=""/><br /><sub><b>Yo'av Moshe</b></sub></a><br /><a href="https://github.com/managed-components/@managed-components/twitter/commits?author=bjesus" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/jonnyparris"><img src="https://avatars.githubusercontent.com/u/6400000?v=4?s=75" width="75px;" alt=""/><br /><sub><b>Ruskin</b></sub></a><br /><a href="https://github.com/managed-components/@managed-components/twitter/commits?author=jonnyparris" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

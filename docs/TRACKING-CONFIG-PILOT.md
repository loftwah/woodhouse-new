# Public tracking-configuration pilot

Reviewed 7 November 2026. Finite pilot for [issue #167](https://github.com/loftwah/woodhouse-new/issues/167).
It asks one question: can the tracking configuration a public site delivers to a browser tell us
anything useful about an adjacent product's funnel — and does our own client-side surface leak
anything it should not?

This is a research record, not a service. There is no scanner, no dashboard, no scheduled job and no
new runtime dependency. Raw captures stay in the ignored `.release/167/` directory.

## Method

Read-only `curl` of the public HTML with an ordinary desktop user agent, then, where a Google Tag
Manager container id appeared, one fetch of the publicly served `gtm.js` and a read of the
configuration embedded in it. No authentication, no ad interaction, no scraping at scale, no
third-party API spend, no paid service.

Retrieved **7 November 2026, 23:55–23:57 Australia/Melbourne (AEDT)** = **12:55–12:57 UTC**.

| Role | Site | Why this one |
| --- | --- | --- |
| Comparison | `https://www.nts.live/` | Music radio and listening, the closest public analogue to LoftwahFM. |
| Comparison | `https://poki.com/` | Browser games portal, the closest public analogue to Bubbles. |
| Owned | `https://woodhouse.loftwah.com/` | The public record surface. |
| Owned | `https://fm.loftwah.com/` | The audio product with the most third-party embeds. |
| Owned (supporting) | `https://bubbles.loftwah.com/`, `https://composer.loftwah.com/` | Checked for the same exposure question. |

## Observed

### nts.live — Google Tag Manager, GA4 and one Ads conversion destination

- Delivered HTML loads `googletagmanager.com` and calls `gtag(`. Container **`GTM-MJZJWMCX`**;
  GA4 measurement id **`G-WZ3JMJQ60H`**.
- The public container configures consent mode: `ad_storage` and `ad_user_data` gates appear, and tag
  firing is conditional on consent state.
- One Google Ads conversion tag is present with the literal conversion label
  **`afOACPeB8IAdEOuEpIop`**. The conversion id itself is a data-layer variable (macro 6), not a
  literal, and `conversionValue` and `currencyCode` are also variables.
- Event names map to conversion names in the container: `nts.sign_up` → `CompleteRegistration`,
  `nts.purchase` → `Subscribe`, `nts.sign_up_newsletter` → `Lead`, `nts.subscription_reactivate` →
  `Subscribe`, `nts.listen_progress` → `engaged_listen`, `nts.play_video` → `play`.
- Triggers reference `nts.purchase`, `nts.sign_up`, `nts.listen_progress` and
  `nts.playback_error|stalled`.
- Data-layer variables include `is_authenticated`, `has_subscription`, `user_id` and
  `live_intensity`.

### poki.com — first-party tracker, no Google tag in the document

- No `GTM-`, `G-`, `AW-`, `gtag(` or `google-analytics.com` reference in the delivered HTML. The page
  loads its own bundles from `a.poki-cdn.com` and exposes `window.tracker`.
- Consent is handled in first-party keys (`localStorageConsentSet`, `poki_remarketing`).
- An embedded DoubleClick remarketing template is present in the delivered configuration, containing
  `dc_trk_cid=265560040`, `tag_for_child_directed_treatment=1` and GDPR consent macros.

### woodhouse.loftwah.com — first-party engagement, no third-party tag

- No tag manager, analytics SDK, pixel or third-party measurement script in the document.
- One first-party module posts to `/api/engagement` with `schema`, `project`, `eventId`,
  `sessionId`, `event`, `mode`, and an optional long-lived `browserToken`. `credentials: 'omit'`,
  `keepalive: true`. Events: `visit`, `story_arrival`, `active_time`, `engaged`, `story_explored`,
  `project_open`.
- The request body carries no referrer, path, query string, user agent or identifier beyond the
  session and the consented token. Nothing is sent to a third party.
- Measurement is gated on: exact hostname, no `_preview`, not `navigator.webdriver`, not
  `doNotTrack`, not `globalPrivacyControl`, no `qa` parameter, no `analytics=off`, no local opt-out
  flag. The long-lived token additionally requires an explicit consent key.

### fm.loftwah.com, bubbles.loftwah.com, composer.loftwah.com

- No `GTM-`, `G-`, `AW-`, `gtag`, `googletagmanager`, `plausible`, `posthog`, `matomo`, `clarity` or
  `hotjar` reference in any delivered document. `fm.loftwah.com` loads `/api/auth/logout`; nothing
  else third-party.

### Exposure check on owned documents

No credential, API key, bearer token, private endpoint, internal hostname, debug flag or personal
data was found in the four delivered documents. The only `secret` matches are the title of the
Pirates game, *Master of the Secret Sea*. `/build.json` is public by design and exposes the commit,
source digest and content generation, not secrets.

## Inferred, with confidence

- **Medium.** NTS treats a paid subscription and a newsletter sign-up as commercial outcomes, and
  listening progress as an engagement signal. That is a plausible reading of one conversion
  destination plus six event names.
- **Low.** Poki's remarketing template is child-directed (`tag_for_child_directed_treatment=1`). The
  flag is observable; whether it applies to every ad request, and what consent state it runs under,
  is not.
- **Low.** Our own engagement events describe a reading journey (`visit` → `engaged` → `project_open`)
  rather than a conversion funnel, consistent with a publication that has nothing to sell.

## Unknown

- Actual conversion counts, revenue per subscriber, cost per acquisition, bid strategy, or which
  conversions are primary versus secondary in each advertiser account.
- Whether either comparison site's tags fire for a given visitor, because consent state, account
  configuration and server-side or offline conversion paths are invisible to a public read.
- Whether Poki loads a tag manager later in its bundle graph. Only the delivered document and the
  scripts referenced in it were read.
- Consent rates and any modelled conversions.
- Whether `/api/engagement` accepts cross-origin writes. Testing it would mean sending unsolicited
  writes to production, so it was not attempted.

## The distinction this pilot was built to test

The NTS container is the clean example of why visible configuration is not unit economics:

- A **conversion id** and a **conversion label** are different things. One Ads destination label is
  visible; the id is a runtime variable. Seeing one label says nothing about how many bidding goals
  exist.
- **Event names** are hints about instrumentation. `nts.purchase` existing does not prove a purchase
  happened, in what order, or at what rate.
- A **configured value** is not revenue. Here the value is a data-layer variable, so the public bytes
  contain no money at all — a stronger version of the same warning.
- Consent gating means the observable configuration is not the observable behaviour.

## Decision: adapt

- **Adopt** the read as a bounded, one-off pre-pitch check when a comparison product's funnel becomes
  commercially relevant — for example before a LoftwahFM or Bubbles pitch. It is cheap and it
  reliably separates "has instrumentation" from "has a funnel".
- **Adapt** the existing first-party engagement measurement rather than replacing it. It already
  carries better consent gates than either comparison site and sends nothing to a third party.
- **Defer** any recurring scan. Two of the four sites delivered no third-party tags at all, so the
  technique only pays when a specific commercial question exists.
- **Reject** adding Google Tag Manager, advertising pixels or any new telemetry to our products for
  this research, and reject deriving pricing, bidding or acquisition strategy from configured values.

No owning-repository defect was found: the four owned documents had no exposure or measurement gap to
route. Confidence: medium that the instrumentation reading is complete for NTS, low for Poki, high
that the owned sites expose nothing unexpected.

## Repeat this check

```bash
# 1. Fetch the public document
curl -sSL -A "Mozilla/5.0" https://example.com/ -o page.html

# 2. Look for tag managers, measurement ids and pixels
grep -oE "GTM-[A-Z0-9]+|G-[A-Z0-9]{6,}|AW-[0-9]+|gtag\(|googletagmanager|plausible|posthog|matomo" page.html | sort -u

# 3. If a container id exists, read the public configuration
curl -sSL "https://www.googletagmanager.com/gtm.js?id=GTM-XXXXXXX" -o gtm.js
grep -oE "AW-[0-9]+|G-[A-Z0-9]{6,}|conversionLabel|conversionValue|ad_storage" gtm.js | sort -u

# 4. Check our own surface for accidental exposure
grep -oiE "secret|api[_-]?key|password|bearer |authorization:|localhost:[0-9]+|debug=true" page.html
```

Read the configuration, not the marketing. Record the retrieval time, the exact URL and what stays
unknown. Do not infer revenue, and do not put a competitor's guessed numbers on a public page.

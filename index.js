import * as json from "@tim-code/json-fetch"
import fetch from "node-fetch"

async function handleExpected(thing, expected) {
  if (typeof expected === "function") {
    await expected(thing)
  } else {
    expect(thing).toEqual(expected)
  }
}

export function autotest(
  callback,
  {
    name,
    error,
    only,
    setup = () => {},
    before = (...data) => data,
    after = (data) => data,
  } = {}
) {
  return (...input) =>
    (expected) => {
      // remove [ and ] from stringified JSON array
      const inputString = JSON.stringify(input).slice(1, -1)
      name = name || `${callback.name || "<anonymous>"}(${inputString})`
      const tester = only ? test.only : test
      tester(name, async () => {
        let result
        try {
          await setup()
          const prepared = await before(...input)
          const raw = await callback(...prepared)
          result = await after(raw)
        } catch (thrown) {
          if (error) {
            await handleExpected(thrown, expected)
            return
          }
          throw thrown
        }
        if (error) {
          throw new Error("data received when error expected")
        } else {
          await handleExpected(result, expected)
        }
      })
    }
}

// ignore status header; not enough information to know if bad status is intentional
async function htmlFetch(...args) {
  const response = await fetch(...args)
  return response.text()
}

export function autotestHtml(url, { fetchOptions = {}, ...autotestOptions } = {}) {
  return (input) => {
    url = json.appendQueryParams(url, input)
    return autotest(htmlFetch, autotestOptions)(url, fetchOptions)
  }
}

export function autotestGet(url, { fetchOptions = {}, ...autotestOptions } = {}) {
  return (input) => autotest(json.get, autotestOptions)(url, input, { fetch, ...fetchOptions })
}

export function autotestPost(url, { fetchOptions = {}, ...autotestOptions } = {}) {
  return (input) =>
    autotest(json.post, autotestOptions)(url, input, { fetch, ...fetchOptions })
}

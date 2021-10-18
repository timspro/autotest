import fetch from "node-fetch"
import { URL } from "url"

async function handleExpected(thing, expected) {
  if (typeof expected === "function") {
    await expected(thing)
  } else {
    expect(thing).toEqual(expected)
  }
}

export function autotest(
  callback,
  { name, error, only, before = (...data) => data, after = (data) => data } = {}
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

async function jsonFetch(...args) {
  const result = await fetch(...args)
  try {
    return await result.json()
  } catch (error) {
    const text = await result.text()
    const shorter = text.slice(0, 50)
    throw new Error(`could not parse json starting with: ${shorter}`)
  }
}

export function autotestGet(url, { fetchOptions = {}, ...autotestOptions } = {}) {
  return (input = {}) => {
    const urlBuilder = new URL(url)
    for (const key of Object.keys(input)) {
      urlBuilder.searchParams.append(key, input[key])
    }
    url = urlBuilder.toString()
    return autotest(jsonFetch, autotestOptions)(url, fetchOptions)
  }
}

export function autotestPost(url, { fetchOptions = {}, ...autotestOptions } = {}) {
  const headers = { ...(fetchOptions.headers || {}), "Content-Type": "application/json" }
  const postOptions = { ...fetchOptions, method: "POST", headers }
  return (input = {}) => {
    const body = JSON.stringify(input)
    return autotest(jsonFetch, autotestOptions)(url, { ...postOptions, body })
  }
}

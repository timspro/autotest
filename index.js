import * as json from "@tim-code/json-fetch"
import fetch from "node-fetch"

async function handleExpected(thing, expected, property = undefined) {
  if (typeof expected === "function") {
    await expected(property === undefined ? thing : thing[property])
  } else if (property === undefined) {
    expect(thing).toEqual(expected)
  } else {
    expect(thing).toHaveProperty(property, expected)
  }
}

function handleExpectedArray(thing, expected) {
  if (!Array.isArray(thing)) {
    throw new Error("expected test result to be an array")
  }
  if (!thing.length) {
    throw new Error("expected test result to not be empty")
  }
  const promises = []
  for (let i = 0; i < thing.length; i++) {
    promises.push(handleExpected(thing, expected, i.toString()))
  }
  return Promise.all(promises)
}

export function autotest(
  callback,
  {
    name = undefined,
    error = false,
    only = false,
    array = false,
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
        } else if (array) {
          await handleExpectedArray(result, expected)
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

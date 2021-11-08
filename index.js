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
    name = undefined,
    timeout = undefined,
    error = false,
    only = false,
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
      tester(
        name,
        async () => {
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
        },
        timeout
      )
    }
}

export function autotestFactory(defaultOptions = {}) {
  return (callback, options = {}) => autotest(callback, { ...defaultOptions, ...options })
}

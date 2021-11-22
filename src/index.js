async function validate(output, expected) {
  if (typeof expected === "function") {
    await expected(output)
  } else {
    expect(output).toEqual(expected)
  }
}

function createTest({ error, setup, input, before, after, callback, expected }) {
  return async () => {
    let result
    try {
      await setup()
      const prepared = await before(...input)
      const raw = await callback(...prepared)
      result = await after(raw)
    } catch (thrown) {
      if (error) {
        await validate(thrown, expected)
        return
      }
      throw thrown
    }
    if (error) {
      throw new Error("data received when error expected")
    } else {
      await validate(result, expected)
    }
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
      const stringifiedInput = JSON.stringify(input).slice(1, -1)
      name = name || `${callback.name || "<anonymous>"}(${stringifiedInput})`
      const tester = only ? test.only : test
      const options = { error, setup, input, before, after, callback, expected }
      tester(name, createTest(options), timeout)
    }
}

export function factory(defaults = {}) {
  return (callbacks, options = {}) => {
    callbacks = Array.isArray(callbacks) ? callbacks : [callbacks]
    for (const callback of callbacks) {
      autotest(callback, { ...defaults, ...options })
    }
  }
}

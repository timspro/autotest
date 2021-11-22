/* globals expect, test */

async function validate(output, expected) {
  if (typeof expected === "function") {
    await expected(output)
  } else {
    expect(output).toEqual(expected)
  }
}

function testify({ error, setup, input, before, after, callback, expected }) {
  return async () => {
    await setup()
    const preparedInput = await before(...input)
    let output
    try {
      output = await callback(...preparedInput)
    } catch (thrown) {
      if (error) {
        await validate(thrown, expected)
        return
      }
      throw thrown
    }
    const preparedOutput = await after(output)
    if (error) {
      throw new Error("data received when error expected")
    } else {
      await validate(preparedOutput, expected)
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
      const stringified = JSON.stringify(input).slice(1, -1)
      name = name || `${callback.name || "<anonymous>"}(${stringified})`
      const tester = only ? test.only : test
      const options = { error, setup, input, before, after, callback, expected }
      // tester should deal with any thrown errors by testify's returned callback
      tester(name, testify(options), timeout)
    }
}

export function factory(defaults = {}) {
  return (callback, options = {}) => autotest(callback, { ...defaults, ...options })
}

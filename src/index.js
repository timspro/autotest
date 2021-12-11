/* globals expect, test */

function createTest({ error, setup, input, before, after, callback, expected, _expect }) {
  let testExpected = expected
  if (typeof expected !== "function") {
    // coerce expected into a function that tests for equality
    testExpected = (output) => _expect(output).toEqual(expected)
  }
  return async () => {
    await setup()
    const preparedInput = await before(...input)
    let output
    try {
      output = await callback(...preparedInput)
    } catch (thrown) {
      if (error) {
        await testExpected(thrown)
        return
      }
      throw thrown
    }
    const preparedOutput = await after(output)
    if (error) {
      throw new Error("test function returned when error expected")
    } else {
      await testExpected(preparedOutput)
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
    _test = test,
    _expect = expect,
  } = {}
) {
  return (...input) =>
    (expected) => {
      if (!name) {
        // remove [ and ] from stringified JSON array of input
        const stringified = JSON.stringify(input).slice(1, -1)
        name = `${callback.name || "<anonymous>"}(${stringified})`
      }
      const tester = only ? _test.only : _test
      const options = { error, setup, input, before, after, callback, expected, _expect }
      // tester should deal with any thrown errors by the created test
      tester(name, createTest(options), timeout)
    }
}

export function factory(defaults = {}) {
  return (callback, options = {}) => autotest(callback, { ...defaults, ...options })
}

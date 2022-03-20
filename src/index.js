/* globals expect, test */

function expectOutputToEqual(expect, expected) {
  return (output) => expect(output).toEqual(expected)
}

function createTest({
  input,
  expected,
  callback,
  error,
  setup,
  teardown,
  before,
  after,
  consume,
  _expect,
}) {
  // coerce expected into a function that tests for equality to the value of expected
  expected = typeof expected === "function" ? expected : expectOutputToEqual(_expect, expected)
  async function steps() {
    await setup()
    const preparedInput = await before(...input)
    let output
    try {
      output = await consume(callback, preparedInput)
    } catch (thrown) {
      if (error) {
        await expected(thrown)
        return
      }
      throw thrown
    }
    const preparedOutput = await after(output)
    if (error) {
      throw new Error("test function returned when error expected")
    } else {
      await expected(preparedOutput)
    }
  }
  return () => steps().finally(teardown)
}

export function getTestName({ input, callback, callbackName }) {
  // remove [ and ] from stringified JSON array of input
  const stringified = JSON.stringify(input).slice(1, -1)
  return `${callbackName || callback.name || "<anonymous>"}(${stringified})`
}

export function autotest(
  callback,
  {
    name = undefined,
    callbackName = undefined,
    timeout = undefined,
    error = false,
    only = false,
    setup = () => {},
    teardown = () => {},
    before = (...data) => data,
    after = (data) => data,
    consume = (func, input) => func(...input),
    _test = test,
    _expect = expect,
  } = {}
) {
  return (...input) =>
    (expected) => {
      if (!name) {
        name = getTestName({ input, callback, callbackName })
      }
      const tester = only ? _test.only : _test
      const options = {
        input,
        expected,
        callback,
        error,
        setup,
        teardown,
        before,
        after,
        consume,
        _expect,
      }
      // tester should deal with any thrown errors by the created test
      // autotest should never throw an error and does not return anything (i.e. a promise)
      tester(name, createTest(options), timeout)
    }
}

export function factory(defaults = {}) {
  return (callback, options = {}) => autotest(callback, { ...defaults, ...options })
}

export function consume2(func, [a, b]) {
  return func(a)(b)
}

export function consume3(func, [a, b, c]) {
  return func(a)(b)(c)
}

export function consume4(func, [a, b, c, d]) {
  return func(a)(b)(c)(d)
}

export function consume2Iterables(func, [a, b]) {
  return func(...a)(...b)
}

export function consume3Iterables(func, [a, b, c]) {
  return func(...a)(...b)(...c)
}

export function consume4Iterables(func, [a, b, c, d]) {
  return func(...a)(...b)(...c)(...d)
}

import { autotest, consume2, consume2Iterables, factory, getTestName } from "./index.js"

function divide(x, y) {
  if (!y) {
    throw new Error("divide by zero")
  }
  return x / y
}

autotest(divide)(6, 3)(2)

const errorOutput = expect.objectContaining({ message: "divide by zero" })

autotest(divide, { error: true })(0, 0)(errorOutput)

function _test(expectedError) {
  return async (_, callback) => {
    try {
      await callback()
    } catch (error) {
      try {
        expect(error).toEqual(expectedError)
      } catch (unexpectedError) {
        console.error(unexpectedError)
      }
    }
  }
}
const options = { _test: _test(), _expect: expect }

test("autotest errors when an error is expected but the test function returns", () => {
  autotest(divide, options)(6, 3)(2)
  autotest(divide, { ...options, error: true })(0, 0)(errorOutput)

  // next line should be essentially equivalent to the previous line
  expect(autotest(divide, { ...options, _test: _test(errorOutput) })(0, 0))

  const noError = expect.objectContaining("test function returned when error expected")
  expect(autotest(divide, { ...options, _test: _test(noError), error: true })(4, 2))
})

test("getTestName", () => {
  expect(getTestName({ input: [["a"], 1], callbackName: "b" })).toEqual('b(["a"],1)')
  expect(getTestName({ input: [], callbackName: "c" })).toEqual("c()")
})

// eslint-disable-next-line no-empty-function
function namedFunction() {}
test("getTestName with named function", () => {
  expect(getTestName({ input: [["b"], 2], callback: namedFunction })).toEqual(
    'namedFunction(["b"],2)'
  )
})

function curriedDivide(x) {
  return (y) => divide(x, y)
}
const autotestConsume = factory({ consume: consume2 })
const addTest = autotestConsume(curriedDivide)
addTest(1, 2)(0.5) // test name will be add([1,2]), not add(1)(2)
autotestConsume(curriedDivide, { error: true })(1, 0)(errorOutput)

const testConsumeArrays = factory({ consume: consume2Iterables })(curriedDivide)
testConsumeArrays([1], [2])(0.5)

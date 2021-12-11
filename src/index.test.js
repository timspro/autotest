import { autotest } from "./index.js"

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

test("test autotest errors when divide used unexpectedly", () => {
  autotest(divide, options)(6, 3)(2)
  autotest(divide, { ...options, error: true })(0, 0)(errorOutput)

  expect(autotest(divide, { ...options, _test: _test(errorOutput) })(0, 0))

  // should throw if error is expected and none is received
  const noError = expect.objectContaining("test function returned when error expected")
  expect(autotest(divide, { ...options, _test: _test(noError), error: true })(4, 2))
}, 100000)

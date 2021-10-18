import { autotest, autotestGet, autotestPost } from "./index.js"

function add(x, y) {
  return x + y
}

autotest(add)(1, 2)(3)

function error() {
  throw new Error("test")
}

autotest(error, { error: true })()(expect.objectContaining({ message: "test" }))

autotestGet("https://httpbin.org/get")()(expect.objectContaining({ args: {} }))

const getInput = { test: "1" }
autotestGet("https://httpbin.org/get")(getInput)(expect.objectContaining({ args: getInput }))

const postInput = { check: 1 }
autotestPost("https://httpbin.org/post")(postInput)(
  expect.objectContaining({ json: postInput })
)

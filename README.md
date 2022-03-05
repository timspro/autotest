# autotest

```
npm install @tim-code/autotest
```

A zero-dependency helper function to reduce boilerplate in writing Jest tests

## Philosophy

```js
import { autotest, factory, getTestName } from "@tim-code/autotest"

autotest(functionToTest, options)(input1, input2, ...)(expected)

factory(options)(functionToTest)(input1, input2, ...)(expected)

```

Note `expected` iself can be a (async) callback. If so, autotest will pass the test output to it instead of using `expect(output).toEqual(expected)`.

Similar Jest code for comparison:

```js
test("functionToTest", () => {
  expect(functionToTest(input1, input2, ...)).toEqual(expected)
})
```

## Options

`name`: Name the test. Otherwise, try to make one from the test function's name and passed in input.

`callbackName`: If name is not specified, used instead of `functionToTest.name` to name the test.

`error`: Specify that an error is expected.

`only`: Use `test.only` to make only one test run, which is useful for debugging.

`timeout`: Specifies the max execution time for the test and is useful for debugging

`setup`: (async) callback that is always invoked with no arguments before the test is run; its return value has no effect

`teardown`: (async) callback that is always invoked with no arguments after all callbacks are run (or error); its return value has no effect

`after`: a (async) callback that is invoked with the test function output; its return value will be tested with/using `expected`

`before`:

This is a (async) callback that is invoked with the input before the test is run (but after setup). Its return value must be iterable and will be passed to the test callback via the spread operator. This can be useful for generating input to a test. For example:

```js
const autotest = factory({ before: (multiple) => [Math.random() * multiple] })
autotest(handleZeroToFive)(5)(expected)
autotest(handleZeroToTen)(10)(expected)
```

`consume`:

This is a (async) callback that is invoked with the test function and the input, which is useful for testing higher order functions.

```js
const add = (x) => (y) => x + y
const autotest = factory({ consume: (func, [x, y]) => func(x)(y) })
const test = autotest(add)
test(1, 2)(3) // test name will be add(1,2), not add(1)(2)
```

For convenience, the above `consume` function is exported as `consume2` with `consume3` and `consume4` analogs.

There is also `consume2Iterables`, `consume3Iterables`, and `consume4Iterables` exported which spread their input:

```js
const add = (x) => (y) => (z) => x + y + z
const autotest = factory({ consume: consume3Iterables })
const test = autotest(add)
test([1], [2], [3])(6) // test name will be add([1],[2],[3]), not add([1])([2])([3])
```

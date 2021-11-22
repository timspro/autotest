# autotest

```
npm install @tim-code/autotest
```

A zero-dependency helper function to reduce boilerplate in writing Jest tests

## Philosophy

```js
import { autotest, factory } from "@tim-code/autotest"

autotest(functionToTest, options)(input1, input2, ...)(expected)
factory(options)(functionToTest)(input1, input2, ...)(expected)
```

Note `expected` can be a (async) callback. If so, autotest will pass the test output to it instead of checking equality.

Similar Jest code for comparison:

```js
test("functionToTest", () => {
  expect(functionToTest(input1, input2, ...)).toEqual(expected)
})
```

## Options

`name`: Name the test. Otherwise, try to make one from the test function's name and passed in input.

`error`: Specify that an error is expected.

`only`: Use `test.only` to make only one test run, which is useful for debugging.

`timeout`: Specifies the max execution time for the test and is useful for debugging

`setup`: (async) callback that is invoked with no arguments before the test is run; its return value has no effect

`after`: a (async) callback that is invoked with the test function output; its return value will be used for `expected`

`before`:

This is a (async) callback that is invoked with the input before the test is run (but after setup). Its return value must be iterable and will be passed to the test callback via the spread operator. This can be useful for generating input to a test. For example:

```js
const autotest = factory({ before: (multiple) => [Math.random() * multiple] })
autotest(handleZeroToTen)(10)(expected)
autotest(handleZeroToFive)(5)(expected)
```

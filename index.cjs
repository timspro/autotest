"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.autotest = autotest;

async function safeCall(callback, value) {
  try {
    await callback(value);
    return undefined;
  } catch (thrown) {
    return thrown;
  }
}

function expectedData(data, expected, done) {
  if (typeof expected === "function") {
    safeCall(expected, data).then(done);
  } else {
    expect(data).toEqual(expected);
    done();
  }
}

function expectedError(error, expected, done) {
  if (typeof expected === "function") {
    safeCall(expected, error).then(done);
  } else {
    expect(error).toEqual(expected);
    done();
  }
}

function autotest(callback, {
  name,
  error,
  only,
  before = () => {},
  after = data => data
} = {}) {
  return (...input) => expected => {
    // remove [ and ] from stringified JSON array
    const inputString = JSON.stringify(input).slice(1, -1);
    name = name || `${callback.name || "<anonymous>"}(${inputString})`;
    const tester = only ? test.only : test;
    tester(name, done => {
      Promise.resolve().then(() => before()).then(() => callback(...input)).then(after).catch(thrown => {
        if (error) {
          expectedError(thrown, expected, done);
        } else {
          done(thrown);
        }
      }).then(data => {
        if (error) {
          done(new Error("data received when error expected"));
        } else {
          expectedData(data, expected, done);
        }
      });
    });
  };
}

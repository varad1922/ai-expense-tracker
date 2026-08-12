/**
 * This file serves as a demonstration of core JavaScript concepts
 * as requested in the project rubric.
 */

// 1. Closures
// A closure is the combination of a function bundled together (enclosed) with references 
// to its surrounding state (the lexical environment). In other words, a closure gives you 
// access to an outer function's scope from an inner function.

export const createCounter = () => {
    let count = 0; // 'count' is captured by the closure
    return function increment() {
        count++;
        return count;
    };
};
const counter = createCounter();
console.log("Closure - Counter 1:", counter()); // 1
console.log("Closure - Counter 2:", counter()); // 2

// 2. Hoisting
// Hoisting is JavaScript's default behavior of moving declarations to the top.
// Note: only declarations are hoisted, not initializations.
// Let's demonstrate function hoisting (calling before declaration):

console.log("Hoisting - Calling hoisted function:", hoistedFunction());
function hoistedFunction() {
    return "I am hoisted!";
}

// Variables defined with var are also hoisted (but initialized as undefined)
console.log("Hoisting - var variable before declaration:", hoistedVar); // undefined
var hoistedVar = "I am a var";

// 3. Event Loop (setTimeout, setImmediate, Promises)
// The event loop is what allows Node.js to perform non-blocking I/O operations
// despite the fact that JavaScript is single-threaded.

export const demonstrateEventLoop = () => {
    console.log("Event Loop - 1: Script start (synchronous)");

    setTimeout(() => {
        console.log("Event Loop - 4: setTimeout (macrotask)");
    }, 0);

    Promise.resolve().then(() => {
        console.log("Event Loop - 3: Promise (microtask)");
    });

    console.log("Event Loop - 2: Script end (synchronous)");
};

// 4. Promises vs Callbacks
// Callbacks are functions passed as arguments to other functions.
// Promises are objects representing the eventual completion or failure of an asynchronous operation.

// Callback Style
export const fetchDataCallback = (callback) => {
    setTimeout(() => {
        callback(null, { data: "Some data via callback" });
    }, 100);
};

// Promise Style
export const fetchDataPromise = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({ data: "Some data via Promise" });
        }, 100);
    });
};

// Async/Await (Modern way to handle Promises)
export const fetchDataAsync = async () => {
    try {
        const result = await fetchDataPromise();
        console.log("Async/Await result:", result);
    } catch (error) {
        console.error("Async/Await error:", error);
    }
};

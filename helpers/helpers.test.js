const { validateQueries } = require("./helpers");
const { BadRequestError } = require("../expressError");

const compLoc = "companies";

describe("validateQueries works if using proper queries in any combination", function() {
    test("works with all 3 filters", function() {
        const testQueries = {
            name: "testName",
            minEmployees: "1",
            maxEmployees: "50"
        }
        const expected = {
            "maxEmployees": 50,
            "minEmployees": 1,
            "name": "testName",
        }
        const test = validateQueries(testQueries, compLoc);
        console.log(expected);
        console.log(test);
        expect(test).toEqual(expected);
    })

    test("works with name and minEmployees", function() {
        const testQueries = {
            name: "testName",
            minEmployees: "1"
        }
        const test = validateQueries(testQueries, compLoc);
        expect(test).toEqual({
            "minEmployees": 1,
            "name": "testName",
        })
    })

    test("works with minEmployees and maxEmployees", function() {
        const testQueries = {
            maxEmployees: "50",
            minEmployees: "1"
        }
        const test = validateQueries(testQueries, compLoc);
        expect(test).toEqual({
            "maxEmployees": 50,
            "minEmployees": 1,
        })
    })

    test("works with just name", function() {
        const testQueries = {
            name: "testName"
        }
        const test = validateQueries(testQueries, compLoc);
        expect(test).toEqual({
            "name": "testName",
        })
    })

    test("works with just minEmployees", function() {
        const testQueries = {
            minEmployees: "1"
        }
        const test = validateQueries(testQueries, compLoc);
        expect(test).toEqual({
            "minEmployees": 1,
        })
    })

    test("works with just maxEmployees", function() {
        const testQueries = {
            maxEmployees: "50"
        }
        const test = validateQueries(testQueries, compLoc);
        expect(test).toEqual({
            "maxEmployees": 50,
        })
    })

    test("returns false with no queries", function() {
        const testQueries = {};
        const test = validateQueries(testQueries, compLoc);
        expect(test).toEqual(false)
    })

})

describe("validateQueries doesn't work when using improper queries", function() {
    test("BadRequestError when minEmployees is greater than maxEmployees", function() {
        const testQueries = {
            minEmployees: "50",
            maxEmployees: "1"
        }
        try {
            const test = validateQueries(testQueries, compLoc);
            fail();
        } catch(err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    })

    test("BadRequestError when minEmployees is not a number", function() {
        const testQueries = {
            minEmployees: "definitely not a number"
        }
        try {
            const test = validateQueries(testQueries, compLoc);
            fail();
        } catch(err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    })

    test("BadRequestError when maxEmployees is not a number", function() {
        const testQueries = {
            maxEmployees: "definitely not a number"
        }
        try {
            const test = validateQueries(testQueries, compLoc);
            fail();
        } catch(err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    })

    test("BadRequestError when a key other than the 3 appropriate filters is passed", function() {
        const testQueries = {
            location: "Seattle",
            CEO: "Mr. Dog",
            likes_dogs: true
        }
        try {
            const test = validateQueries(testQueries, compLoc);
            fail();
        } catch(err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    })

    test("BadRequestError when a bad key is used even if there are good keys", function() {
        const testQueries = {
            name: "testName",
            minEmployees: "15",
            maxEmployees: "50",
            location: "Seattle"
        }
        try {
            const test = validateQueries(testQueries, compLoc);
            fail();
        } catch(err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    })
})
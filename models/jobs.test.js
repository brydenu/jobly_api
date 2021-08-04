"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./jobs");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
    const newJob = {
      title: "new title",
      salary: 123456789,
      equity: .2,
      companyHandle: "c1"
    };
  
    test("works", async function () {
      let job = await Job.create(newJob);

      console.log(job)
  
      const result = await db.query(
            `SELECT id, title, salary, equity, company_handle AS companyHandle
             FROM jobs
             WHERE id = '${job.id}'`);
      
      console.log(result.rows)
      expect(result.rows).toEqual([
        {
            "id": job.id,
            "title": "new title",
            "salary": 123456789,
            "equity": "0.2",
            "companyhandle": "c1"
        },
      ]);
    });
  });
  
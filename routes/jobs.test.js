"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  a1Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
    const newJob = {
        title: "new title",
        salary: 123456,
        equity: "0.2",
        companyHandle: "c1"
      };

  test("ok for admins", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${a1Token}`);

    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
        "job": {
            "id": expect.any(Number),
            "title": "new title",
            "salary": 123456,
            "equity": "0.2",
            "companyhandle": "c1"
        }
    });
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          handle: "new",
          numEmployees: 10,
        })
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: 22,
          salary: "hello",
          equity: false,
          companyHandle: 11
        })
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

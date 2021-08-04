"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/jobs");
const { validateQueries } = require("../helpers/helpers");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();


/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */

 router.post("/", ensureAdmin, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        console.log("wait is this here?")
        throw new BadRequestError(errs);
      }
  
      const job = await Job.create(req.body);

      return res.status(201).json({ job });
    } catch (err) {
      return next(err);
    }
  });

/** GET / => { jobs: [ { id, title, salary, equity, companyHandle} ] }
 * 
 * Can Filter on provided search filters:
 * - title (string)
 * - minSalary (integer)
 * - hasEquity (boolean)
 * 
 *  Authorization required: none
 */

router.get("/", async function(req, res, next) {
    try {
        const queries = validateQueries(req.query);
        let jobs;
        if (queries) {
          jobs = await Job.filterFind(queries);
        } else {
          jobs = await Job.findAll();
        }

        return res.json({ jobs });
    } catch (err) {
      return next(err);
    }
})

router.get("/:id", async function(req, res, next) {
  try {
    const job = await Job.get(req.params.id);
    console.log(res.json({ job }))
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
})

router.patch("/:id", ensureAdmin, async function(req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if(!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
})

router.delete("/:id", ensureAdmin, async function(req, res, next) {
  try {
    await Job.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch(err) {
    return next(err)
  }
});

module.exports = router;
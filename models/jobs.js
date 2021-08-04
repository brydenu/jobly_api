"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, companyHandle }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * */

  static async create({ title, companyHandle, salary, equity }) {
      const res = await db.query(
          `INSERT INTO jobs
          (title, company_handle, salary, equity)
          VALUES ($1, $2, $3, $4)
          RETURNING id, title, salary, equity, company_handle AS companyHandle`,
          [title, companyHandle, salary, equity]
      );
      const job = res.rows[0];

      return job;
  }

  /** Gets all jobs.
   * 
   * Returns [{id, title, salary, equity, company_handle}, ...]
   */

  static async findAll() {
      const jobsRes = await db.query(
          `SELECT id, title, salary, equity, company_handle
          FROM jobs
          ORDER BY id`
      );
      return jobsRes.rows;
  }

  /** Finds all jobs within the filtered parameters set.
   * 
   *  Doesn't use parameters that arent given (that is, it won't search using equity
   *  if equity filter is not given)
   */

  static async filterFind(queries) {

    // Constructs the WHERE part of the SQL query that contains only the parameters
    // included in the query string.
    let whereQuery = "";
    for (let filter in queries) {
      let toConcat;
      if (filter == "title") {
        toConcat = `${filter} ILIKE '%${queries[filter]}%'`
      } else if (filter == "minSalary") {
        toConcat = `salary >= ${queries[filter]}`
      } else if (filter == "hasEquity") {
        toConcat = `equity ${queries[filter]}`
      } else if (filter == "companyHandle") {
        toConcat = `company_handle ILIKE '%${queries[filter]}%'`
      }
      whereQuery = whereQuery.concat(toConcat);

      delete queries[filter];
      if (Object.keys(queries).length > 0) {
          whereQuery = whereQuery.concat(" AND ")
      }
    }

    const query =
    `SELECT 
    id,
    title,
    salary,
    equity,
    company_handle AS companyHandle
    FROM jobs
    WHERE ${whereQuery}
    ORDER BY id`;

    const jobsRes = await db.query(query)

    return jobsRes.rows;
  }

  /** GET job
   * 
   * Given a job id, return data 
   **/
  
  static async get(id) {
      const jobRes = await db.query(
          `SELECT id, title, salary, equity, company_handle AS company_handle
          FROM jobs
          WHERE id = $1`, [id]);

          const job = jobRes.rows[0];

          if (!job) throw new NotFoundError(`Job with ID ${id} not found.`);

          return job;
  }

  /** PATCH
   * Update a job with data.
   * 
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   * (Note: ID and company can NOT be changed)
   *
   * Returns {id, title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    // Since company_handle is the only nonSQL-ized term (and not changeable), 
    // we will just input an empty object.
      const {setCols, values} = sqlForPartialUpdate(data, {});

      const idVarIdx = "$" + (values.length + 1);

      const querySql = 
      `UPDATE jobs
      SET ${setCols}
      WHERE id = ${idVarIdx}
      RETURNING id,
      title,
      salary,
      equity,
      company_handle AS "companyHandle"
      `;
      
      const res = await db.query(querySql, [...values, id]);
      const job = res.rows[0];

      if (!job) throw new NotFoundError(`No job with id: "${id}"`);

      return job;
  }

  /** DELETE
   * Deletes job from database, returns undefined.
   * 
   * Throws NotFoundError if not found.
   */

  static async remove(id) {
    const res = await db.query(
        `DELETE
        FROM jobs
        WHERE id = $1
        RETURNING id`, [id]
    )
    const job = res.rows[0];

    if (!job) throw new NotFoundError(`Job with ID ${id} not found.`)
  }
}

module.exports = Job;
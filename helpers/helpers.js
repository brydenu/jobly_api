/** Helper functions */

const { BadRequestError } = require("../expressError");


/** Validates requests to company routes
*
*   Creates SQL query to use in companies route to filter based on query parameters
*
*   Checks that only name, minEmployees, and/or maxEmployees is being queried.
*   Also makes sure that minEmployees never exceeds maxEmployees.
*/

function validateQueries(queries, location=null) {
  // If there aren't any keys in the queries object then we don't have to do anything, 
  // so check that here.
  //
  // If it does find keys, try to match the key names to one of the 3 appropriate filters
  // and if the key matches, save the key-value pair to the filters object.
  //
  // If the key does not match either of the 3 appropriate keys, it is an invalid key name
  // so we throw a BadRequestError.
  //
  // (Also makes sure the values passed into either min/max Employees is a number and not anything else.)
  const filters = {};
    
  if (Object.keys(queries).length > 0) {
    // First check to see if filter is coming from a request to /companies or /jobs
    if (location == "companies") {
      if (queries.name) {
        filters.name = queries.name;
        delete queries.name;
      }
      if (queries.minEmployees) {
        filters.minEmployees = parseInt(queries.minEmployees);
        if (!filters.minEmployees) {
            throw new BadRequestError("Min Employees query must be a number")
        }
        delete queries.minEmployees;
      }
      if (queries.maxEmployees) {
        filters.maxEmployees = parseInt(queries.maxEmployees);
        if (!filters.maxEmployees) {
            throw new BadRequestError("Max Employees query must be a number")
        }
        delete queries.maxEmployees;
      }
      // If there are queries remaining (therefore invalid queries)
      if (Object.keys(queries).length > 0) {
          throw new BadRequestError(
              `Invalid filter(s): ${Object.keys(queries)}`)
      }
      // The if logic for the request being to /jobs
    } else {
      if (queries.title) {
        filters.title = queries.title;
        delete queries.title;
      }
      if (queries.minSalary) {
        filters.minSalary = queries.minSalary;
        delete queries.minSalary;
      }
      if (Object.keys(queries).includes("hasEquity")) {
        if (queries.hasEquity == "true") {
          filters.hasEquity = "> 0";
        } else {
          filters.hasEquity = "= 0";
        }
        delete queries.hasEquity;
      }

    }
  } else {
    // Branches to this if there are no keys at all.
    return false;
  }
    
    // If we have both a minEmployees key and maxEmployees key, we have to make sure
    // that minEmployees is not greater than maxEmployees
    if (filters.minEmployees && filters.maxEmployees && filters.minEmployees > filters.maxEmployees) {
      throw new BadRequestError("Minimum employees cannot exceed maximum employees");
    }

    return filters;
}

module.exports = {
    validateQueries
}

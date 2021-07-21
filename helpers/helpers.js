/** Helper functions */

const { BadRequestError } = require("../expressError");


/** Validates requests to company routes
*
*   Creates SQL query to use in companies route to filter based on query parameters
*
*   Checks that only name, minEmployees, and/or maxEmployees is being queried.
*   Also makes sure that minEmployees never exceeds maxEmployees.
*/

function validateQueries(queries) {
    let name;
    let minEmployees;
    let maxEmployees;
    const filters = {};

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
    if (Object.keys(queries).length > 0) {
      if (queries.name) {
        filters.name = queries.name;
        delete queries.name;
      }
      if (queries.minEmployees) {
        minEmployees = parseInt(queries.minEmployees);
        if (!minEmployees) {
            throw new BadRequestError("Min Employees query must be a number")
        }
        filters.minEmployees = minEmployees;
        delete queries.minEmployees;
      }
      if (queries.maxEmployees) {
        maxEmployees = parseInt(queries.maxEmployees);
        if (!maxEmployees) {
            throw new BadRequestError("Max Employees query must be a number")
        }
        filters.maxEmployees = maxEmployees;
        delete queries.maxEmployees;
      }
      if (Object.keys(queries).length > 0) {
          throw new BadRequestError(
              `Invalid filter(s): Only name, minEmployees, and maxEmployees permitted in query string.\nInvalid queries: ${Object.keys(queries)}`)
      }
    } else {
      // Branches to this if there are no keys at all.
        return false;
    }
    console.log("name variable: ", filters.name);
    console.log("minEmployees variable: ", filters.minEmployees);
    console.log("maxEmployees variable: ", filters.maxEmployees);
    console.log("---------------------------------------")
    console.log("queries object (remaining): ", queries)
    
    // If we have both a minEmployees key and maxEmployees key, we have to make sure
    // that minEmployees is not greater than maxEmployees
    if (minEmployees && maxEmployees && minEmployees > maxEmployees) {
      throw new BadRequestError("Minimum employees cannot exceed maximum employees");
    }

    return filters;
}

module.exports = {
    validateQueries
}

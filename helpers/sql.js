const { BadRequestError } = require("../expressError");

/**
 * Serves 2 purposes-
 * 1. Changes JavaScript property names to the SQL column name versions if needed. 
 * Whether it is needed or not along with what it should be changed to is acknowledged 
 * in the jsToSql parameter.
 * (ex. logoUrl -> logo_url)
 * 
 * 2. Writes a partial SQL query based on which columns are being changed. This 
 * partial query will be inserted into the rest of the SQL query in the update route.
 * 
 * Returns setCols and values.
 * 
 * setCols--
 * The part of a SQL query that is written to update only the 
 * columns mentioned in request. 
 * Will look like: "name"=$1, "num_employees"=$2, "description"=$3
 * (Can have more or less items in array depending on how many properties the
 * request is trying to change.)
 * 
 * values--
 * An array containing the information to be input to the sql query
 * (the values that go inside the $1, $2, etc.)
 **/


function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  console.log("START OF sqlForPartialUpdate(dataToUpdate, jsToSql".red);
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");
  console.log("@@@@@@".blue, "@@@@@@".red, "@@@@@@".green, "@@@@@@".yellow, "@@@@@@".blue)
  console.log("keys: ".yellow, keys);
  
  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
  `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );
  console.log("cols: ".yellow, cols);
  console.log(`setCols (cols.join(", ")): `.yellow, cols.join(", "));
  console.log(`values (Object.values(dataToUpdate)): `.yellow, Object.values(dataToUpdate));
  
  console.log("@@@@@@".blue, "@@@@@@".red, "@@@@@@".green, "@@@@@@".yellow, "@@@@@@".blue)
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };

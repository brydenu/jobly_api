"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      console.log("==============================================================".red)
      console.log("req.headers: ".blue, req.headers)
      console.log("req.headers.authorization: ".blue, req.headers.authorization)
      console.log("authHeader: ".blue, authHeader)
      console.log("token: ".blue, token)
      console.log("==============================================================".red)
      
      res.locals.user = jwt.verify(token, SECRET_KEY);

      console.log("==============================================================".green)
      console.log("res.locals: ".blue, res.locals)
      console.log("==============================================================".green)
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when they must be an admin.
 * 
 * Identical to ensureLoggedIn, with added need for isAdmin from JWT.
 * Raises Unauthorized Error if either there is no user or user is not an admin.
 */

function ensureAdmin(req, res, next) {
  try {
    if (!res.locals.user || !res.locals.user.isAdmin) throw new UnauthorizedError();
    return next();
  } catch(e) {
    return next(e)
  }
}

/** Middleware that makes sure the current user is either an admin or
 * a user that would have authorization for the current request (ex. when deleting
 * or updating a user, if you are not an admin you must be the user you are trying to
 * update/delete)
 * 
 * Also very similar to ensureLoggedIn and ensureAdmin.
 * Raises Unauthorized Error in cases where user does not match user being edited and 
 * admin token is not found.
 */

function ensureAuthorized(req, res, next) {
  try {
    const user = res.locals.user;
    if (!(user && (user.isAdmin || user.username === req.params.username))) {
      throw new UnauthorizedError(); 
    }
    return next()
  } catch(err) {
    return next(err)
  }
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureAuthorized
};
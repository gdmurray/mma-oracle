console.log("INITIALIZING MONGO USER AND DATABASE: ", process.env["MONGODB_USER"], process.env["MONGODB_NAME"])
// var rootUser = process.env["MONGO_INITDB_ROOT_USERNAME"]
// var rootPass = process.env["MONGO_INITDB_ROOT_PASSWORD"]
// var admin = db.getSiblingDB('admin');
// admin.auth(rootUser, rootPass);
// console.log("AUTHENTICATED WITH ROOT USER")
// var user = process.env["MONGODB_USER"]
// var pass = process.env["MONGODB_PASSWORD"]
db = db.getSiblingDB("mmaoracledb")
// console.log("GOT NEW DATABASE");
const result = db.createUser({
    user: process.env["MONGODB_USER"],
    pwd: process.env["MONGODB_PASSWORD"],
    roles: [{roles: ['readWrite'], db: process.env["MONGODB_NAME"]}],
})

// console.log("RESULT: ", result);

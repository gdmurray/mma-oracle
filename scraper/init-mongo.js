console.log("INITIALIZING MONGO USER AND DATABASE: ", process.env["MONGODB_USER"], process.env["MONGODB_NAME"])
// db = db.getSiblingDB(process.env["MONGODB_NAME"])
db.createUser({
    user: process.env["MONGODB_USER"],
    password: process.env["MONGODB_PASSWORD"],
    roles: [{role: 'readWrite', db: process.env["MONGODB_NAME"]}],
})

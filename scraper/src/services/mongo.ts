import dotenv from "dotenv";

const isProduction = process.env.NODE_ENV === 'production';

if(isProduction){
    console.log("Running Node Backend in Production Mode", isProduction);
}else{
    console.log("Running Node Backend in Development Mode", isProduction);
}

if (!isProduction) {
    dotenv.config();
}

function getMongoUrl(): string {
    const mongoUrl = process.env["MONGODB_URL"];
    console.log("Mongurl, env: ", mongoUrl, isProduction);
    if (mongoUrl == null && isProduction) {
        if (isProduction) {
            const mongoVars = {
                MONGODB_NAME: process.env["MONGODB_NAME"],
                MONGODB_USER: process.env["MONGODB_USER"],
                MONGODB_PASSWORD: process.env["MONGODB_PASSWORD"],
                MONGODB_HOST: process.env["MONGODB_HOST"] ?? "mongodb",
                MONGODB_PORT: process.env["MONGODB_PORT"] ?? 27017,
                MONGODB_CONNECTION: process.env["MONGODB_CONNECTION"] ?? "mongodb",
            }
            for (const [key, value] of Object.entries(mongoVars)) {
                if (value == null) {
                    console.error(`${key} is not defined`);
                    process.exit(1);
                }
            }
            let {
                MONGODB_NAME: name,
                MONGODB_USER: user,
                MONGODB_PASSWORD: password,
                MONGODB_HOST: host,
                MONGODB_PORT: port,
                MONGODB_CONNECTION: connection
            } = mongoVars;
            user = encodeURIComponent(user);
            password = encodeURIComponent(password);
            name = encodeURIComponent(name);
            return `${connection}://${user}:${password}@${host}:${port}/${name}?authSource=${name}`;
        }
        console.error("MONGODB_URL is not defined");
        process.exit(1);
    }
    return mongoUrl;
}

export const mongoUrl = getMongoUrl();

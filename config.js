const DEVPORT = 9002
const GITPODURL = `https://${DEVPORT}-e86f92db-f24e-4089-b8df-7bed4a3a25dd.ws-us02.gitpod.io`
const childProcess = require("child_process");
function execute(command) {

    return new Promise(function (resolve, reject) {
        childProcess.exec(command, function (error, standardOutput, standardError) {
            if (error) {
                reject();

                return;
            }

            if (standardError) {
                reject(standardError);

                return;
            }

            resolve(standardOutput);
        });
    });
}

// get URL to use for GITPOD

const GETURL = async () => {
    const URL = await execute(`gp url ${DEVPORT}`)
    console.log(URL)
    return URL.trim()
}


// setTimeout(async() => console.log("URL IS ", await GETURL()))

module.exports = {
    PORT: process.env.PORT || 5000,
    DEVPORT: DEVPORT,
    GETURL: GETURL
};

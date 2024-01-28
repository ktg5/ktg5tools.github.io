const fs = require('fs-extra');
const fsPromises = require('fs/promises');
const path = require('path');


// Output folder
var outputDir = './output';

// Before starting, we have to make sure the output folder is removed
if (fs.existsSync(outputDir)) {
    console.log(`Deleting past output folder`);
    fs.rmSync(outputDir, { recursive: true });
    console.log(`Deleted past output folder`);
}

// Function to copy all the dirs but not REALLY all of them.
async function copyDir(sourceDir, newDir) {
    // Get dirs in the project folder.
    var dirs = await fsPromises.readdir(sourceDir, { withFileTypes: true });
    await fsPromises.mkdir(newDir);
    
    // now we finna do something with all of these dirs
    for (let entry of dirs) {
        // Folders & files that we AIN'T ALLOWIN'!
        if (
            entry.name === '.git' ||
            entry.name === '.github' ||
            entry.name === 'psds' ||
            entry.name === 'node_modules' ||
            entry.name === 'build.js' ||
            entry.name === 'package-lock.json' ||
            entry.name === 'package.json'
        ) continue;

        // If the files passed the vibe check, we go.
        const sourcePath = path.join(sourceDir, entry.name);
        const newPath = path.join(newDir, entry.name);
        if (entry.isDirectory()) {
            await copyDir(sourcePath, newPath);
        } else {
            await fsPromises.copyFile(sourcePath, newPath);
        }
    }
}

// Here's we build.
// We'll output everything to the output/ folder
copyDir('./', outputDir).then(async () => {
    console.log(`Copied the repo folder to "output/"`);
    console.log(`-------------`);


    // MultiTTV
    var multiTTVDir = `${outputDir}/multittv`;
    // Replace current "config.js" with "config-retail.js"
    fs.removeSync(`${multiTTVDir}/src/config.js`)
    fs.renameSync(`${multiTTVDir}/src/config-retail.js`, `${multiTTVDir}/src/config.js`);
    console.log(`Removed local config & replaced it with retail config`);
    console.log(`-------------`);


    // Finish
    console.log(`Everything should be done!`);
    console.log(`-------------`);
});
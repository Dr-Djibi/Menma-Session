const fs = require('fs');

const dummyCreds = JSON.stringify({
    "test": "credential",
    "key": "value",
    "long_string": "this_makes_sure_the_length_is_over_50_characters_for_testing_purposes"
});
console.log("Original dummy creds:", dummyCreds);

const generatedSessionID = "Menma_md_" + Buffer.from(dummyCreds).toString('base64');
console.log("Generated Session ID:", generatedSessionID);

// Simulated Bot Parser
let sessionIdData = generatedSessionID;
sessionIdData = sessionIdData.replace(/^Men[Mm]a-M[Dd]_/, "");
sessionIdData = sessionIdData.replace(/_SESSION_ID$/, "");

const isBase64 = sessionIdData.length > 50;
console.log("\nParsing results:");
console.log("Is Base64?", isBase64, "Length:", sessionIdData.length);

if (isBase64) {
    const decoded = Buffer.from(sessionIdData, 'base64').toString('utf-8');
    console.log("Decoded successfully?", decoded === dummyCreds);
    console.log("Decoded result:", decoded);
}

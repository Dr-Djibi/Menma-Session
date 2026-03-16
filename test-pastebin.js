const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');

async function testPastebin() {
    try {
        console.log("Creating paste...");
        const data = JSON.stringify({ test: "data_" + Date.now() });
        const paste = await pastebin.createPaste(data, 'Menma-Md Session API Test', null, 1, 'N');
        console.log("Paste response:", paste);

        if (paste.includes('https://pastebin.com/')) {
            const b64data = "Menma_md_" + paste.split('https://pastebin.com/')[1] + "_SESSION_ID";
            console.log("Generated Session ID:", b64data);
        } else {
            console.log("Paste response does not contain URL. It might be an error.");
            const b64data = "Menma_md_" + paste.split('https://pastebin.com/')[1] + "_SESSION_ID";
            console.log("Resulting Session ID would be:", b64data);
        }
    } catch (err) {
        console.error("Error creating paste:", err);
    }
}

testPastebin();

const fs = require("fs");
totalNumber = 550;
for (let index = 0; index <= totalNumber; index++) {
    let tempNum = Math.floor(Math.random() * 100);
    let tempString = "Gold";
    if (tempNum % 2 == 0) {
        tempString = "Silver";
        //console.log(tempString);
    }
    // create a JSON object
    const tempData = {
        description: "Fanzone.io club pass",
        external_url: "https://fanzone.io",
        image:
            "ipfs://QmWuLgRpwwz4QyQ3NbXDPLDXpZEo6c7uEtrpDv8um615ZC",
        animation_url: "ipfs://QmUsVLjXgvWaodXRmk59GqxwKZjPyACzLwio28GCVtUeNC",
        name: "Fanzone Sports Club ##" + index,
        attributes: [
            {
                trait_type: "Pass Type",
                value: tempString,
            },
            {
                trait_type: "Sale Type",
                value: "Private",
            },
        ],
    };

    // convert JSON object to string
    const data = JSON.stringify(tempData, null, 4);

    // write JSON string to a file
    fs.writeFile("./outputJson/" + index + ".json", data, (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved.");
    });
}

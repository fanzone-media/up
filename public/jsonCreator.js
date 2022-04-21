const fs = require("fs");
totalNumber = 555;
for (let index = 0; index <= totalNumber; index++) {
    let tempNum = Math.floor(Math.random() * 100);
    let tempString = "Gold";
    if (tempNum % 2 == 0) {
        tempString = "Silver";
        //console.log(tempString);
    }
    // create a JSON object
    let tempData = {
        //description: "FANZONE.io - Fanzone Sports Club Pass",
        description: "FANZONE.io - Testzone Sports Club Pass",
        external_url: "https://fanzone.io",
        image:
            "ipfs://QmStQYA5jJkDnQ46mM99wrmq9FYuJibU6GnG49qPuqXBEQ",
        animation_url: "ipfs://QmbSTe2Cdj41seYdAbdnEyQ86v1oA63SPBHCX3QJhBooEo",
        //name: "Fanzone Sports Club ##" + index,
        name: "Testzone Sports Club ##" + index,
        /*attributes: [
            {
                trait_type: "Pass Type",
                value: tempString,
            },
            {
                trait_type: "Sale Type",
                value: "Private",
            },
        ],*/
    };

    if (index == 0) {
        let tempData = {
            //description: "FANZONE.io - Fanzone Sports Club Passes",
            description: "FANZONE.io - Testzone Sports Club Passes",
            external_link: "https://fanzone.io",
            image:
                "ipfs://QmStQYA5jJkDnQ46mM99wrmq9FYuJibU6GnG49qPuqXBEQ",
            animation_url: "ipfs://QmbSTe2Cdj41seYdAbdnEyQ86v1oA63SPBHCX3QJhBooEo",
            //name: "Fanzone Sports Club ##",
            name: "Testzone Sports Club",
            seller_fee_basis_points: 500,
            fee_recipient: "0x87847d301E8Da1D7E95263c3478d7F6e229E3F4b"
        };
    }

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

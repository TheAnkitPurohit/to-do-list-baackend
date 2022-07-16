// getting-started.js
const mongoose = require("mongoose");

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.DATABASE, () => {
    console.log("DB Connected");
  });
}

const express = require("express");
const app = express();
//const { MongoClient } = require("mongodb");

// Importing Puppeteer core as default otherwise
// it won't function correctly with "launch()"
const puppeteer = require("puppeteer");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Schema = require("./schema");

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

mongoose
  .connect("mongodb://147.50.227.164:27017/data", { useNewUrlParser: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

app.get("/yeekee5", async (req, res) => {
  var round = [];
  var upper3 = [];
  var lower2 = [];
  for (let i = 1; i <= 264; i++) {
    round.push(
      `div#huayYeekee5-section div:nth-child(${i}) > div > div.p-1.mb-1.huay-card-header > span.huay-card-product.huay-card-product-yeekee5.ml-2 > span.huay-card-period-yk`
    );
    upper3.push(
      `div#huayYeekee5-section div:nth-child(${i}) > div > div.p-0.huay-card-body > div > div.text-center.w-50.huay-card-border-right.m-0 > div.p-0.text-award-choke`
    );
    lower2.push(
      `div#huayYeekee5-section div:nth-child(${i}) > div > div.p-0.huay-card-body > div > div:nth-child(2) > div.p-0.text-award-choke`
    );
  }
  //   // Launch a new headless browser instance

  //   // Edge executable will return an empty string locally.
  const pathToExtension = "/usr/bin/chromium-browser";
  const browser = await puppeteer.launch({
  //  executablePath: pathToExtension,
    args: ["--disable-infobars", "--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
  });

  // Open a new page in the browser
  const page = await browser.newPage();
  // page.setRequestInterception(true);

  try {
    await page.goto("https://www.mhandee.com/", {
      waitUntil: "networkidle0",
      timeout: 20000,
    });

    var roundtext = [];
    var upper3text = [];
    var lower2text = [];
    var roundtexts = [];
    var upper3texts = [];
    var lower2texts = [];
    var alldata = [];
    for (let i = 0; i < round.length; i++) {
      roundtext.push(await page.$(`${round[i]}`));
      upper3text.push(await page.$(`${upper3[i]}`));
      lower2text.push(await page.$(`${lower2[i]}`));

      roundtexts.push(await page.evaluate((el) => el.innerText, roundtext[i]));
      upper3texts.push(
        await page.evaluate((el) => el.innerText, upper3text[i])
      );
      lower2texts.push(
        await page.evaluate((el) => el.innerText, lower2text[i])
      );
      alldata[i] = {
        name: "หวยยี่กี",
        round: parseInt(roundtexts[i].substr(16,3)),
        date: roundtexts[i].substr(0,8),
        upper3: upper3texts[i],
        below2: lower2texts[i],
      };
    }
  } catch (error) {
    res.status(404).json("request limit reached");
    await browser.close();
  }
  try {
    await Schema.deleteMany({});
    console.log("All documents deleted");
    const k = await Schema.create(alldata);
    console.log(k);
    res.status(200).send(alldata);
    await browser.close(); // Close the browser instance
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

app.listen(4001, () => {
  console.log("Server listening on port 6000");
});

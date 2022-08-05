const cheerio = require("cheerio");
const axios = require("axios");
const json2csv = require("json2csv").Parser;
const fs = require("fs");

const StartedUrl =
  "https://books.toscrape.com/catalogue/category/books/mystery_3/index.html";
const BaseUrl =
  "https://books.toscrape.com/catalogue/category/books/mystery_3/";

const book_data = [];

let i = 1;

const consoleInfo = function (genre) {
  console.log(genre);
  console.log(`the ${i} page has been scraped.`);
  i++;
};

const parseToCsv = function (book_data) {
  const parser = new json2csv();
  const csv = parser.parse(book_data);
  return csv;
};

const saveToFile = function (csv) {
  fs.writeFileSync("./books.csv", csv);
};

async function getBooks(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const books = $("article");
    books.each(function () {
      title = $(this).find("h3 a").text();
      price = $(this).find(".price_color").text();
      stock = $(this).find(".availability").text().trim();

      book_data.push({
        title,
        price,
        stock,
      });
    });

    const genre = $("h1").text();
    consoleInfo(genre);

    if ($(".next a").length > 0) {
      next_page = BaseUrl + $(".next a").attr("href");
      getBooks(next_page);
    } else {
      saveToFile(parseToCsv(book_data));
      console.log("end");
    }

    // console.log(book_data);
  } catch (error) {
    console.error(error);
  }
}
getBooks(StartedUrl);

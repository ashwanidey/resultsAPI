const express = require('express');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const {dataExtractor} = require('./utils/dataExtractor');
const dotenv = require('dotenv');

const app = express()

app.use(express.json())

app.get("/", async(req, res) => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    ignoreDefaultArgs: ['--disable-extensions'],
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
    try {
      
   const page = await browser.newPage();
  
  // Navigate to the website
  const url = 'https://ums.lpu.in/result/'; // Replace with the target URL
  await page.goto(url);
  
  // Input the Registration number (Replace '#regInput' with the actual selector)
  const regNumber = '12202611'; // Replace with the actual registration number
  await page.type('#txtRegdNo', regNumber);
  
  // Click the submit button (Replace '#submitBtn' with the actual selector)
  await page.click('#btnshow');
  
  // Wait for the results table to load (Modify the selector to the actual table selector)
  await page.waitForSelector('#tblnew');

  // Get the HTML of the page
  const content = await page.content();
  
  // Load the HTML into Cheerio for parsing
  const $ = cheerio.load(content);

  const tableData = [];
  $('#tblnew tr').each((index, element) => {
    const row = {};
    $(element).find('td').each((i, td) => {
      row[`column${i}`] = $(td).text().trim(); // Adjust according to your column names
    });
    if (Object.keys(row).length) {
      tableData.push(row);
    }
  });1 

  // Close the browser
  await browser.close();
  const studentData = {
    Name: tableData[0].column7,
    RegistrationNumber: regNumber,
    Programme: tableData[0].column3,
    CGPA: tableData[7].column5.substring(7),
   
  };
  const courseData = dataExtractor(tableData[7].column1.toString());

  const resultData = {
    Student: studentData,
    Courses: courseData,
  };

  // console.log(resultData);
  res.json(resultData);
    } catch (error) {
      res.send(error.message);
    }
})

app.listen(3000, () => {
    console.log("Server running on port 3000")
})
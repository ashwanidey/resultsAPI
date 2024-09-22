const express = require('express');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const app = express()

app.use(express.json())


function parseRawData(rawData) {
  const result = [];
  const terms = rawData.split('TermId').slice(0);  // Split by TermId to get each term separately
  // console.log(terms)

  terms.forEach((term,index) => {
      if(index == 0) return;
      const termObj = {};
      let termIdMatch;
      // Extract the term information
      termIdMatch = term.substring(4,10);
      
      const sessionMatch = term.match(/Session\s*:\s*\[(.*?)\]/);
      const tgpaMatch = term.match(/TGPA\s*:\s*\[(.*?)\]/);
      termObj['TermId'] = termIdMatch ? termIdMatch : null;
      termObj['Session'] = sessionMatch ? sessionMatch[1] : null;
      termObj['TGPA'] = tgpaMatch ? tgpaMatch[1] : null;

      // console.log(termObj);

      // Extract the courses for the term
      const courses = [];
      const courseRegex = /\d([A-Z]{3}\d{3}):([^0-9]+)(\d)([A-Z+]+)/g;
      let courseMatch;

      while ((courseMatch = courseRegex.exec(term)) !== null) {
          const course = {
              CourseCode: courseMatch[1].trim(),
              CourseName: courseMatch[2].trim(),
              Credits: courseMatch[3].trim(),
              Grade: courseMatch[4].trim(),
          };
          courses.push(course);
          // console.log(course);
      }

      termObj['Courses'] = courses;
      result.push(termObj);
  });

  return result;
}

app.get("/", async(req, res) => {
    try {
      const browser = await puppeteer.launch({ headless: true });
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
  const courseData = parseRawData(tableData[7].column1.toString());

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
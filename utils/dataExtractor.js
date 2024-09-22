function dataExtractor(rawData) {
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

module.exports  = {dataExtractor};
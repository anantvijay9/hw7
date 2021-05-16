// Goal: Kellogg course reviews API!
//
// Business logic:
// - Courses can be taught by more than one lecturer (e.g. Brian Eng's KIEI-451 and Ben Block's KIEI-451)
// - Information on a course includes the course number (KIEI-451) and name (Intro to Software Development)
// - Lecturers can teach more than one course (e.g. Brian Eng teaches KIEI-451 and KIEI-925)
// - Reviews can be written (anonymously) about the lecturer/course combination (what would that be called?)
// - Reviews contain a String body, and a numeric rating from 1-5
// - Keep it simple and ignore things like multiple course offerings and quarters; assume reviews are written
//   about the lecturer/course combination only – also ignore the concept of a "user" and assume reviews
//   are written anonymously
//
// Tasks:
// - (Lab) Think about and write the domain model - fill in the blanks below
// - (Lab) Build the domain model and some sample data using Firebase
// - (Lab) Write an API endpoint, using this lambda function, that accepts a course number and returns 
//   information on the course and who teaches it
// - (Homework) Provide reviews of the lecturer/course combinations 
// - (Homework) As part of the returned API, provide the total number of reviews and the average rating for 
//   BOTH the lecturer/course combination and the course as a whole.

// === Domain model - fill in the blanks ===
// There are 4 models: courses, lecturers, sections, reviews
// There is one many-to-many relationship: courses <-> lecturers, which translates to two one-to-many relationships:
// - One-to-many: courses -> sections
// - One-to-many: lecturers -> sections
// And one more one-to-many: sections -> reviews
// Therefore:
// - The first model, courses, contains the following fields: courseNumber, name
// - The second model, lecturers, contains the following fields: name
// - The third model, sections, contains the following fields: courseId, lecturerId
// - The fourth model, reviews, contains the following fields, sectionId, body, rating

// allows us to use firebase
let firebase = require(`./firebase`)

// /.netlify/functions/courses?courseNumber=KIEI-451
exports.handler = async function(event) {

  // get the course number being requested
  let courseNumber = event.queryStringParameters.courseNumber

  // establish a connection to firebase in memory
  let db = firebase.firestore()

  // ask Firebase for the course that corresponds to the course number, wait for the response
  let courseQuery = await db.collection('courses').where(`courseNumber`, `==`, courseNumber).get()

  // get the first document from the query
  let course = courseQuery.docs[0]
  
  // get the id from the document
  let courseId = course.id

  // get the data from the document
  let courseData = course.data()

  // create an object with the course data to hold the return value from our lambda
  let returnValue = {
    courseNumber: courseData.courseNumber,
    name: courseData.name,
    totalReviews: 0,
    averageCourseRating:0
  }

  // set a new Array as part of the return value
  returnValue.sections = []
  
  // ask Firebase for the sections corresponding to the Document ID of the course, wait for the response
  let sectionsQuery = await db.collection('sections').where(`courseId`, `==`, courseId).get()

  // get the documents from the query
  let sections = sectionsQuery.docs
  

  // loop through the documents
  for (let i=0; i < sections.length; i++) {

    // get the document ID of the section
    let sectionId = sections[i].id

    // get the data from the section
    let sectionData = sections[i].data()
    
    // create an Object to be added to the return value of our lambda
    let sectionObject = {}

    // ask Firebase for the lecturer with the ID provided by the section; hint: read "Retrieve One Document (when you know the Document ID)" in the reference
    let lecturerQuery = await db.collection('lecturers').doc(sectionData.lecturerId).get()

    // get the data from the returned document
    let lecturer = lecturerQuery.data()

    // add the lecturer's name and courseID to the section Object
    sectionObject.lecturerName = lecturer.name
    sectionObject.courseId=sectionData.courseId

    // add the section Object to the return value
    returnValue.sections.push(sectionObject)

    // 🔥 your code for the reviews/ratings goes here

    // Create an array to hold the reviews
    sectionObject.reviews =[]

    // ask Firebase for the reviews corresponding to the ID of the section, wait for the response
    let reviewsQuery = await db.collection('reviews').where(`sectionId`, `==`, sectionId).get()

    // get the documents from the query
    let reviews = reviewsQuery.docs

    // loop through the reviews
    for (let reviewIndex=0; reviewIndex < reviews.length; reviewIndex++) {
    
    // get the data from the reviews
    let reviewData = reviews[reviewIndex].data()

    // Create a review object and add it to the section object
    let reviewObject = {
      body: reviewData.body,
      rating: reviewData.rating,
      sectionId: reviewData.sectionId
    }
    
    // Push the review object into the reviews array
    sectionObject.reviews.push(reviewObject)

    // Increase the review count by 1
    returnValue.totalReviews=returnValue.totalReviews+1    

    // Count the number of reviews
    sectionObject.sectionReviewCount=sectionObject.reviews.length
  }
    // Loop through all the review ratings and sum them up. After summing, divide by the length to get the average
     var sum =0;
     for(var z=0 ; z<reviews.length ; z++){
        sum+=sectionObject.reviews[z].rating;
      }
    sectionObject.averageSectionRating=sum/sectionObject.reviews.length
}
    // Loop through and multiply the section ratings by the number of sections 
    // After taking the weighted average, divide by the number of reviews
    var sum1 =0;
    for(var z1=0 ; z1<returnValue.sections.length ; z1++){
      sum1+=returnValue.sections[z1].sectionReviewCount*returnValue.sections[z1].averageSectionRating;
    }
    returnValue.averageCourseRating = sum1/returnValue.totalReviews

  // return the standard response
  return {
    statusCode: 200,
    body: JSON.stringify(returnValue)
  }
}

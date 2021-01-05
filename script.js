// HELPER FUNCTIONS

// Quickly add an array of values into a given selection field
function addSelectOptions(array, selectID) {
  const selectElement = document.getElementById(selectID);
  array.forEach((value) => {
    const newOptionHTML = `<option value="${value}">${value}</option>`;
    selectElement.innerHTML += newOptionHTML;
  });
}

// Take the month name and extrapolate which worksheet to reference
function getSheetName(monthInput) {
  let monthAsNumber = months.indexOf(monthInput);
  console.log(monthAsNumber);
  return monthInput == "December" ? "2020" : `2021-0${monthAsNumber}`;
}

// Create a fresh "session info" section
function createNewSessionInfoDiv() {
  document.getElementById("session-info").innerHTML = `
    <div class="mb-3">
        <label for="select-session">Select Session:</label>
        <br />
        <select name="select-session" id="select-session"></select>
    </div>
    <button id="book-session" class="btn btn-success">Book Session</button>`;
}

// Clear existing session information and/or results
function hideSessions() {
  document.getElementById("session-info").innerHTML = "";
  document.getElementById("result-display").innerHTML = "";
}

// Success message for when a session is booked
function displaySuccess() {
  let bookingMessage = document.createElement("h3");
  bookingMessage.classList.add("text-success");
  bookingMessage.textContent = "Session booked!";
  document
    .getElementById("result-display")
    .insertAdjacentElement("afterbegin", bookingMessage);
}

// POPULATE INPUT FIELDS

// STUDENT NAME SELECTION
let studentNames = [
  "Sandra",
  "Ilya",
  "Hermann",
  "Bekhzod",
  "Lewes",
  "Karl",
  "Waell",
  "Saad",
].sort();

addSelectOptions(studentNames, "select-student");

// MONTH SELECTION
let today = new Date(); // Returns today
let currentMonth = today.getMonth() + 1; // Returns today's month + 1

// Array of relevant months to the course
let months = [
  "December",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
];

// Remove months which have already passed
let relevantMonths = months.filter((month, index) => {
  if (currentMonth == 12) {
    // If it's December, show all months
    return month;
  } else if (index >= currentMonth) {
    // Otherwise, only return months after this one
    return month;
  }
});

addSelectOptions(relevantMonths, "select-month");

// TUTOR SELECTION

let tutors = ["Anna", "Dominik", "Raafat", "Taimur", "Thomas"];
addSelectOptions(tutors, "select-tutor");

// Populate sessions

let findSessionsButton = document.getElementById("find-available-sessions");
findSessionsButton.addEventListener("click", (e) => {
  e.preventDefault(); // Stop the page from reloading
  createNewSessionInfoDiv(); // Create space for session info
  findSessions(); // Find and populate sessions
});

function findSessions() {
  // Grab results from the selection menus
  let student = document.getElementById("select-student").value;
  let month = document.getElementById("select-month").value;
  let sheetName = getSheetName(month);
  let tutor = document.getElementById("select-tutor").value;

  // Fetch available sessions from sheet2api
  var query_params = new URLSearchParams({
    query_type: "and",
    tutorName: tutor,
    studentName: 0,
  });

  // Here I use a template literal to insert the correct sheet name
  // based on which month is selected
  var url =
    `https://sheet2api.com/v1/paUjQAhERJWr/tutor-session-booking/${sheetName}?` +
    query_params;

  fetch(url)
    .then((response) => response.json())
    .then((availableSessions) => {
      // If no sessions available: display a message
      if (availableSessions.length === 0) {
        document.getElementById("session-info").textContent =
          "Sorry, there are no sessions available with those selections";
      } else {
        // Create an array of available sessions
        // with strings formatted for the selection dropdown
        let sessionList = availableSessions.map((session) => {
          return `${session.sessionDate}: ${session.sessionStartTime.slice(
            0,
            4
          )} PM to ${session.sessionEndTime.slice(0, 4)} PM`;
        });

        // Create an object with the basic building blocks of our request
        let bookingBaseObject = {
          studentName: student,
          tutorName: tutor,
          sheetName: sheetName,
        };

        addSelectOptions(sessionList, "select-session");
        createSessionBooker(bookingBaseObject); // Creates onclick for booking button
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Function for creating the "Book Session" onclick

function createSessionBooker(bookingBaseObject) {
  document.getElementById("book-session").addEventListener("click", (e) => {
    e.preventDefault();
    let selectedSession = document.getElementById("select-session").value;
    let sessionDate = selectedSession.slice(0, 10);
    let sessionStartTime = selectedSession.slice(12, 16) + ":00 PM";
    let bookingInfo = {
      ...bookingBaseObject,
      sessionStartTime: sessionStartTime,
      sessionDate: sessionDate,
    };
    bookSession(bookingInfo);
  });
}

// Function for querying the database and updating the relevant session
// with the student's name

function bookSession(bookingInfo) {
  let sheetName = bookingInfo.sheetName;
  console.log(sheetName);
  let query_params = new URLSearchParams({
    query_type: "and",
    tutorName: bookingInfo.tutorName,
    sessionDate: bookingInfo.sessionDate,
    sessionStartTime: bookingInfo.sessionStartTime,
    studentName: 0,
  });

  var data = { studentName: bookingInfo.studentName };
  console.log(data);
  var url =
    `https://sheet2api.com/v1/paUjQAhERJWr/tutor-session-booking/${sheetName}?` +
    query_params;

  fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      hideSessions();
      displaySuccess();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Copy input field function
// Taken from https://www.w3schools.com/howto/howto_js_copy_clipboard.asp

function copyURL() {
  /* Get the text field */
  var copyText = document.getElementById("copyURL");

  /* Select the text field */
  copyText.select();
  copyText.setSelectionRange(0, 99999); /* For mobile devices */

  /* Copy the text inside the text field */
  document.execCommand("copy");
}

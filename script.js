function addSelectOptions(array, selectID) {
  const selectElement = document.getElementById(selectID);
  array.forEach((value) => {
    const newOptionHTML = `<option value="${value}">${value}</option>`;
    selectElement.innerHTML += newOptionHTML;
  });
}

// Student name select

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

// Month select
let today = new Date();
let currentMonth = today.getMonth() + 1;
console.log(currentMonth);

let months = [
  "December",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
];

let relevantMonths = months.filter((month, index) => {
  if (currentMonth == 12) {
    return month;
  } else if (index >= currentMonth) {
    return month;
  }
});

addSelectOptions(relevantMonths, "select-month");

//Date select
//TODO

// Tutor select

let tutors = ["Anna", "Raafat", "Taimur", "Thomas"];
addSelectOptions(tutors, "select-tutor");

// Populate sessions

let findSessionsButton = document.getElementById("find-available-sessions");

function getSheetName(monthInput) {
  let monthAsNumber = months.indexOf(monthInput);
  console.log(monthAsNumber);
  return monthInput == "December" ? "2020" : `2021-0${monthAsNumber}`;
}

function findSessions() {
  let student = document.getElementById("select-student").value;
  let month = document.getElementById("select-month").value;
  let sheetName = getSheetName(month);
  let tutor = document.getElementById("select-tutor").value;

  var query_params = new URLSearchParams({
    query_type: "and",
    tutorName: tutor,
    studentName: 0,
  });
  var url =
    `https://sheet2api.com/v1/paUjQAhERJWr/tutor-session-booking/${sheetName}?` +
    query_params;

  fetch(url)
    .then((response) => response.json())
    .then((availableSessions) => {
      if (availableSessions.length === 0) {
        document.getElementById("session-info").textContent =
          "Sorry, there are no sessions available with those selections";
      } else {
        let sessionList = availableSessions.map((session) => {
          return `${session.sessionDate}: ${session.sessionStartTime.slice(
            0,
            4
          )} PM to ${session.sessionEndTime.slice(0, 4)} PM`;
        });
        let bookingBaseObject = {
          studentName: student,
          tutorName: tutor,
          sheetName: sheetName,
        };

        addSelectOptions(sessionList, "select-session");
        createSessionBooker(bookingBaseObject);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

findSessionsButton.addEventListener("click", (e) => {
  e.preventDefault();
  createNewSessionInfoDiv();
  findSessions();
});

function createNewSessionInfoDiv() {
  document.getElementById(
    "session-info"
  ).innerHTML = ` <div class="mb-3">       <label for="select-session"
          >Select Session: </label><br /><select name="select-session" id="select-session"></select
        ></div>
        <button id="book-session" class="btn btn-success">Book Session</button>`;
}
// Book an available session

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

function bookSession(bookingInfo) {
  let sheetName = bookingInfo.sheetName;
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

function hideSessions() {
  document.getElementById("session-info").innerHTML = "";
  document.getElementById("result-display").innerHTML = "";
}

function displaySuccess() {
  let bookingMessage = document.createElement("h3");
  bookingMessage.classList.add("text-success");
  bookingMessage.textContent = "Session booked!";
  document
    .getElementById("result-display")
    .insertAdjacentElement("afterbegin", bookingMessage);
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

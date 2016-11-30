// all teams are saved in localStorage
// localStorage doesn't support arrays, so we have to convert the teams array to a string and back
const getTeams = () => JSON.parse(localStorage.getItem("teams"));

const hasTeam = (name) => getTeams().map(team => team.name).indexOf(name) !== -1;

// this makes it easy to validate a team
const teamFields = ["name", "notes", "autonPoints", "auton"];
const isValidTeam = (team) => teamFields
  .map(property => team.hasOwnProperty(property))
  .reduce((isValidSoFar, hasProp) => isValidSoFar && hasProp);

// only adds the team if the team is valid and is not already in localStorage
const addTeam = (team) => {
  // add the team
  if (isValidTeam(team) && !hasTeam(team.name)) {
    localStorage.setItem("teams", JSON.stringify(getTeams().concat(team)));
  }
};

const removeTeam = (name) => {
  const teamsWithoutTeam = getTeams().filter(t => t.name !== name);
  localStorage.setItem("teams", JSON.stringify(teamsWithoutTeam));

  // try to sync to firebase
  // if it can't sync, just fail silently
  if (firebase) {
    try {
      firebase.database().ref(`team/${name}`).set(null);
    } catch (error) {}
  }
};

const uploadTeamToFirebase = (team) => firebase.database().ref(`team/${team.name}`).set(team);
const uploadToFirebase = () => getTeams.forEach(uploadTeamToFirebase);

// initialize the teams value by making sure that it is set to an array
localStorage.setItem("teams", localStorage.getItem("teams") || "[]");

// remove any invalid teams before displaying them
getTeams().filter(team => !isValidTeam(team)).forEach(team => removeTeam(team.name));

const renderTeams = () => {
  document.getElementById("teams").innerHTML = ""; // clear the teams

  for (let team of getTeams()) {
    const teamNode = document.createElement("div");
    teamNode.innerHTML = `
      <h3>${team.name}</h3>
      <p>${team.notes}</p>
      <p>Autonomous Points: <b>${team.autonPoints}</b></p>
      <p>Has auton: <b>${team.auton}</b></p>
      <button team="${team.name}" class="remove-team">Remove</button>
    `;
    document.getElementById("teams").appendChild(teamNode);
  }

  for (let button of document.getElementsByClassName("remove-team")) {
    button.addEventListener("click", (event) => {
      const teamName = event.target.outerHTML.match(/team=\"(.*?)\"/)[1];
      removeTeam(teamName);
      renderTeams();
    });
  }
};

renderTeams();

// save the team entered when save button is pressed
document.getElementById("save").addEventListener("click", (event) => {
  event.preventDefault();
  const team = {};
  for (let field of teamFields) {
    team[field] = document.getElementById(field).value;
  }
  if (isValidTeam(team)) {
    addTeam(team);
    uploadTeamToFirebase(team);
    renderTeams();
  }
});

const sync = () => {
  const firebaseAPIKey = localStorage.getItem("firebase-api-key");
  const firebaseProjectName = localStorage.getItem("firebase-project-name").toLowerCase();

  if (!firebase || !firebaseAPIKey || !firebaseProjectName) {
    return;
  }

  firebase.initializeApp({
    apiKey: firebaseAPIKey,
    authDomain: `${firebaseProjectName}.firebaseapp.com`,
    databaseURL: `https://${firebaseProjectName}.firebaseio.com`,
    storageBucket: `${firebaseProjectName}.appspot.com`,
    messagingSenderId: "805247801529"
  });

  // download any new teams and display them
  const teams = firebase.database().ref("team").on("value", (teams) => {
    document.getElementById("firebase-sync-message").innerHTML =
      `<strong>Firebase connected to ${firebaseProjectName}</strong>`;
    for (let teamName in teams.val()) {
      const team = teams.val()[teamName];
      if (!hasTeam(team.name) && isValidTeam(team)) {
        addTeam(team);
      }
    }
    renderTeams();
  });

  // upload new teams
  getTeams().forEach(team => firebase.database().ref(`team/${team.name}`).set(team));
}

if (firebase) {
  sync();
}

document.getElementById("firebase-sync-save").addEventListener("click", (event) => {
  event.preventDefault();
  for (let key of ["firebase-api-key", "firebase-project-name"]) {
    localStorage.setItem(key, document.getElementById(key).value);
  }
  sync();
});

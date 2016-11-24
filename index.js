// all teams are saved in localStorage
// localStorage doesn't support arrays, so we have to convert the teams array to a string and back
// these functions make it easier to manage teams without directly calling localStorage
const getTeams = () => JSON.parse(localStorage.getItem("teams"));
const hasTeam = (name) => getTeams().map(team => team.name).indexOf(name) !== -1;
const isValidTeam = (team) => team.hasOwnProperty("name") && team.hasOwnProperty("notes");
const addTeam = (team) => {
  // add the team
  if (!hasTeam(team.name)) {
    localStorage.setItem("teams", JSON.stringify(getTeams().concat(team)));
  }

  // remove any teams that don't have both a name and notes
  const teams = getTeams().filter(isValidTeam);
  localStorage.setItem("teams", JSON.stringify(teams));
};
const removeTeam = (name) => {
  const teamsWithoutTeam = getTeams().filter(t => t.name !== name);
  localStorage.setItem("teams", JSON.stringify(teamsWithoutTeam));
  if (firebase) {
    firebase.database().ref(`team/${name}`).set(null);
  }
};
const uploadTeamToFirebase = (team) => firebase.database().ref(`team/${team.name}`).set(team);
const uploadToFirebase = () => getTeams.forEach(uploadTeamToFirebase);

// initialize the teams value by making sure that it is set to an array
localStorage.setItem("teams", localStorage.getItem("teams") || "[]");

// show all the currently saved teams in #teams
const renderTeams = () => {
  document.getElementById("teams").innerHTML = ""; // clear the teams

  const teams = getTeams();
  if (teams.length > 0) {
    document.getElementById("teams").innerHTML = "<h2>Teams</h2>";
  }
  for (let i = 1; i < teams.length; i++) {
    const teamNode = document.createElement("div");
    const team = teams[i];
    teamNode.innerHTML = `
      <h3>${team.name}</h3>
      <p>${team.notes}</p>
      <p>Autonomous Points: ${team.autonPoints}</p>
      <p>Has auton: ${team.auton}</p>
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

// save the team entered when save button is pressed
document.getElementById("save").addEventListener("click", (event) => {
  event.preventDefault();
  const name = document.getElementById("name").value;
  const notes = document.getElementById("notes").value;
  const autonPoints = document.getElementById("autonPoints").value;
  const auton = document.getElementById("auton").checked;
  if (name) {
    const team = { name, notes, autonPoints, auton };
    addTeam(team);
    uploadTeamToFirebase(team);
    renderTeams();
  }
});

renderTeams();

// handle automatic syncing
if (firebase) {
  firebase.initializeApp({
    apiKey: "AIzaSyCinnVb0Y6eXw9ttyspV32NJnugRvQtbmM",
    authDomain: "nys-vex.firebaseapp.com",
    databaseURL: "https://nys-vex.firebaseio.com",
    storageBucket: "nys-vex.appspot.com",
    messagingSenderId: "40799368085"
  });

  // download any new teams and display them
  const teams = firebase.database().ref("team").on("value", (teams) => {
    for (let teamName in teams.val()) {
      const team = teams.val()[teamName];
      if (!hasTeam(team.name)) {
        addTeam(team);
      }
    }
    renderTeams();
  });

  // upload new teams
  getTeams().forEach(team => firebase.database().ref(`team/${team.name}`).set(team));
}

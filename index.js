// all teams are saved in localStorage
// localStorage doesn't support arrays, so we have to convert the teams array to a string and back
// these functions make it easier to manage teams without directly calling localStorage
const getTeams = () => JSON.parse(localStorage.getItem("teams"));
const addTeam = (team) => localStorage.setItem("teams", JSON.stringify(getTeams().concat(team)));
const removeTeam = (name) => {
  const teamsWithoutTeam = getTeams().filter(t => t.name !== name);
  localStorage.setItem("teams", JSON.stringify(teamsWithoutTeam));
};
// initialize the teams value by making sure that it is set to an array
localStorage.setItem("teams", localStorage.getItem("teams") || "[]");

// show all the currently saved teams in #teams
const renderTeams = () => {
  document.getElementById("teams").innerHTML = ""; // clear the teams

  const teams = getTeams();
  for (let team of teams) {
    const teamNode = document.createElement("div");
    teamNode.innerHTML = `
      <h3>${team.name}</h3>
      <p>${team.notes}</p>
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
document.getElementById("save").addEventListener("click", () => {
  const name = document.getElementById("name").value;
  const notes = document.getElementById("notes").value;
  addTeam({ name, notes });
  renderTeams();
});

renderTeams();

// show all the currently saved teams
const renderTeams = () => {
  const teams = JSON.parse(localStorage.getItem("teams"));
  for (let team of teams) {
    // we will make a node of the form:
    // <div>
    //   <h3>NAME</h3>
    //   <p>NOTES</p>
    // </div>

    const div = document.createElement("div");
    div.innerHTML = `
      <h3>${team.name}</h3>
      <p>${team.notes}</p>
    `;
    document.getElementById("teams").appendChild(div);
  }
};

// save the team entered when save button is pressed
document.getElementById("save").addEventListener("click", () => {
  const name = document.getElementById("name").value;
  const notes = document.getElementById("notes").value;
  const team = { name, notes };
  const teams = JSON.parse(localStorage.getItem("teams")).concat(team);
  localStorage.setItem("teams", JSON.stringify(teams));
  renderTeams();
});

// make sure that teams is set to an array
localStorage.setItem("teams", localStorage.getItem("teams") || "[]");
renderTeams();

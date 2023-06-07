import Dropdown from "./Dropdown"

export default function Table({ title, scores }) {
  const competition = 'Utility';
  const skills =  ['agility','construction','firemaking','slayer','thieving'];

  const rows = scores.map((row, index) => {
    return(
      <tr className="personal-hiscores__row">
        <td className="right">{index + 1}</td>
        <td className="left">{row.name}</td>
        <td></td>
        <td className="right">{row.score.toLocaleString()}</td>
      </tr>
    )
  });

  return (
    <table>
    <caption>
      <Dropdown title={title.charAt(0).toUpperCase() + title.slice(1)} competition={competition} skills={skills}/>
    </caption>

    <thead>
      <tr>
        <th class="right">Rank</th>
        <th class="left">Name</th>
        <th> </th>
        <th class="right">XP</th>
      </tr>
    </thead>
    <tbody id="personal-hiscores__tbody">
      <tr>
        <td width="60"></td>
        <td width="190"></td>
        <td width="0"></td>
        <td width="100"></td>
      </tr>
      {rows}

    </tbody>
  </table>
  )
}

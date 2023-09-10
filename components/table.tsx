import Dropdown from "./dropdown"
import { TableProps } from "../lib/types";

export default function Table(
  { 
    title, 
    scores,
  }: TableProps) {
  const rows = scores != null ? scores.map((row, index) => {
    return(
      <tr key={index} className="personal-hiscores__row">
        <td className="right">{index + 1}</td>
        <td className="left">{row.name}</td>
        <td></td>
        <td className="right">{row.score.toLocaleString()}</td>
      </tr>
    )
  }) : (
    <tr className="personal-hiscores__row">
        <td className="right"></td>
        <td className="left"><b>Loading...</b></td>
        <td></td>
        <td className="right"></td>
      </tr>
  );

  return (
    <table>
    <caption>
      <Dropdown title={title.charAt(0).toUpperCase() + title.slice(1)} />
    </caption>

    <thead>
      <tr>
        <th className="right">Rank</th>
        <th className="left">Name</th>
        <th> </th>
        <th className="right">XP</th>
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

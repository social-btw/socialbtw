import Dropdown from "./dropdown"
import { TableProps } from "@/lib/types";
import styles from '@/styles/table.module.css'
import { runescapeChatBold07 } from "@/app/fonts/fonts";

export default function Table({ title, scores }: TableProps) {
  const rows = scores != null ? scores.map((row, index) => {
    return (
      <tr key={index}>
        <td className={styles.right}>{index + 1}</td>
        <td className={styles.left}>{row.name}</td>
        <td className={styles.right}>{row.score.toLocaleString()}</td>
      </tr>
    )
  }) : (
    <tr>
      <td className={styles.right}></td>
      <td className={styles.left}><b>Loading...</b></td>
      <td className={styles.right}></td>
    </tr>
  );

  return (
    <table className={styles.table}>
      <caption>
        <Dropdown title={title.charAt(0).toUpperCase() + title.slice(1)} />
      </caption>

      <thead>
        <tr>
          <th className={runescapeChatBold07.className + " " + styles.right + " " + styles.header}>Rank</th>
          <th className={runescapeChatBold07.className + " " + styles.left + " " + styles.header}>Name</th>
          <th className={runescapeChatBold07.className + " " + styles.right + " " + styles.header}>XP</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td width="22%"></td>
          <td width="47%"></td>
          <td width="28%"></td>
        </tr>
        {rows}

      </tbody>
    </table>
  )
}

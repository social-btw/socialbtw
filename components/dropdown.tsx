import Link from 'next/link';
import { DropdownProps } from '@/lib/types';
import styles from '@/styles/dropdown.module.css'
import { runescapeChatBold07 } from '@/app/fonts/fonts';

export default function Dropdown(
  { 
    title, 
  } : DropdownProps) {
  const competition = process.env.NEXT_PUBLIC_COMPETITION_NAME!
  const skills = process.env.NEXT_PUBLIC_COMPETITION_SKILLS!.split(',')

  const options  = skills.map((name) => {
    return (
      <a key={name} href={name}>{name.charAt(0).toUpperCase() + name.slice(1)}</a>
    )
  })

  if(skills.length > 1) {
    return (
      <div className={styles.dropdown}>
        <button className={runescapeChatBold07.className + " " + styles.dropdownButton}>{title} XP ▼</button>
        <div className={styles.dropdownContent}>
          <Link className={runescapeChatBold07.className} href="/">{competition}</Link>
          {options}
        </div>
      </div>
    )
  } else {
    return (
      <div className={styles.dropdownButton}>
        {title}
      </div>
    )
  }
}

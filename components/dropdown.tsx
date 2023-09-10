import Link from 'next/link';
import { DropdownProps } from '../lib/types';

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
      <div className="dropdown">
        <button className="dropbtn">{title} XP ▼</button>
        <div className="dropdown-content">
          <Link href="/">{competition}</Link>
          {options}
        </div>
      </div>
    )
  } else {
    return (
      <div className="dropbtn">
        {title}
      </div>
    )
  }
}

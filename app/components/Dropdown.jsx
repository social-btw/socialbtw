import Link from 'next/link';

export default function Dropdown({ title, skills, competition }) {
  const options  = skills.map((name) => {
    return (
      <a key={name} href={name}>{name.charAt(0).toUpperCase() + name.slice(1)}</a>
    )
  })

  if(skills.length > 1) {
    return (
      <div class="dropdown">
        <button class="dropbtn">{title} ▼</button>
        <div class="dropdown-content">
          <Link href="/">{competition}</Link>
          {options}
        </div>
      </div>
    )
  } else {
    return (
      <div  class="dropbtn">
        {title}
      </div>
    )
  }
}

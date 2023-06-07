export default function Dropdown({ title, skills, competition }) {
  const options  = skills.map((name) => {
    return (
      <a href={name}>{name.charAt(0).toUpperCase() + name.slice(1)}</a>
    )
  })

  return (
    <div class="dropdown">
      <button class="dropbtn">{title} XP ▼</button>
      <div class="dropdown-content">
        <a href="/">{competition}</a>
        {options}
      </div>
    </div>
  )
}

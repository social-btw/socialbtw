import { useEffect, useState } from "react";
import Table from "../app/components/Table";
import { fetchAllCompetitions } from '@/util/wom-helper';

export default function Index({ competition, skills }) {
  const [scores, setScores] = useState(null);

  useEffect(() => {
    fetch('/api').then(response => response.json()).then(body => {
      setScores(body)
    })
  }, [])

  return (
    <Table scores={scores} title={competition} skills={skills} competition={competition} />
  )
}

export const getServerSideProps = async () => {
  const competition =  process.env.COMPETITION_NAME;
  const skills =  process.env.COMPETITION_SKILLS.split(',');

  return { props: { competition, skills } };
};

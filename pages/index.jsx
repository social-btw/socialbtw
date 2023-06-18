import Table from "../app/components/Table";
import { fetchAllCompetitions } from '@/util/wom-helper';

export default function Index({ scores, competition, skills }) {
  return (
    <Table scores={scores} title={competition} skills={skills} competition={competition} />
  )
}

export const getServerSideProps = async () => {
  const scores = await fetchAllCompetitions(25);
  const competition =  process.env.COMPETITION_NAME;
  const skills =  process.env.COMPETITION_SKILLS.split(',');


  return { props: { scores, competition, skills } };
};

import { useRouter } from 'next/router';
import { getCompetition } from '@/util/wom-helper';

import Table from '@/app/components/Table';

export default function Page({ scores, skills, competition }) {
  const router = useRouter();

  return <Table scores={scores} title={router.query.skill} skills={skills} competition={competition} />;
}

export const getServerSideProps = async (context) => {
  const skills =  process.env.COMPETITION_SKILLS.split(',');
  const competition =  process.env.COMPETITION_NAME;
  
  const { skill } = context.query;
  const competitionId = process.env[skill.toUpperCase()].split(',')[0];

  if (competitionId == null) {
    return { props: { scores: [] } }
  }

  const res = await getCompetition(competitionId, 10);

  return { props: { scores: res, skills: skills, competition: competition } };
};

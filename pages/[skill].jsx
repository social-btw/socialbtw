import { useRouter } from 'next/router';
import { getCompetition } from '@/util/wom-helper';

import Table from '@/app/components/Table';

export default function Page({ scores }) {
  const router = useRouter();

  return <Table scores={scores} title={router.query.skill} />;
}

export const getServerSideProps = async (context) => {
  const { skill } = context.query;
  const competitionId = process.env[skill.toUpperCase()];

  if (competitionId == null) {
    return { props: { scores: [] } }
  }

  const res = await getCompetition(competitionId, 10);

  return { props: { scores: res } };
};

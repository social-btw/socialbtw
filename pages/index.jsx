import Table from "../app/components/Table";
import { fetchAllCompetitions } from '@/util/wom-helper';

export default function Index({ scores }) {
  return (
    <Table scores={scores} title={'Utility'} />
  )
}

export const getServerSideProps = async () => {
  const scores = await fetchAllCompetitions(25);

  return { props: { scores: scores } };
};

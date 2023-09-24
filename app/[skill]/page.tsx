import Table from'@/components/table';
import { PlayerScore } from '@/lib/types';
import { getCompetition } from '@/lib/wom';

export default async function Page({ params }: { params: { skill: string } }) {
  const compEnvVar = process.env[`NEXT_PUBLIC_${params.skill.toUpperCase()}`]

  if (compEnvVar == null) {
    return []
  }

  const competitionId = compEnvVar.split(',')[0];
  const scores: PlayerScore[] = await getCompetition(parseInt(competitionId), 10);

  if (!scores) {
    return <p>Hmm... an error occurred while fetching competition data</p>;
  }

  return <Table scores={scores} title={params.skill} />;
}

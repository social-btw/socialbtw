import Table from '@/components/table';
import { PlayerScore } from '@/lib/types';
import { getCompetition } from '@/lib/wom';

export default async function Page({ params }: { params: { skill: string } }) {
  const competitionId = process.env[`NEXT_PUBLIC_${params.skill.toUpperCase()}`]!.split(',')[0];

  if (competitionId == null) {
    return []
  }

  const scores: PlayerScore[] = await getCompetition(parseInt(competitionId), 10);

  return <Table scores={scores} title={params.skill} />;
}

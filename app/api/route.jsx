import { NextResponse } from 'next/server'
import { fetchAllCompetitions } from '@/util/wom-helper';
 
export async function GET() {
  const scores = await fetchAllCompetitions(25);

  return NextResponse.json(scores)
}

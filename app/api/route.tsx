import { NextResponse } from 'next/server'
import { fetchAllCompetitions } from '@/lib/wom';

export const dynamic = 'force-dynamic'
 
export async function GET() {
  try {
    const scores = await fetchAllCompetitions(25);
    
    return NextResponse.json(scores);
  } catch (error) {
    console.error("Error fetching scores: ", error);
    return NextResponse.json({ error: 'An error occurred while fetching scores.' }, { status: 500 })
  }
}

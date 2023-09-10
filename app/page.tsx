"use client"
import { useEffect, useState } from 'react';
import Table from '@/components/table';

export default function Home() {
  const [scores, setScores] = useState(null);
  const competition = process.env.NEXT_PUBLIC_COMPETITION_NAME!

  useEffect(() => {
    fetch('/api').then(response => response.json()).then(body => {
      setScores(body)
    })
  }, [])

  return (
    <Table scores={scores} title={competition} />
  )
}

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.text();
  console.log('Selcom webhook received:', body);
  return NextResponse.json({ status: 'received' });
}

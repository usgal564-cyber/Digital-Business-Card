import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // login логик
  return NextResponse.json({ message: "Login endpoint" });
}
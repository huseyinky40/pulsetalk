// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import bcrypt from 'bcryptjs';

function parseBirthDate(raw: unknown): Date | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Desteklenen format: GG/AA/YYYY
  const slashMatch = trimmed.match(/^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/);
  if (slashMatch) {
    const day = Number(slashMatch[1]);
    const month = Number(slashMatch[2]);
    const year = Number(slashMatch[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
      return null;
    }
    return date;
  }

  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');
  const email = searchParams.get('email');

  if (username) {
    const u = await prisma.user.findUnique({
      where: { username },
      select: { id:true, username:true, email:true, birth:true, createdAt:true, updatedAt:true }
    });
    return NextResponse.json(u ?? null);
  }

  if (email) {
    const u = await prisma.user.findUnique({
      where: { email },
      select: { id:true, username:true, email:true, birth:true, createdAt:true, updatedAt:true }
    });
    return NextResponse.json(u ?? null);
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id:true, username:true, email:true, birth:true, createdAt:true, updatedAt:true }
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const { username, email, password, birth } = await req.json();

  if (!username || !email || !password || !birth) {
    return NextResponse.json({ error: 'Eksik alanlar var' }, { status: 400 });
  }

  const birthDate = parseBirthDate(birth);
  if (!birthDate) {
    return NextResponse.json({ error: 'Geçersiz doğum tarihi' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      birth: birthDate,
    },
    select: { id:true, username:true, email:true, birth:true, createdAt:true }
  });

  return NextResponse.json(user, { status: 201 });
}

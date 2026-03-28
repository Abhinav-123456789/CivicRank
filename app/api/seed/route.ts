export const dynamic = "force-static";

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { seedIssuesData } from '@/lib/seedIssues';

const dataFile = path.join(process.cwd(), 'local-db.json');

const readData = () => {
  if (!fs.existsSync(dataFile)) {
    const defaultData = { issues: [], users: [] };
    fs.writeFileSync(dataFile, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
};

const writeData = (data: any) => {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
};

export async function POST(req: Request) {
  try {
    // Optional: Add authentication check here for security
    // const authHeader = req.headers.get('authorization');
    // if (!authHeader?.includes('admin-token')) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const data = readData();

    // Check if database already has seed data to prevent duplicates
    if (data.issues.length > 0) {
      return NextResponse.json({
        success: false,
        reason: 'Database already seeded',
        existingIssueCount: data.issues.length,
      });
    }

    // Add all seed issues to the database
    const addedIssues = seedIssuesData.map((issue) => ({
      ...issue,
      id: Math.random().toString(36).substring(2, 15),
      createdAt: new Date().toISOString(),
      createdBy: 'seed-admin', // Indicate these are seed data
      cluster: 'Main District',
    }));

    data.issues.push(...addedIssues);
    writeData(data);

    return NextResponse.json({
      success: true,
      addedCount: addedIssues.length,
      message: `Successfully seeded ${addedIssues.length} civic issues`,
      issues: addedIssues,
    });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const data = readData();
  return NextResponse.json({
    totalIssues: data.issues.length,
    seedDataAvailable: seedIssuesData.length,
    isSeeded: data.issues.length > 0,
  });
}

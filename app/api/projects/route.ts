import { NextResponse } from 'next/server';
import executeQuery from '@/lib/db';

// GET: Fetch all projects
export async function GET() {
  try {
    const result = await executeQuery({
      query: 'SELECT * FROM projects ORDER BY created_at DESC',
      values: [],
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST: Add a new project
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, slug, type, project_url, tech_stack } = body;

    const result = await executeQuery({
      query: 'INSERT INTO projects (title, description, slug, type, project_url, tech_stack) VALUES (?, ?, ?, ?, ?, ?)',
      values: [title, description, slug, type, project_url, tech_stack],
    });

    return NextResponse.json({ message: 'Project created successfully', result });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

// DELETE: Remove a project by ID
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const result = await executeQuery({
      query: 'DELETE FROM projects WHERE id = ?',
      values: [id],
    });

    return NextResponse.json({ message: 'Project deleted', result });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
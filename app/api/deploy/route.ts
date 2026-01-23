import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import executeQuery from '@/lib/db';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const tech_stack = formData.get('tech_stack') as string;
    const description = formData.get('description') as string;
    const entryPoint = formData.get('entry_point') as string; // NEW: The specific file to launch
    
    // Get files and their relative paths (sent as a JSON string map)
    const files = formData.getAll('files') as File[];
    const pathsMap = JSON.parse(formData.get('paths') as string); 

    if (!title || !slug || files.length === 0 || !entryPoint) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const owner = process.env.GITHUB_OWNER!;
    const repo = process.env.GITHUB_REPO!;
    const branch = 'main'; 

    // 1. Get Base Commit
    const { data: refData } = await octokit.git.getRef({ owner, repo, ref: `heads/${branch}` });
    const latestCommitSha = refData.object.sha;

    // 2. Prepare GitHub Tree
    const treeArray = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const content = buffer.toString('base64');
      
      const { data: blobData } = await octokit.git.createBlob({
        owner, repo, content, encoding: 'base64'
      });

      // USE THE FULL RELATIVE PATH (e.g. "admin/css/style.css")
      // We stored this in pathsMap using the file.name + size or index as key, 
      // but simpler is to trust the index order if we match them carefully frontend side.
      // BETTER STRATEGY: Frontend sends paths matching the file index.
      const relativePath = pathsMap[file.name]; 

      const finalPath = `public/projects/${slug}/${relativePath}`; 

      treeArray.push({
        path: finalPath,
        mode: '100644',
        type: 'blob',
        sha: blobData.sha,
      });
    }

    // 3. Create Tree & Commit
    const { data: treeData } = await octokit.git.createTree({
      owner, repo, base_tree: latestCommitSha, tree: treeArray as any
    });

    const { data: commitData } = await octokit.git.createCommit({
      owner, repo, message: `Auto-deploy: ${title}`, tree: treeData.sha, parents: [latestCommitSha]
    });

    await octokit.git.updateRef({
      owner, repo, ref: `heads/${branch}`, sha: commitData.sha
    });

    // 4. Save to Database (With correct Entry Point)
    // The project_url will be "[slug]/[entry_point]"
    // e.g. "my-app/admin/index.html"
    const dbUrl = `${slug}/${entryPoint}`;

    await executeQuery({
      query: 'INSERT INTO projects (title, description, slug, type, project_url, tech_stack) VALUES (?, ?, ?, ?, ?, ?)',
      values: [title, description, slug, 'static', dbUrl, tech_stack],
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Deploy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
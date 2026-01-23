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
    const entryPoint = formData.get('entry_point') as string;
    
    // Parse paths and files
    const paths = JSON.parse(formData.get('paths') as string); 
    const files = formData.getAll('files') as File[];

    if (!title || !slug || files.length === 0 || !entryPoint) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const owner = process.env.GITHUB_OWNER!;
    const repo = process.env.GITHUB_REPO!;
    const branch = 'main'; 

    // 1. GitHub Operations
    const { data: refData } = await octokit.git.getRef({ owner, repo, ref: `heads/${branch}` });
    const latestCommitSha = refData.object.sha;

    const treeArray = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const relativePath = paths[i]; 

      const buffer = Buffer.from(await file.arrayBuffer());
      const content = buffer.toString('base64');
      
      const { data: blobData } = await octokit.git.createBlob({
        owner, repo, content, encoding: 'base64'
      });

      const finalPath = `public/projects/${slug}/${relativePath}`; 

      treeArray.push({
        path: finalPath,
        mode: '100644',
        type: 'blob',
        sha: blobData.sha,
      });
    }

    const { data: treeData } = await octokit.git.createTree({
      owner, repo, base_tree: latestCommitSha, tree: treeArray as any
    });

    const { data: commitData } = await octokit.git.createCommit({
      owner, repo, message: `Auto-deploy: ${title}`, tree: treeData.sha, parents: [latestCommitSha]
    });

    await octokit.git.updateRef({
      owner, repo, ref: `heads/${branch}`, sha: commitData.sha
    });

    // 2. Database Operation (SMART UPDATE)
    const dbUrl = `${slug}/${entryPoint}`;

    await executeQuery({
      query: `
        INSERT INTO projects (title, description, slug, type, project_url, tech_stack) 
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        title = VALUES(title),
        description = VALUES(description),
        project_url = VALUES(project_url),
        tech_stack = VALUES(tech_stack)
      `,
      values: [title, description, slug, 'static', dbUrl, tech_stack],
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Deploy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
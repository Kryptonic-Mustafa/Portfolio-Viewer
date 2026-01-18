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
    const files = formData.getAll('files') as File[];

    if (!title || !slug || files.length === 0) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const owner = process.env.GITHUB_OWNER!;
    const repo = process.env.GITHUB_REPO!;
    const branch = 'main'; 

    // 1. Get the latest commit SHA to base our update on
    const { data: refData } = await octokit.git.getRef({ owner, repo, ref: `heads/${branch}` });
    const latestCommitSha = refData.object.sha;

    // 2. Prepare files for GitHub
    const treeArray = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const content = buffer.toString('base64');
      
      const { data: blobData } = await octokit.git.createBlob({
        owner, repo, content, encoding: 'base64'
      });

      // Files will be saved to: public/projects/[slug]/[filename]
      const path = `public/projects/${slug}/${file.name}`; 

      treeArray.push({
        path,
        mode: '100644',
        type: 'blob',
        sha: blobData.sha,
      });
    }

    // 3. Create Tree
    const { data: treeData } = await octokit.git.createTree({
      owner, repo, base_tree: latestCommitSha, tree: treeArray as any
    });

    // 4. Create Commit
    const { data: commitData } = await octokit.git.createCommit({
      owner, repo, message: `Auto-deploy project: ${title}`, tree: treeData.sha, parents: [latestCommitSha]
    });

    // 5. Push (Update Reference)
    await octokit.git.updateRef({
      owner, repo, ref: `heads/${branch}`, sha: commitData.sha
    });

    // 6. Save to Database
    await executeQuery({
      query: 'INSERT INTO projects (title, description, slug, type, project_url, tech_stack) VALUES (?, ?, ?, ?, ?, ?)',
      values: [title, description, slug, 'static', slug, tech_stack],
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Deploy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
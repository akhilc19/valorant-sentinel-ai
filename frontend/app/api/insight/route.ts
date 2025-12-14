import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { match_id, username, tag } = body;

  if (!match_id) {
    return NextResponse.json({ error: 'Match ID is required' }, { status: 400 });
  }

  // Validate required environment variables
  const kestraUrl = process.env.KESTRA_URL;
  const kestraUser = process.env.KESTRA_USER;
  const kestraPass = process.env.KESTRA_PASSWORD;

  if (!kestraUrl || !kestraUser || !kestraPass) {
    return NextResponse.json(
      { error: 'Missing required Kestra configuration' },
      { status: 500 }
    );
  }

  const auth = Buffer.from(`${kestraUser}:${kestraPass}`).toString('base64');
  const executionUrl = `${kestraUrl}/api/v1/executions/valorant/match_insight`;

  try {
    const formData = new FormData();
    formData.append('match_id', match_id);
    if (username) formData.append('username', username);
    if (tag) formData.append('tag', tag);

    const triggerRes = await fetch(`${executionUrl}?wait=true`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
      body: formData,
    });

    if (!triggerRes.ok) {
      const txt = await triggerRes.text();
      return NextResponse.json({ error: 'Failed to trigger workflow' }, { status: triggerRes.status });
    }

    const execution = await triggerRes.json();

    if (execution.state.current !== 'SUCCESS') {
      return NextResponse.json({ error: 'Workflow failed', details: execution.state }, { status: 500 });
    }

    const taskRun = execution.taskRunList.find((tr: any) => tr.taskId === 'analyze_match');
    if (!taskRun) {
      return NextResponse.json({ error: 'Analysis task not found' }, { status: 500 });
    }

    const outputUri = taskRun.outputs?.outputFiles?.['output.json'];

    if (!outputUri) {
      console.error('Task Outputs:', taskRun.outputs);
      return NextResponse.json({ error: 'No output.json generated', outputs: taskRun.outputs }, { status: 500 });
    }

    const fileRes = await fetch(`${kestraUrl}/api/v1/executions/${execution.id}/file?path=${encodeURIComponent(outputUri)}`, {
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });

    if (!fileRes.ok) {
      return NextResponse.json({ error: 'Failed to read output file' }, { status: 500 });
    }

    const jsonText = await fileRes.text();
    try {
      const data = JSON.parse(jsonText);
      return NextResponse.json(data);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON output' }, { status: 500 });
    }

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

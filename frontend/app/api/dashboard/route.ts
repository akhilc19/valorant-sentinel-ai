import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { username, tag, region } = await request.json();

  if (!username || !tag) {
    return NextResponse.json({ error: 'Username and tag are required' }, { status: 400 });
  }

  const kestraUrl = process.env.KESTRA_URL;
  const kestraUser = process.env.KESTRA_USER;
  const kestraPass = process.env.KESTRA_PASSWORD;
  const auth = Buffer.from(`${kestraUser}:${kestraPass}`).toString('base64');

  try {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('tag', tag);
    formData.append('region', region || 'ap');

    console.log('[Dashboard API] Triggering flow with:', { username, tag, region: region || 'ap' });

    const triggerRes = await fetch(`${kestraUrl}/api/v1/executions/valorant/dashboard?wait=true`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
      body: formData,
    });

    if (!triggerRes.ok) {
      const txt = await triggerRes.text();
      console.error('Kestra Error:', txt);
      return NextResponse.json({ error: 'Failed to trigger workflow' }, { status: triggerRes.status });
    }

    const execution = await triggerRes.json();

    if (execution.state.current !== 'SUCCESS') {
      return NextResponse.json({ error: 'Workflow failed', details: execution.state }, { status: 500 });
    }

    const taskRun = execution.taskRunList.find((tr: any) => tr.taskId === 'process_dashboard');

    if (!taskRun) {
      return NextResponse.json({ error: 'Processing task not found' }, { status: 500 });
    }

    // Look for output.json in the outputs map
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
      return NextResponse.json({ error: 'Invalid JSON output from script', raw: jsonText }, { status: 500 });
    }

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

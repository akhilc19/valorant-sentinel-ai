import { NextResponse } from 'next/server';

/**
 * Handle a POST request that triggers a Kestra `valorant/match_insight` execution and returns its analysis output.
 *
 * The request body must be JSON and include `match_id` (required). It may include `username` and `tag` (optional).
 *
 * @param request - Incoming Request whose JSON body contains `{ match_id, username?, tag? }`
 * @returns The HTTP JSON response: on success the parsed analysis output from `output.json`; on error an object with an `error` message and, when applicable, `details` or `outputs` to aid debugging.
export async function POST(request: Request) {
  const body = await request.json();
  const { match_id, username, tag } = body;

  if (!match_id) {
    return NextResponse.json({ error: 'Match ID is required' }, { status: 400 });
  }

  // Trigger Kestra execution
  const kestraUrl = `${process.env.KESTRA_API_URL || 'http://localhost:8080'}`;
  const kestraUser = process.env.KESTRA_USER || 'admin';
  const kestraPass = process.env.KESTRA_PASSWORD || 'admin';
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
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { match_id, player_name, agent_mode, manual_agent } = await request.json();

  if (!match_id) {
    return NextResponse.json({ error: 'Match ID is required' }, { status: 400 });
  }

  const kestraUrl = process.env.KESTRA_URL;
  // Force HMR refresh
  const kestraUser = process.env.KESTRA_USER;
  const kestraPass = process.env.KESTRA_PASSWORD;
  const auth = Buffer.from(`${kestraUser}:${kestraPass}`).toString('base64');

  try {
    const formData = new FormData();
    formData.append('match_id', match_id);
    formData.append('player_name', player_name || '');
    formData.append('agent_mode', agent_mode || 'autonomous');
    if (manual_agent) formData.append('manual_agent', manual_agent);

    // Trigger flow and wait
    const triggerRes = await fetch(`${kestraUrl}/api/v1/executions/valorant/ai_match_analysis_v3?wait=true`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
      body: formData,
    });

    if (!triggerRes.ok) {
      const txt = await triggerRes.text();
      try {
        const jsonError = JSON.parse(txt);
        return NextResponse.json({ error: jsonError.message || 'Failed to trigger workflow' }, { status: triggerRes.status });
      } catch (e) {
        return NextResponse.json({ error: 'Failed to trigger workflow' }, { status: triggerRes.status });
      }
    }

    const execution = await triggerRes.json();

    if (execution.state.current !== 'SUCCESS') {
      return NextResponse.json({ error: 'Workflow failed', details: execution.state }, { status: 500 });
    }

    // Find the task that generates the output
    // We expect an output file 'analysis.json' containing { "text": "..." }
    // Or we find a specific task output.

    // Let's assume the flow outputs a file named 'analysis.json'
    const taskRun = execution.taskRunList.find((tr: any) => tr.taskId === 'generate_insight');
    if (!taskRun) {
      return NextResponse.json({ error: 'Analysis task not found' }, { status: 500 });
    }

    const outputUri = taskRun.outputs?.outputFiles?.['analysis.json'];

    if (!outputUri) {
      // Fallback: check if the task output itself has 'choices' (Plugin behavior)
      if (taskRun.outputs?.choices && taskRun.outputs?.choices?.length > 0) {
        const text = taskRun.outputs.choices[0].message.content;
        return NextResponse.json({ text });
      }

      console.error('Task Outputs:', taskRun.outputs);
      return NextResponse.json({ error: 'No analysis generated', outputs: taskRun.outputs }, { status: 500 });
    }

    // Fetch the file
    const fileRes = await fetch(`${kestraUrl}/api/v1/executions/${execution.id}/file?path=${encodeURIComponent(outputUri)}`, {
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });

    if (!fileRes.ok) {
      return NextResponse.json({ error: 'Failed to read analysis output' }, { status: 500 });
    }

    const jsonText = await fileRes.text();
    try {
      const data = JSON.parse(jsonText); // Expected { text: "Markdwon..." }
      return NextResponse.json(data);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON output' }, { status: 500 });
    }

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

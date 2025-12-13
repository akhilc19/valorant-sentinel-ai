
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { message, context, history } = await request.json();

  const kestraUrl = process.env.KESTRA_URL;
  const kestraUser = process.env.KESTRA_USER;
  const kestraPass = process.env.KESTRA_PASSWORD;
  const auth = Buffer.from(`${kestraUser}:${kestraPass}`).toString('base64');

  try {
    const formData = new FormData();
    // Inject formatting instruction
    const systemInstruction = " (Respond using bullet points or lists. DO NOT use Markdown Tables.)";
    formData.append('message', message + systemInstruction);
    formData.append('context', JSON.stringify(context));
    formData.append('history', JSON.stringify(history));

    // Trigger flow and wait
    const triggerRes = await fetch(`${kestraUrl}/api/v1/executions/valorant/ai_chat?wait=true`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
      body: formData,
    });

    if (!triggerRes.ok) throw new Error('Failed to contact AI Coach.');

    const execution = await triggerRes.json();

    // Find output
    const taskRun = execution.taskRunList.find((tr: any) => tr.taskId === 'generate_reply');
    const outputUri = taskRun?.outputs?.outputFiles?.['reply.json'];

    if (!outputUri) throw new Error('No reply generated.');

    // Fetch file
    const fileRes = await fetch(`${kestraUrl}/api/v1/executions/${execution.id}/file?path=${encodeURIComponent(outputUri)}`, {
      headers: { 'Authorization': `Basic ${auth}` },
    });

    const data = await fileRes.json();
    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

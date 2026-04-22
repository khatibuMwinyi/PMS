import { NextResponse } from 'next/server';
import { prisma } from '@/core/database/client';

interface SSEMessage {
  type: 'assignment' | 'task' | 'countdown';
  data: any;
  timestamp: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const providerId = searchParams.get('providerId');

  if (!providerId) {
    return new NextResponse('Provider ID required', { status: 400 });
  }

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      let keepAliveInterval: NodeJS.Timeout;

      // Send initial data
      const initialAssignments = await prisma.assignment.findMany({
        where: {
          providerId: providerId,
          status: 'PENDING_ACCEPTANCE',
          expiresAt: { gt: new Date() },
        },
        include: {
          serviceType: { select: { name: true } },
          property: { select: { zone: true, latitude: true, longitude: true } },
        },
      });

      controller.enqueue(`data: ${JSON.stringify({
        type: 'initial',
        assignments: initialAssignments,
        timestamp: new Date().toISOString(),
      })}\n\n`);

      // Set up keep-alive ping
      keepAliveInterval = setInterval(() => {
        controller.enqueue(`data: ${JSON.stringify({
          type: 'ping',
          timestamp: new Date().toISOString(),
        })}\n\n`);
      }, 30000);

      // Listen for database changes using pg-boss events
      // This would typically be implemented with a database subscription
      // For now, we'll simulate with periodic updates

      const updateInterval = setInterval(async () => {
        const currentAssignments = await prisma.assignment.findMany({
          where: {
            providerId: providerId,
            status: 'PENDING_ACCEPTANCE',
            expiresAt: { gt: new Date() },
          },
          include: {
            serviceType: { select: { name: true } },
            property: { select: { zone: true, latitude: true, longitude: true } },
          },
        });

        // Send updates only if assignments changed
        if (JSON.stringify(currentAssignments) !== JSON.stringify(initialAssignments)) {
          controller.enqueue(`data: ${JSON.stringify({
            type: 'update',
            assignments: currentAssignments,
            timestamp: new Date().toISOString(),
          })}\n\n`);
        }
      }, 5000);

      // Cleanup on connection close
      request.signal.addEventListener('abort', () => {
        clearInterval(keepAliveInterval);
        clearInterval(updateInterval);
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
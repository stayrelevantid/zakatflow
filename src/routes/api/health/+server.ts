import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Health check endpoint for Kubernetes probes
export const GET: RequestHandler = async () => {
	const health = {
		status: 'healthy',
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		version: '1.1.0',
		environment: process.env.NODE_ENV || 'development'
	};

	return json(health, { status: 200 });
};

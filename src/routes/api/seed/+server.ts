import { seedDatabase, clearDatabase } from '$lib/server/seed';

export async function POST({ url }: { url: URL }) {
	const clear = url.searchParams.get('clear') === 'true';
	
	try {
		if (clear) {
			await clearDatabase();
			return new Response(JSON.stringify({ success: true, message: 'Database cleared' }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			});
		}
		
		await seedDatabase();
		return new Response(JSON.stringify({ success: true, message: 'Database seeded successfully' }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('Seed error:', error);
		return new Response(JSON.stringify({ 
			success: false, 
			error: error instanceof Error ? error.message : 'Unknown error' 
		}), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { supabase, TABLES } from '$lib/supabase';
import type { HeartRateReading } from '$lib/types/health';
import type { ApiResponse } from '$lib/types/checkin';

function transformFromDatabase(record: Record<string, unknown>): HeartRateReading {
	return {
		id: String(record.id || ''),
		bpm: Number(record.bpm || 0),
		measuredAt: String(record.measured_at || ''),
		source: record.source ? String(record.source) : undefined,
		createdAt: record.created_at ? String(record.created_at) : undefined
	};
}

function getBearerToken(request: Request): string {
	const authorization = request.headers.get('authorization') || '';
	if (authorization.toLowerCase().startsWith('bearer ')) {
		return authorization.slice(7).trim();
	}

	return request.headers.get('x-heart-rate-token') || '';
}

function parseBpm(value: unknown): number {
	if (typeof value === 'number') return value;
	if (typeof value === 'string') {
		const match = value.match(/\d+(?:\.\d+)?/);
		return match ? Number(match[0]) : Number.NaN;
	}

	return Number.NaN;
}

function parseMeasuredAt(value: unknown): Date {
	if (typeof value !== 'string' || !value) return new Date();

	const measuredAt = new Date(value);
	return Number.isNaN(measuredAt.getTime()) ? new Date() : measuredAt;
}

async function saveHeartRateReading(input: {
	bpm: unknown;
	measuredAt?: unknown;
	source?: unknown;
}): Promise<HeartRateReading> {
	const bpm = parseBpm(input.bpm);
	if (!Number.isFinite(bpm) || bpm < 30 || bpm > 240) {
		throw new Error('心率 bpm 必须是 30 到 240 之间的数字');
	}

	const measuredAt = parseMeasuredAt(input.measuredAt);
	const source =
		typeof input.source === 'string' ? input.source.slice(0, 64) : 'apple-health-shortcuts';

	const { data, error } = await supabase
		.from(TABLES.HEART_RATE)
		.insert({
			bpm: Math.round(bpm),
			measured_at: measuredAt.toISOString(),
			source
		})
		.select()
		.single();

	if (error) {
		throw error;
	}

	return transformFromDatabase(data);
}

export const GET: RequestHandler = async ({ request, url }) => {
	try {
		const bpmFromUrl = url.searchParams.get('bpm') || url.searchParams.get('bmp');
		if (bpmFromUrl) {
			const configuredToken = env.HEART_RATE_WRITE_TOKEN;
			const token = url.searchParams.get('token') || getBearerToken(request);

			if (!configuredToken || token !== configuredToken) {
				return json(
					{
						success: false,
						error: '无权写入心率数据'
					} satisfies ApiResponse,
					{ status: 401 }
				);
			}

			const reading = await saveHeartRateReading({
				bpm: bpmFromUrl,
				measuredAt: url.searchParams.get('measuredAt'),
				source: url.searchParams.get('source')
			});

			return json({
				success: true,
				data: reading,
				message: '心率数据已保存'
			} satisfies ApiResponse<HeartRateReading>);
		}

		const { data, error } = await supabase
			.from(TABLES.HEART_RATE)
			.select('*')
			.order('measured_at', { ascending: false })
			.order('created_at', { ascending: false })
			.limit(1)
			.maybeSingle();

		if (error) {
			throw error;
		}

		const response: ApiResponse<HeartRateReading | null> = {
			success: true,
			data: data ? transformFromDatabase(data) : null
		};

		return json(response);
	} catch (error) {
		console.error('❌ 获取心率数据失败:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : '获取心率数据失败'
			} satisfies ApiResponse,
			{ status: 500 }
		);
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const configuredToken = env.HEART_RATE_WRITE_TOKEN;
		const headerToken = getBearerToken(request);
		const body = await request.json();
		const bodyToken = typeof body.token === 'string' ? body.token : '';

		if (!configuredToken || (headerToken !== configuredToken && bodyToken !== configuredToken)) {
			return json(
				{
					success: false,
					error: '无权写入心率数据'
				} satisfies ApiResponse,
				{ status: 401 }
			);
		}

		const reading = await saveHeartRateReading({
			bpm: body.bpm ?? body.bmp,
			measuredAt: body.measuredAt,
			source: body.source
		});

		return json({
			success: true,
			data: reading,
			message: '心率数据已保存'
		} satisfies ApiResponse<HeartRateReading>);
	} catch (error) {
		console.error('❌ 保存心率数据失败:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : '保存心率数据失败'
			} satisfies ApiResponse,
			{ status: 500 }
		);
	}
};

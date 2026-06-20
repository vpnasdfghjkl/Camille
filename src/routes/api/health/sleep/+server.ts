import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { supabase, TABLES } from '$lib/supabase';
import type { ApiResponse } from '$lib/types/checkin';
import type { SleepReading } from '$lib/types/health';

function transformFromDatabase(record: Record<string, unknown>): SleepReading {
	return {
		id: String(record.id || ''),
		durationMinutes: Number(record.duration_minutes || 0),
		startAt: record.start_at ? String(record.start_at) : undefined,
		endAt: record.end_at ? String(record.end_at) : undefined,
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

	return request.headers.get('x-health-token') || request.headers.get('x-heart-rate-token') || '';
}

function getConfiguredToken(): string | undefined {
	return env.HEALTH_WRITE_TOKEN || env.HEART_RATE_WRITE_TOKEN;
}

function parseNumber(value: unknown): number {
	if (typeof value === 'number') return value;
	if (typeof value === 'string') {
		const match = value.match(/\d+(?:\.\d+)?/);
		return match ? Number(match[0]) : Number.NaN;
	}

	return Number.NaN;
}

function parseDate(value: unknown): Date | null {
	if (typeof value !== 'string' || !value) return null;

	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

function parseDurationMinutes(input: {
	durationMinutes?: unknown;
	minutes?: unknown;
	hours?: unknown;
	startAt?: unknown;
	endAt?: unknown;
}): number {
	const explicitMinutes = parseNumber(input.durationMinutes ?? input.minutes);
	if (Number.isFinite(explicitMinutes)) return explicitMinutes;

	const hours = parseNumber(input.hours);
	if (Number.isFinite(hours)) return hours * 60;

	const startAt = parseDate(input.startAt);
	const endAt = parseDate(input.endAt);
	if (startAt && endAt) {
		return (endAt.getTime() - startAt.getTime()) / 60000;
	}

	return Number.NaN;
}

async function saveSleepReading(input: {
	durationMinutes?: unknown;
	minutes?: unknown;
	hours?: unknown;
	startAt?: unknown;
	endAt?: unknown;
	measuredAt?: unknown;
	source?: unknown;
}): Promise<SleepReading> {
	const durationMinutes = parseDurationMinutes(input);

	if (!Number.isFinite(durationMinutes) || durationMinutes <= 0 || durationMinutes > 24 * 60) {
		throw new Error('睡眠时长必须是 1 到 1440 分钟之间的数字');
	}

	const startAt = parseDate(input.startAt);
	const endAt = parseDate(input.endAt);
	const measuredAt = parseDate(input.measuredAt) || endAt || new Date();
	const source =
		typeof input.source === 'string' ? input.source.slice(0, 64) : 'apple-health-shortcuts';

	const { data, error } = await supabase
		.from(TABLES.SLEEP)
		.insert({
			duration_minutes: Math.round(durationMinutes),
			start_at: startAt?.toISOString() || null,
			end_at: endAt?.toISOString() || null,
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
		const durationFromUrl =
			url.searchParams.get('durationMinutes') || url.searchParams.get('minutes');
		const hoursFromUrl = url.searchParams.get('hours');
		const startAtFromUrl = url.searchParams.get('startAt');
		const endAtFromUrl = url.searchParams.get('endAt');

		if (durationFromUrl || hoursFromUrl || (startAtFromUrl && endAtFromUrl)) {
			const configuredToken = getConfiguredToken();
			const token = url.searchParams.get('token') || getBearerToken(request);

			if (!configuredToken || token !== configuredToken) {
				return json(
					{
						success: false,
						error: '无权写入睡眠数据'
					} satisfies ApiResponse,
					{ status: 401 }
				);
			}

			const reading = await saveSleepReading({
				durationMinutes: durationFromUrl,
				hours: hoursFromUrl,
				startAt: startAtFromUrl,
				endAt: endAtFromUrl,
				measuredAt: url.searchParams.get('measuredAt'),
				source: url.searchParams.get('source')
			});

			return json({
				success: true,
				data: reading,
				message: '睡眠数据已保存'
			} satisfies ApiResponse<SleepReading>);
		}

		const { data, error } = await supabase
			.from(TABLES.SLEEP)
			.select('*')
			.order('measured_at', { ascending: false })
			.order('created_at', { ascending: false })
			.limit(1)
			.maybeSingle();

		if (error) {
			throw error;
		}

		return json({
			success: true,
			data: data ? transformFromDatabase(data) : null
		} satisfies ApiResponse<SleepReading | null>);
	} catch (error) {
		console.error('❌ 获取睡眠数据失败:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : '获取睡眠数据失败'
			} satisfies ApiResponse,
			{ status: 500 }
		);
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const configuredToken = getConfiguredToken();
		const headerToken = getBearerToken(request);
		const body = await request.json();
		const bodyToken = typeof body.token === 'string' ? body.token : '';

		if (!configuredToken || (headerToken !== configuredToken && bodyToken !== configuredToken)) {
			return json(
				{
					success: false,
					error: '无权写入睡眠数据'
				} satisfies ApiResponse,
				{ status: 401 }
			);
		}

		const reading = await saveSleepReading({
			durationMinutes: body.durationMinutes,
			minutes: body.minutes,
			hours: body.hours,
			startAt: body.startAt,
			endAt: body.endAt,
			measuredAt: body.measuredAt,
			source: body.source
		});

		return json({
			success: true,
			data: reading,
			message: '睡眠数据已保存'
		} satisfies ApiResponse<SleepReading>);
	} catch (error) {
		console.error('❌ 保存睡眠数据失败:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : '保存睡眠数据失败'
			} satisfies ApiResponse,
			{ status: 500 }
		);
	}
};

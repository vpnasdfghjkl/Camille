export interface HeartRateReading {
	id?: string;
	bpm: number;
	measuredAt: string;
	source?: string;
	createdAt?: string;
}

export interface SleepReading {
	id?: string;
	durationMinutes: number;
	startAt?: string;
	endAt?: string;
	measuredAt: string;
	source?: string;
	createdAt?: string;
}

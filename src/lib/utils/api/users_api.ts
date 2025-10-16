// API Calls for users
const API_BASE = '/api/users';
import type { User as PrismaUser } from '@prisma/client';
import { logTrace } from '../debug/logtrace';

const USER_API = {
	async get(id: string): Promise<{ success: boolean }> {
		logTrace('get');
		const res = await fetch(API_BASE, { method: 'GET', body: id });
		return await res.json();
	}
};

export default USER_API;

// API Calls for users
const API_BASE = '/api/users';
import type { User as PrismaUser } from '@prisma/client';
import { logTrace } from '../debug/logtrace';

const USER_API = {
	async get(): Promise<{ success: true; users: [{ id: string; name: string }] }> {
		logTrace('get');
		const res = await fetch(API_BASE, { method: 'GET' });
		return await res.json();
	},

	async getByID(id: string): Promise<{ success: true; user: { id: string; name: string } }> {
		const res = await this.get();
		const allUsers = res.users;
		const user = allUsers.find((u) => u.id === id);
		if (!user) throw new Error('User not found');
		return { success: true, user: { id: user.id, name: user.name } };
	}
};

export default USER_API;

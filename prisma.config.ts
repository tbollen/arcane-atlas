// Make sure to load the .env file for environment variables
import 'dotenv/config';

export default {
	// This is where you define your database connection.
	schema: './prisma/schema/',
	migrations: './prisma/migrations/'
};

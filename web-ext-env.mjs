import dotenv from 'dotenv';

const { parsed } = dotenv.config();
export const env = { ...process.env, ...parsed };

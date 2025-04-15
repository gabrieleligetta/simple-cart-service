// test/setup.ts
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.test variables into process.env
dotenv.config({ path: resolve(__dirname, '.env.test') });

// You can add any other global initialization logic here.

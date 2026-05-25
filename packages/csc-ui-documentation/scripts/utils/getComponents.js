import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const directory = path.resolve(__dirname, '../../app/components/examples');

const components = fs.readdirSync(directory);

export default components;

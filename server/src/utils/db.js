import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = join(__dirname, '..', 'data');

const collectionPath = (name) => join(dataDir, `${name}.json`);

export const readCollection = async (name) => {
  try {
    const data = await fs.readFile(collectionPath(name), 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const writeCollection = (name, data) =>
  fs.writeFile(collectionPath(name), JSON.stringify(data, null, 2));
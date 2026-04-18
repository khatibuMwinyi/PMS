import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { nanoid } from 'nanoid';

/**
 * Generic image upload abstraction.
 * Currently saves to local public folder, but interface is provider-agnostic.
 */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  
  const filename = `${nanoid()}-${file.name.replaceAll(' ', '_')}`;
  const relativePath = `/uploads/${folder}/${filename}`;
  const absolutePath = join(process.cwd(), 'public', relativePath);

  try {
    await mkdir(join(process.cwd(), 'public', 'uploads', folder), { recursive: true });
    await writeFile(absolutePath, buffer);
    
    return relativePath;
  } catch (error) {
    throw new Error('Failed to upload image to storage');
  }
}
import { v2 as cloudinary } from 'cloudinary';
import { nanoid } from 'nanoid';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file: File, folder: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${nanoid()}-${file.name.replaceAll(' ', '_').replace(/\.[^.]+$/, '')}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `opsmp/${folder}`,
        public_id: filename,
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) {
          reject(new Error('Failed to upload image to Cloudinary'));
        } else {
          resolve(result.secure_url);
        }
      },
    );

    uploadStream.end(buffer);
  });
}

export async function uploadDataUrl(
  dataUrl: string,
  folder: string,
  publicId?: string,
): Promise<string> {
  const id = publicId ?? nanoid();

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      dataUrl,
      {
        folder: `opsmp/${folder}`,
        public_id: id,
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) {
          reject(new Error('Failed to upload image to Cloudinary'));
        } else {
          resolve(result.secure_url);
        }
      },
    );
  });
}

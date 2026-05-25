import { cloudinary } from '../config/cloudinary';
import { Readable } from 'stream';

export const uploadProfilePhoto = (buffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'local-job-hub/profile-photos',
        resource_type: 'image',
        // No eager transformation — upload fast, transform on-the-fly via URL
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Profile photo upload failed'));
          return;
        }
        // Return URL with on-the-fly transformation (no upload delay)
        const optimizedUrl = cloudinary.url(result.public_id, {
          width: 400,
          height: 400,
          crop: 'fill',
          gravity: 'face',
          quality: 'auto',
          fetch_format: 'auto',
          secure: true,
        });
        resolve(optimizedUrl);
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

export const isFileSizeLimitError = (err: unknown) => {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: string }).code === 'FST_REQ_FILE_TOO_LARGE'
  );
};

import { cloudinary } from '../config/cloudinary';

export const uploadProfilePhoto = (buffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'local-job-hub/profile-photos', resource_type: 'image' },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Profile photo upload failed'));
          return;
        }

        resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
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

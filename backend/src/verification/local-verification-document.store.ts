import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { UploadedVerificationFile } from './verification-upload.types';

const LOCAL_VERIFICATION_PREFIX = 'local-verification/';

type LocalVerificationDocument = {
  buffer: Buffer;
  contentType: string;
  originalName: string;
  createdAt: Date;
};

const localVerificationDocuments = new Map<string, LocalVerificationDocument>();

export function storeLocalVerificationDocument(
  restaurantId: number,
  documentType: string,
  file: UploadedVerificationFile,
) {
  const extension = extname(file.originalname).toLowerCase();
  const key = `${LOCAL_VERIFICATION_PREFIX}${restaurantId}/${documentType}/${randomUUID()}${extension}`;

  localVerificationDocuments.set(key, {
    buffer: file.buffer,
    contentType: file.mimetype,
    originalName: file.originalname,
    createdAt: new Date(),
  });

  return {
    key,
    url: `https://tabelink.local/verification-documents/${encodeURIComponent(key)}`,
  };
}

export function isLocalVerificationDocumentKey(value: string | null | undefined) {
  return Boolean(value?.startsWith(LOCAL_VERIFICATION_PREFIX));
}

export function getLocalVerificationDocument(key: string) {
  return localVerificationDocuments.get(key);
}

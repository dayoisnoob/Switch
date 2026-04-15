import crypto from 'crypto';
export const workspaceSlugGen = (str: string) => {
  const slug = str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const hash = crypto.randomBytes(2).toString('hex');
  return `${slug}-${hash}`;
};

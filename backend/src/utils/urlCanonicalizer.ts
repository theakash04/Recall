import crypto from 'crypto';

type canonlizeReturnType = {
  canonical: string;
  hash: string;
}

function canonicalize(inputURL: string): canonlizeReturnType {
  const url = new URL(inputURL);

  const noises = ['utm_source', 'utm_medium', 'utm_campaign', 'ref'];
  noises.forEach(p => url.searchParams.delete(p));

  url.searchParams.sort();

  const canonical = url.toString();

  const hash = crypto.createHash('sha256').update(canonical).digest('hex')

  return {
    canonical, hash
  }
}

export default canonicalize;

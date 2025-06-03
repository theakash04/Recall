import axios from 'axios';

async function isUrlScrapable(url: string): Promise<boolean> {
  try {
    const response = await axios.head(url, { timeout: 5000 });
    return response.status === 200 && response.headers['content-type']?.includes('text/html');
  } catch (error) {
    return false;
  }
}


export default isUrlScrapable;

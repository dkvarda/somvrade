import mocks from './mocks';

export default function mock(url: string, options?: RequestInit) {
  const method = options?.method || 'GET';
  console.log('MOCK Req:', method, url);

  const mockObj = mocks.find(m => m.method === method && new RegExp(m.urlMath).test(url));

  if (!mockObj) {
    console.log('MOCK Res:', 'Mock not found');
    return Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ message: 'Mock not found' }),
    });
  }

  console.log('MOCK Res:', JSON.stringify(mockObj.response));

  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockObj.response),
  });
}

export abstract class BaseDataService {
  protected async loadData<T>(url: string, cache: Record<string, T>, language: string): Promise<T> {
    if (cache[language]) return cache[language];
    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (language !== 'pt') {
          const fallbackUrl = url.replace(`/data/${language}/`, '/data/pt/');
          const fallbackResponse = await fetch(fallbackUrl);
          if (fallbackResponse.ok) {
            const data = await fallbackResponse.json();
            cache[language] = data;
            return data;
          }
        }
        throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      cache[language] = data;
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

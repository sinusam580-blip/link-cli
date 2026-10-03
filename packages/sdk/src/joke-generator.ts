/**
 * Joke Generator - Fetches random jokes from an external API
 * Uses the JokeAPI (https://jokeapi.dev) for reliable joke delivery
 */

export interface Joke {
  id: number;
  type: 'single' | 'twopart';
  category: string;
  joke?: string;
  setup?: string;
  delivery?: string;
  flags: {
    nsfw: boolean;
    religious: boolean;
    political: boolean;
    racist: boolean;
    sexist: boolean;
    explicit: boolean;
  };
  safe: boolean;
}

export interface JokeOptions {
  categories?: string[];
  blacklistFlags?: string[];
  safe?: boolean;
  type?: 'single' | 'twopart' | 'any';
}

const JOKE_API_BASE = 'https://v2.jokeapi.dev/joke';
const AVAILABLE_CATEGORIES = [
  'General',
  'Programming',
  'Knock-Knock',
  'Dark',
  'Spooky',
  'Christmas',
];

/**
 * Fetches a random joke from the API
 * @param options Configuration for joke selection
 * @returns Promise resolving to a Joke object
 */
export async function getRandomJoke(options: JokeOptions = {}): Promise<Joke> {
  const {
    categories = ['General', 'Programming'],
    safe = true,
    type = 'any',
    blacklistFlags = [],
  } = options;

  // Validate categories
  const validCategories = categories.filter((cat) =>
    AVAILABLE_CATEGORIES.includes(cat)
  );
  const categoryString =
    validCategories.length > 0 ? validCategories.join(',') : 'General';

  // Build query parameters
  const params = new URLSearchParams();
  if (type !== 'any') {
    params.append('type', type);
  }
  if (safe) {
    params.append('safe-mode', '');
  }

  const url = `${JOKE_API_BASE}/${categoryString}?${params.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch joke: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as Joke | { error: boolean };

    if ('error' in data && data.error) {
      throw new Error('No jokes found matching the criteria');
    }

    return data as Joke;
  } catch (error) {
    throw new Error(
      `Joke API error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Fetches multiple random jokes
 * @param count Number of jokes to fetch (default: 3, max: 10)
 * @param options Configuration for joke selection
 * @returns Promise resolving to an array of Joke objects
 */
export async function getRandomJokes(
  count: number = 3,
  options: JokeOptions = {}
): Promise<Joke[]> {
  const safeCount = Math.min(Math.max(count, 1), 10);
  const jokes: Joke[] = [];

  for (let i = 0; i < safeCount; i++) {
    try {
      const joke = await getRandomJoke(options);
      jokes.push(joke);
      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to fetch joke ${i + 1}:`, error);
    }
  }

  return jokes;
}

/**
 * Formats a joke for display
 * @param joke The Joke object to format
 * @returns Formatted joke string
 */
export function formatJoke(joke: Joke): string {
  if (joke.type === 'single') {
    return joke.joke || 'No joke available';
  }

  if (joke.type === 'twopart') {
    return `${joke.setup}\n\n${joke.delivery}`;
  }

  return 'Unknown joke format';
}

/**
 * Gets a joke and returns it pre-formatted
 * @param options Configuration for joke selection
 * @returns Promise resolving to a formatted joke string
 */
export async function getFormattedJoke(
  options: JokeOptions = {}
): Promise<string> {
  const joke = await getRandomJoke(options);
  return formatJoke(joke);
}

/**
 * Lists all available joke categories
 * @returns Array of available categories
 */
export function getAvailableCategories(): string[] {
  return [...AVAILABLE_CATEGORIES];
}

import { put, list } from '@vercel/blob';

/**
 * Interface representing a post with its metadata
 */
interface Post {
	hook: string;
	content: string;
	hashtags: string[];
	topic: string;
	generatedAt: string;
}

/**
 * Interface representing the stored data structure
 */
interface PostsData {
	posts: Post[];
	lastUpdated: string;
}

/**
 * Saves new posts to Blob storage
 * @param newPosts - Array of new posts to save
 * @returns Promise containing the created file URL and updated data
 * @throws Error if saving fails
 */
export async function saveToBlobStorage(newPosts: Post[]) {
	try {
		// Retrieve existing data
		const existingData = await getLatestPosts();
		console.log({existingData})
		
		// Create updated data
		const updatedData: PostsData = {
			posts: [...existingData.posts, ...newPosts],
			lastUpdated: new Date().toISOString()
		};
		
		// Generate filename with current date
		const date = new Date().toISOString().split('T')[0];
		const filename = `posts-${date}.json`;
		
		// Save to Blob storage
		const { url } = await put(filename, JSON.stringify(updatedData, null, 2), {
			access: 'public',
			addRandomSuffix: false
		});
		
		return { url, data: updatedData };
	} catch (error) {
		console.error('Error saving to blob storage:', error);
		throw error;
	}
}

/**
 * Retrieves the most recent posts from Blob storage
 * @returns Promise containing the posts data
 * @throws Error if retrieval fails
 */
export async function getLatestPosts(): Promise<PostsData> {
	try {
		const { blobs } = await list();
		
		// If no blobs exist, return empty structure
		if (blobs.length === 0) {
			return { posts: [], lastUpdated: new Date().toISOString() };
		}
		
		// Find the most recent file
		const latestBlob = blobs
			.filter(blob => blob.pathname.startsWith('posts-'))
			.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())[0];
		
		if (!latestBlob) {
			return { posts: [], lastUpdated: new Date().toISOString() };
		}
		
		// Retrieve and parse data
		const response = await fetch(latestBlob.url);
		const text = await response.text();
		return JSON.parse(text);
	} catch (error) {
		console.error('Error getting posts from blob storage:', error);
		throw error;
	}
}
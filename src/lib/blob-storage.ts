// lib/blob-storage.ts
import { put, list } from '@vercel/blob';

interface Post {
	hook: string;
	content: string;
	hashtags: string[];
	topic: string;
	generatedAt: string;
}

interface PostsData {
	posts: Post[];
	lastUpdated: string;
}

export async function saveToBlobStorage(newPosts: Post[]) {
	try {
		// Récupérer les posts existants
		let existingData: PostsData = { posts: [], lastUpdated: new Date().toISOString() };
		console.log('existingData', existingData);
		try {
			const { blobs } = await list();
			console.log('blobs', blobs);
			if (blobs.length > 0) {
				// Trouver le dernier fichier par date
				const latestBlob = blobs
					.filter(blob => blob.pathname.startsWith('posts-'))
					.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())[0];
				
				if (latestBlob) {
					// Fetch le contenu du dernier fichier
					const response = await fetch(latestBlob.url);
					const text = await response.text();
					existingData = JSON.parse(text);
				}
			}
		} catch (error) {
			console.log('No existing data found, creating new storage');
		}
		
		const updatedData: PostsData = {
			posts: [...existingData.posts, ...newPosts],
			lastUpdated: new Date().toISOString()
		};
		
		// Format de la date : YYYY-MM-DD
		const date = new Date().toISOString().split('T')[0];
		const filename = `posts-${date}.json`;
		
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

export async function getLatestPosts(): Promise<PostsData> {
	try {
		const { blobs } = await list();
		if (blobs.length === 0) {
			return { posts: [], lastUpdated: new Date().toISOString() };
		}
		
		// Trouver le fichier le plus récent
		const latestBlob = blobs
			.filter(blob => blob.pathname.startsWith('posts-'))
			.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())[0];
		
		if (!latestBlob) {
			return { posts: [], lastUpdated: new Date().toISOString() };
		}
		
		const response = await fetch(latestBlob.url);
		const text = await response.text();
		return JSON.parse(text);
	} catch (error) {
		console.error('Error getting posts from blob storage:', error);
		throw error;
	}
}

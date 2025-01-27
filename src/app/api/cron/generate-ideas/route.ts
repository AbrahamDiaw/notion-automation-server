import { generatePostIdeas } from '@/lib/claude'
import { notion } from '@/lib/notion'
import { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints";
import { saveToBlobStorage } from "@/lib/blob-storage";
import { NextResponse } from "next/server";
import { NUMBER_OF_POSTS, topics } from "@/data";
import * as process from "node:process";
import { headers } from "next/headers";

function splitContentIntoBlocks(content: string) {
	return content
		.split(/\n+/)
		.map(part => part.trim())
		.filter(part => part.length > 0);
}

export async function GET(request: Request) {
	try {
		const headersList = await headers();
		const cronHeader = headersList.get('x-vercel-cron');
		const vercelDeploymentUrl = headersList.get('x-vercel-deployment-url');
		
		const isVercelCron = cronHeader && vercelDeploymentUrl?.includes('vercel.app');
		const hasValidSecret = request.headers.get('Authorization') === `Bearer ${process.env.CRON_SECRET}`;
		
		if (!isVercelCron && !hasValidSecret) {
			console.log('Unauthorized access attempt');
			return new NextResponse("Unauthorized", { status: 401 });
		}
		
		const allIdeas = [];
		
		for (let i = 0; i < NUMBER_OF_POSTS; i++) {
			const topic = topics[Math.floor(Math.random() * topics.length)];
			const { ideas } = await generatePostIdeas(topic);
			
			for (const idea of ideas) {
				const contentBlocks = splitContentIntoBlocks(idea.content);
				
				const blocks: BlockObjectRequest[] = [
					{
						type: 'paragraph',
						paragraph: {
							rich_text: [{
								type: 'text' as const,
								text: { content: idea.hook }
							}]
						}
					},
					...contentBlocks.map(line => ({
						type: 'paragraph' as const,
						paragraph: {
							rich_text: [{
								type: 'text' as const,
								text: { content: line }
							}]
						}
					})),
					{
						type: 'paragraph' as const,
						paragraph: {
							rich_text: [{
								type: 'text' as const,
								text: { content: idea.hashtags.join(' ') }
							}]
						}
					}
				];
				
				await notion.pages.create({
					parent: { database_id: process.env.NOTION_DATABASE_ID! },
					properties: {
						Titre: { title: [{ text: { content: idea.hook } }] },
						Status: { select: { name: "💡 Idea" } },
						Language: { select: { name: "Fr" } },
						Media: { select: { name: "Linkedin" } },
						Topic: { select: { name: topic } },
					},
					children: blocks
				});
				
				allIdeas.push({
					...idea,
					topic,
					generatedAt: new Date().toISOString()
				});
			}
		}
		
		const { url, data } = await saveToBlobStorage(allIdeas);
		
		return NextResponse.json({
			success: true,
			newPosts: allIdeas,
			totalPosts: data.posts.length,
			storageUrl: url
		});
		
	} catch (error: any) {
		console.error('Error fetching stats:', error)
		return NextResponse.json(
			{ message: 'Error fetching stats' },
			{ status: 500 }
		)
	}
}
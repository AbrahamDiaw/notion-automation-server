import { NextRequest, NextResponse } from 'next/server'
import { generatePostIdeas } from '@/lib/claude'
import { notion } from '@/lib/notion'
import { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints";
import { saveToBlobStorage } from "@/lib/blob-storage";

const topics = [
	"Automatisation",
	"Intelligence Artificielle",
	"Productivité",
	"Opportunités",
	"Organisation",
	"Outils Tech",
	"Focus",
	"MVP",
	"Itération",
	"Prototype",
	"Innovation Rapide",
	"Échec Tech",
	"Rebondir",
	"Leçons Apprises",
	"Résilience",
	"Compétences Tech",
	"SaaS",
]

function splitContentIntoBlocks(content: string) {
	return content
		.split(/\n+/)
		.map(part => part.trim())
		.filter(part => part.length > 0);
}

const NUMBER_OF_POSTS = 10;

export async function GET(request: NextRequest) {
	try {
		const allIdeas = [];
		for (let i = 0; i < NUMBER_OF_POSTS; i++) {
			const topic = topics[Math.floor(Math.random() * topics.length)];
			const { ideas } = await generatePostIdeas(topic);
			console.log(ideas);
			
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
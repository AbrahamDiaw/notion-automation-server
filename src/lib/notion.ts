import { Client } from "@notionhq/client";

if (!process.env.NOTION_TOKEN) {
	throw new Error("Missing NOTION_TOKEN environment variable");
}

if (!process.env.NOTION_DATABASE_ID) {
	throw new Error("Missing NOTION_DATABASE_ID environment variable");
}

export const notion = new Client({
	auth: process.env.NOTION_TOKEN,
});

export async function getPostsToPublish() {
	const response = await notion.databases.query({
		database_id: process.env.NOTION_DATABASE_ID as string,
		filter: {
			and: [
				{
					property: "Status",
					status: {
						equals: "To review"
					}
				},
				{
					property: "Publication time",
					date: {
						on_or_before: new Date().toISOString(),
					}
				}
			]
		}
	});
	
	return response.results;
}

export async function updatePostStatus(pageId: string, status: string) {
	await notion.pages.update({
		page_id: pageId,
		properties: {
			Status: {
				status: {
					name: status
				}
			}
		}
	});
}

export async function getPostContent(pageId: string) {
	const response = await notion.blocks.children.list({
		block_id: pageId,
	});
	
	// Combine all text blocks into a single string
	const content = response.results
		.filter((block: any) => block.type === 'paragraph' && block.paragraph.rich_text.length > 0)
		.map((block: any) => block.paragraph.rich_text[0].text.content)
		.join('\n\n');
	
	return content;
}
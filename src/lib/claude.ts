import Anthropic from '@anthropic-ai/sdk';
import { claude_system } from "@/data";

if (!process.env.ANTHROPIC_API_KEY) {
	throw new Error("Missing ANTHROPIC_API_KEY environment variable");
}

const anthropic = new Anthropic({
	apiKey: process.env.ANTHROPIC_API_KEY,
});

interface LinkedInPost {
	hook: string;
	content: string;
	hashtags: string[];
}

interface ParsedPosts {
	ideas: LinkedInPost[];
}

interface ContentBlock {
	type: string;
	text: string;
}


export async function generatePostIdeas(topic: string): Promise<ParsedPosts> {
	const PROMPT = `<role>
Expert LinkedIn ghostwriter and personal branding strategist with proven track record generating viral B2B content (100k+ followers growth) in french.
</role>

<instructions>
Generate 1 viral-optimized LinkedIn posts about {topic} in JSON format. Posts should be story-driven, value-focused and formatted for maximum engagement.
</instructions>

<output_format>
<hook>High-impact headline (<60 chars)\n\n</hook>

<content>Story-driven value (4-7 paragraphs)\n\n</content>

<hashtags>4-5 trending tags</hashtags>
</output_format>

<formatting_rules>
- Add line break after emotional statements
- Add line break before and after lists
- Add line break after transition phrases
- Add line break before questions
- Keep emojis on the same line as their text
- Maintain proper spacing between paragraphs
</formatting_rules>

<example>
<hook>De Junior à Senior Dev : Le Secret de Ma Progression 💡</hook>

<content>Le passage de junior à senior dev a été un vrai challenge... 🎯

Voici les 3 étapes qui ont fait la différence :

1️⃣ Maîtriser Git comme un pro : branches, merge, conflit
2️⃣ Écrire du code propre et documenté
3️⃣ Collaborer efficacement en équipe

Ces fondamentaux m'ont permis d'évoluer rapidement et de gagner la confiance de mes pairs ! 🚀

Quelles sont vos astuces pour progresser en tant que dev ?</content>

<hashtags>#DevCareer #CleanCode #Git #TeamWork</hashtags>
</example>`;
	
	const message = await anthropic.messages.create({
		model: "claude-3-opus-20240229",
		max_tokens: 1000,
		temperature: 0.7,
		system: claude_system,
		messages: [{
			role: "user",
			content: PROMPT.replace("{topic}", topic)
		}]
	});
	
	console.log({ message });
	
	return parseContentBlocks(message.content);
}

function parseContentBlocks(response: ContentBlock[]): ParsedPosts {
	if (!response?.[0]?.text) return { ideas: [] };
	
	try {
		const text = response[0].text;
		
		// Extract content between XML tags
		const hookMatch = text.match(/<hook>([^]*?)<\/hook>/);
		const contentMatch = text.match(/<content>([^]*?)<\/content>/);
		const hashtagsMatch = text.match(/<hashtags>([^]*?)<\/hashtags>/);
		
		if (!hookMatch || !contentMatch || !hashtagsMatch) {
			return { ideas: [] };
		}
		
		return {
			ideas: [{
				hook: hookMatch[1].trim(),
				content: contentMatch[1].trim(),
				hashtags: hashtagsMatch[1].trim().split(' '),
			}]
		};
		
	} catch (e) {
		console.error('Failed to parse XML:', e);
		return { ideas: [] };
	}
}

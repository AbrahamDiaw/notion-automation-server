/**
 * Configuration constants for post generation and content management
 */

/**
 * Defines the number of posts to generate in each batch
 */
export const NUMBER_OF_POSTS = 2;

/**
 * List of available topics for content generation
 * Each topic represents a key area in technology and innovation
 */
export const topics = [
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

/**
 * System prompt for Claude AI
 * Defines the persona and context for content generation
 * @description Sets the AI's role as a technical thought leader focused on innovation and tech trends
 */
export const claude_system = "You are a technical thought leader crafting engaging content about innovation, software development, and emerging tech trends."
export const generateGeminiPrompt = (title, category) => {
  return `The user has completed a learning activity titled "${title}" in the domain of ${category}. 
Generate a short, motivational reflection insight for this achievement.`;
};

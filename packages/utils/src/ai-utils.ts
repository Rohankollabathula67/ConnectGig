// AI utilities for ConnectGig platform

export interface TextModerationResult {
  isAppropriate: boolean;
  confidence: number;
  flaggedWords: string[];
  categories: {
    harassment: number;
    spam: number;
    inappropriate: number;
    violence: number;
  };
  suggestion?: string;
}

export interface SentimentAnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
  };
}

export interface JobDescriptionAnalysis {
  complexity: 'simple' | 'medium' | 'complex';
  estimatedHours: number;
  requiredSkills: string[];
  suggestedCategories: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

// Simple text moderation (basic implementation)
export const moderateText = (text: string): TextModerationResult => {
  const lowerText = text.toLowerCase();
  
  // Define inappropriate words and patterns
  const inappropriateWords = [
    'abuse', 'harass', 'threat', 'violence', 'spam', 'scam',
    'fake', 'fraud', 'illegal', 'inappropriate'
  ];
  
  const flaggedWords = inappropriateWords.filter(word => 
    lowerText.includes(word)
  );
  
  // Simple scoring system
  let harassmentScore = 0;
  let spamScore = 0;
  let inappropriateScore = 0;
  let violenceScore = 0;
  
  // Check for harassment indicators
  if (lowerText.includes('kill') || lowerText.includes('hurt')) {
    violenceScore += 0.8;
  }
  
  if (lowerText.includes('spam') || lowerText.includes('fake')) {
    spamScore += 0.7;
  }
  
  if (lowerText.includes('abuse') || lowerText.includes('harass')) {
    harassmentScore += 0.9;
  }
  
  // Calculate overall confidence
  const maxScore = Math.max(harassmentScore, spamScore, inappropriateScore, violenceScore);
  const isAppropriate = maxScore < 0.5;
  
  return {
    isAppropriate,
    confidence: Math.max(0.1, 1 - maxScore),
    flaggedWords,
    categories: {
      harassment: harassmentScore,
      spam: spamScore,
      inappropriate: inappropriateScore,
      violence: violenceScore,
    },
    suggestion: isAppropriate ? undefined : 'Please review your message for inappropriate content',
  };
};

// Simple sentiment analysis
export const analyzeSentiment = (text: string): SentimentAnalysisResult => {
  const lowerText = text.toLowerCase();
  
  // Define positive and negative words
  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'perfect',
    'love', 'like', 'happy', 'satisfied', 'pleased', 'recommend'
  ];
  
  const negativeWords = [
    'bad', 'terrible', 'awful', 'horrible', 'disappointed', 'angry',
    'hate', 'dislike', 'unhappy', 'dissatisfied', 'complaint', 'refund'
  ];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveCount++;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeCount++;
  });
  
  // Calculate sentiment
  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  let confidence = 0.5;
  
  if (positiveCount > negativeCount) {
    sentiment = 'positive';
    confidence = Math.min(0.9, 0.5 + (positiveCount - negativeCount) * 0.1);
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
    confidence = Math.min(0.9, 0.5 + (negativeCount - positiveCount) * 0.1);
  }
  
  // Simple emotion detection
  const emotions = {
    joy: positiveCount > negativeCount ? Math.min(0.8, positiveCount * 0.2) : 0.1,
    sadness: negativeCount > positiveCount ? Math.min(0.8, negativeCount * 0.2) : 0.1,
    anger: lowerText.includes('angry') || lowerText.includes('mad') ? 0.7 : 0.1,
    fear: lowerText.includes('scared') || lowerText.includes('afraid') ? 0.6 : 0.1,
    surprise: lowerText.includes('wow') || lowerText.includes('amazing') ? 0.5 : 0.1,
  };
  
  return {
    sentiment,
    confidence,
    emotions,
  };
};

// Analyze job description for complexity and requirements
export const analyzeJobDescription = (description: string): JobDescriptionAnalysis => {
  const lowerDesc = description.toLowerCase();
  
  // Estimate complexity based on description length and keywords
  let complexity: 'simple' | 'medium' | 'complex' = 'simple';
  let estimatedHours = 1;
  
  if (lowerDesc.length > 500) {
    complexity = 'complex';
    estimatedHours = 4;
  } else if (lowerDesc.length > 200) {
    complexity = 'medium';
    estimatedHours = 2;
  }
  
  // Detect skill requirements
  const skillKeywords = [
    'plumbing', 'electrical', 'carpentry', 'painting', 'cleaning',
    'tutoring', 'cooking', 'driving', 'gardening', 'repair',
    'installation', 'maintenance', 'assembly', 'moving', 'delivery'
  ];
  
  const requiredSkills = skillKeywords.filter(skill => 
    lowerDesc.includes(skill)
  );
  
  // Suggest categories
  const suggestedCategories = requiredSkills.length > 0 
    ? requiredSkills 
    : ['general', 'handyman'];
  
  // Assess risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  
  if (lowerDesc.includes('urgent') || lowerDesc.includes('emergency')) {
    riskLevel = 'high';
  } else if (lowerDesc.includes('complex') || lowerDesc.includes('difficult')) {
    riskLevel = 'medium';
  }
  
  return {
    complexity,
    estimatedHours,
    requiredSkills,
    suggestedCategories,
    riskLevel,
  };
};

// Generate job title suggestions
export const generateJobTitleSuggestions = (description: string): string[] => {
  const analysis = analyzeJobDescription(description);
  const skills = analysis.requiredSkills;
  
  if (skills.length === 0) {
    return ['General Service Request', 'Handyman Job', 'Home Service'];
  }
  
  const suggestions = skills.map(skill => 
    `${skill.charAt(0).toUpperCase() + skill.slice(1)} Service`
  );
  
  // Add urgency-based suggestions
  if (description.toLowerCase().includes('urgent')) {
    suggestions.push('Urgent Service Required');
  }
  
  if (description.toLowerCase().includes('repair')) {
    suggestions.push('Repair Service');
  }
  
  return suggestions.slice(0, 5); // Return top 5 suggestions
};

// Extract key information from text
export const extractKeyInfo = (text: string): {
  budget?: number;
  location?: string;
  urgency?: string;
  timeline?: string;
} => {
  const result: any = {};
  
  // Extract budget information
  const budgetMatch = text.match(/(?:budget|price|cost|pay)\s*:?\s*₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
  if (budgetMatch) {
    result.budget = parseFloat(budgetMatch[1].replace(/,/g, ''));
  }
  
  // Extract location information
  const locationMatch = text.match(/(?:location|area|address)\s*:?\s*([^,.\n]+)/i);
  if (locationMatch) {
    result.location = locationMatch[1].trim();
  }
  
  // Extract urgency
  if (text.toLowerCase().includes('urgent')) {
    result.urgency = 'urgent';
  } else if (text.toLowerCase().includes('asap')) {
    result.urgency = 'high';
  }
  
  // Extract timeline
  const timelineMatch = text.match(/(?:need|want|require)\s+(?:by|on|in)\s+([^,.\n]+)/i);
  if (timelineMatch) {
    result.timeline = timelineMatch[1].trim();
  }
  
  return result;
};

// Validate AI-generated content
export const validateAIGeneratedContent = (content: string): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} => {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  // Check for common AI generation issues
  if (content.length < 10) {
    issues.push('Content too short');
    suggestions.push('Provide more detailed information');
  }
  
  if (content.length > 2000) {
    issues.push('Content too long');
    suggestions.push('Keep descriptions concise and focused');
  }
  
  // Check for repetitive patterns
  const words = content.toLowerCase().split(/\s+/);
  const wordCounts = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const repetitiveWords = Object.entries(wordCounts)
    .filter(([_, count]) => count > 3)
    .map(([word, _]) => word);
  
  if (repetitiveWords.length > 0) {
    issues.push('Repetitive language detected');
    suggestions.push('Vary your vocabulary and sentence structure');
  }
  
  // Check for generic language
  const genericPhrases = [
    'high quality', 'best service', 'professional work',
    'satisfaction guaranteed', 'excellent results'
  ];
  
  const hasGenericLanguage = genericPhrases.some(phrase => 
    content.toLowerCase().includes(phrase)
  );
  
  if (hasGenericLanguage) {
    issues.push('Generic language detected');
    suggestions.push('Be specific about what makes your service unique');
  }
  
  const isValid = issues.length === 0;
  
  return {
    isValid,
    issues,
    suggestions,
  };
};

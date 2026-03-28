export const categorizeIssue = (text: string): string => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.match(/(pothole|road|streetlight|light|waterlogging|sign)/)) return "Infrastructure & Roads";
  if (lowerText.match(/(water|sewage|drain|pipe|toilet|leakage)/)) return "Water & Sanitation";
  if (lowerText.match(/(garbage|dustbin|plastic|trash|waste|collection)/)) return "Waste Management";
  if (lowerText.match(/(wire|transformer|voltage|electric|power|pole)/)) return "Electricity & Utilities";
  
  return "Community Issues";
};

export const detectPriority = (text: string): "low" | "medium" | "high" | "emergency" => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.match(/(hospital|school|highway|emergency)/)) return "emergency";
  if (lowerText.match(/(danger|accident|electric wire|sewage overflow|fire|urgent)/)) return "high";
  if (lowerText.match(/(pothole|leak|garbage|blocked|traffic)/)) return "medium";
  
  return "low";
};

export const getAgePriority = (createdAtMillis: number): "low" | "medium" | "high" | "emergency" | null => {
  const ageInMs = Date.now() - createdAtMillis;
  const days = ageInMs / (1000 * 60 * 60 * 24);
  
  if (days > 10) return "emergency";
  if (days > 5) return "high";
  if (days > 2) return "medium";
  return null;
}

const PRIORITY_WEIGHTS = { "low": 1, "medium": 2, "high": 3, "emergency": 5 };

export const getEffectivePriority = (basePriority: string, createdAtMillis: number): string => {
  const agePriority = getAgePriority(createdAtMillis);
  if (!agePriority) return basePriority;
  
  const baseWeight = PRIORITY_WEIGHTS[basePriority as keyof typeof PRIORITY_WEIGHTS] || 1;
  const ageWeight = PRIORITY_WEIGHTS[agePriority as keyof typeof PRIORITY_WEIGHTS] || 1;

  if (ageWeight > baseWeight) {
    return agePriority;
  }
  return basePriority;
}

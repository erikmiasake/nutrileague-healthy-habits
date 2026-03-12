export const currentUser = {
  name: "João Silva",
  avatar: "JS",
  streak: 12,
  level: 7,
  xp: 340,
  xpToNext: 500,
  mealsThisWeek: 18,
  challengesCompleted: 5,
};

export const recentMeals = [
  { id: "1", category: "Café da manhã", emoji: "🥣", description: "Aveia com frutas", time: "08:30", date: "Hoje" },
  { id: "2", category: "Almoço", emoji: "🥗", description: "Salada com frango", time: "12:45", date: "Hoje" },
  { id: "3", category: "Lanche", emoji: "🍎", description: "Frutas e castanhas", time: "16:00", date: "Ontem" },
];

export const mealCategories = [
  { id: "breakfast", label: "Café da manhã", emoji: "🥣" },
  { id: "lunch", label: "Almoço", emoji: "🥗" },
  { id: "dinner", label: "Jantar", emoji: "🍽️" },
  { id: "snack", label: "Lanche", emoji: "🍎" },
  { id: "water", label: "Água", emoji: "💧" },
];

export const challenges = [
  { id: "1", title: "7 dias sem açúcar", description: "Evite açúcar refinado por 7 dias consecutivos", progress: 5, goal: 7, xpReward: 100, participants: 234, active: true },
  { id: "2", title: "Semana verde", description: "Inclua vegetais em todas as refeições por 7 dias", progress: 3, goal: 7, xpReward: 80, participants: 189, active: true },
  { id: "3", title: "Hidratação master", description: "Beba 2L de água por dia durante 5 dias", progress: 0, goal: 5, xpReward: 60, participants: 456, active: false },
  { id: "4", title: "Café da manhã campeão", description: "Tome café da manhã saudável por 10 dias", progress: 0, goal: 10, xpReward: 120, participants: 312, active: false },
];

export const leaderboard = [
  { rank: 1, name: "Ana Costa", avatar: "AC", streak: 45, xp: 2340, isCurrentUser: false },
  { rank: 2, name: "Pedro Lima", avatar: "PL", streak: 38, xp: 1980, isCurrentUser: false },
  { rank: 3, name: "Maria Santos", avatar: "MS", streak: 32, xp: 1750, isCurrentUser: false },
  { rank: 4, name: "Lucas Oliveira", avatar: "LO", streak: 28, xp: 1520, isCurrentUser: false },
  { rank: 5, name: "João Silva", avatar: "JS", streak: 12, xp: 340, isCurrentUser: true },
  { rank: 6, name: "Carla Souza", avatar: "CS", streak: 10, xp: 290, isCurrentUser: false },
  { rank: 7, name: "Bruno Ferreira", avatar: "BF", streak: 8, xp: 210, isCurrentUser: false },
];

export const weekDays = ["S", "T", "Q", "Q", "S", "S", "D"];
export const weekActivity = [true, true, true, true, true, false, false];

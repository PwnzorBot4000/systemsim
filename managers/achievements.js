const ACHIEVEMENTS_STORAGE_KEY = 'systemsim-achievements';

export class Achievements {
  static add(name) {
    const achievements = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (!achievements) {
      localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify([name]));
    } else {
      const achievementsList = JSON.parse(achievements);
      if (!achievementsList.includes(name)) {
        achievementsList.push(name);
        localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(achievementsList));
      }
    }
  }

  static has(name) {
    const achievements = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (!achievements) return false;
    const achievementsList = JSON.parse(achievements);
    return achievementsList.includes(name);
  }
}

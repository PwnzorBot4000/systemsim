import {achievementsData} from "../../data/achievements.js";

const ACHIEVEMENTS_STORAGE_KEY = 'systemsim-achievements';

export class Achievements {
  static add(name) {
    const achievements = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (!achievements) {
      localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify([name]));
      Achievements.showAchievementPopup(name);
    } else {
      const achievementsList = JSON.parse(achievements);
      if (!achievementsList.includes(name)) {
        achievementsList.push(name);
        localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(achievementsList));
        Achievements.showAchievementPopup(name);
      }
    }
  }

  static has(name) {
    const achievements = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (!achievements) return false;
    const achievementsList = JSON.parse(achievements);
    return achievementsList.includes(name);
  }

  static showAchievementPopup(name) {
    const achievement = achievementsData.get(name);
    if (!achievement) return;

    document.getElementById('new-achievement-title').innerHTML = achievement.title;
    document.getElementById('new-achievement-description').innerHTML = achievement.description;
    document.getElementById('achievements-popup').style.display = null;

    setTimeout(() => {
      document.getElementById('achievements-popup').style.opacity = 1;
      document.getElementById('achievements-popup').style.translate = '0 0';
    }, 10);

    setTimeout(() => {
      document.getElementById('achievements-popup').style.opacity = null;
      document.getElementById('achievements-popup').style.translate = null;
    }, 5000);

    setTimeout(() => {
      document.getElementById('achievements-popup').style.display = 'none';
    }, 6000);
  }
}

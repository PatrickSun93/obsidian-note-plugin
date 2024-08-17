import { Plugin, Setting, PluginSettingTab } from 'obsidian';
import moment from 'moment';

export default class MyNotesPlugin extends Plugin {
  async onload() {
    console.log('Loading MyNotesPlugin...');

    // Load settings
    await this.loadSettings();

    // Add settings tab
    this.addSettingTab(new MyNotesSettingTab(this.app, this));

    // Create daily/weekly note if not exists and open them
    await this.createAndOpenNotes();

    // Add a random emoji to the title based on the custom list
    this.addRandomEmojiToTitle();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async createAndOpenNotes() {
    const { dailyNoteFormat, weeklyNoteFormat, dailyNoteLocation, weeklyNoteLocation } = this.settings;

    // Get the current date and week number
    const today = moment().format(dailyNoteFormat);
    const weekNumber = moment().isoWeek(); // ISO week number (1-53)
    const currentYear = moment().year();

    // Construct the paths for daily and weekly notes
    const dailyNotePath = dailyNoteLocation ? `${dailyNoteLocation}/${today}.md` : `${today}.md`;
    const weeklyNotePath = weeklyNoteLocation ? `${weeklyNoteLocation}/Week-${weekNumber}-${currentYear}.md` : `Week-${weekNumber}-${currentYear}.md`;

    // Check if the daily note exists and create it if not
    let dailyNote = this.app.vault.getAbstractFileByPath(dailyNotePath);
    if (!dailyNote) {
      dailyNote = await this.app.vault.create(dailyNotePath, this.getDailyNoteTemplate(today));
      console.log(`Daily note created: ${dailyNotePath}`);
    }

    // Check if the weekly note exists and create it if not
    let weeklyNote = this.app.vault.getAbstractFileByPath(weeklyNotePath);
    if (!weeklyNote) {
      weeklyNote = await this.app.vault.create(weeklyNotePath, this.getWeeklyNoteTemplate(weekNumber, currentYear));
      console.log(`Weekly note created: ${weeklyNotePath}`);
    }

    // Open the daily note
    await this.openNoteInActiveLeaf(dailyNotePath);

    // Open the weekly note
    await this.openNoteInActiveLeaf(weeklyNotePath);
  }

  async openNoteInActiveLeaf(notePath) {
    const file = this.app.vault.getAbstractFileByPath(notePath);
    if (file) {
      const leaf = this.app.workspace.getLeaf(true);
      await leaf.openFile(file);
    } else {
      console.error(`File not found: ${notePath}`);
    }
  }

  addRandomEmojiToTitle() {
    const { emojis } = this.settings;
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    // Logic to add emoji to the note title (to be implemented)
  }

  getDailyNoteTemplate(date) {
    return `# ${date}\n\n## Reading Notes\n- \n\n## Thoughts\n- `;
  }

  getWeeklyNoteTemplate(weekNumber, year) {
    return `# Week ${weekNumber}, ${year}\n\n## Summary\n- \n\n## Achievements\n- \n\n## Next Week's Goals\n- `;
  }

  onunload() {
    console.log('Unloading MyNotesPlugin...');
  }
}

const DEFAULT_SETTINGS = {
  dailyNoteFormat: 'YYYY-MM-DD',
  weeklyNoteFormat: 'Week #',
  dailyNoteLocation: '',
  weeklyNoteLocation: '',
  weekStart: 'Monday',
  emojis: ['😊', '📚', '✍️', '🚀', '🌟', '🎯'], // Customizable emojis
};

class MyNotesSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Settings for My Notes Plugin' });

    new Setting(containerEl)
      .setName('Daily Note Format')
      .setDesc('Set the format for daily note titles.')
      .addText(text => text
        .setPlaceholder('YYYY-MM-DD')
        .setValue(this.plugin.settings.dailyNoteFormat)
        .onChange(async (value) => {
          this.plugin.settings.dailyNoteFormat = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Weekly Note Format')
      .setDesc('Set the format for weekly note titles.')
      .addText(text => text
        .setPlaceholder('Week #')
        .setValue(this.plugin.settings.weeklyNoteFormat)
        .onChange(async (value) => {
          this.plugin.settings.weeklyNoteFormat = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Daily Note Location')
      .setDesc('Folder location for daily notes.')
      .addText(text => text
        .setPlaceholder('Folder path')
        .setValue(this.plugin.settings.dailyNoteLocation)
        .onChange(async (value) => {
          this.plugin.settings.dailyNoteLocation = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Weekly Note Location')
      .setDesc('Folder location for weekly notes.')
      .addText(text => text
        .setPlaceholder('Folder path')
        .setValue(this.plugin.settings.weeklyNoteLocation)
        .onChange(async (value) => {
          this.plugin.settings.weeklyNoteLocation = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Custom Emojis')
      .setDesc('Set custom emojis to randomly add to the file titles.')
      .addTextArea(textArea => textArea
        .setPlaceholder('😊, 📚, ✍️, 🚀, 🌟, 🎯')
        .setValue(this.plugin.settings.emojis.join(', '))
        .onChange(async (value) => {
          this.plugin.settings.emojis = value.split(',').map(emoji => emoji.trim());
          await this.plugin.saveSettings();
        }));
  }
}

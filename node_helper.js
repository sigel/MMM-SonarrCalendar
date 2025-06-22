const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
    start() {
        console.log("[MMM-SonarrCalendar] Helper started");
        this.config = null;
        this.refreshInterval = null;
    },

    socketNotificationReceived(notification, payload) {
        if (notification === "SONARRCALENDAR_CONFIG") {
            this.config = payload;

            this.validateConfig();
            this.refreshInterval = this.config.refreshInterval * 60 * 1000;
            
            // Clear any existing interval
            if (this.fetchInterval) {
                clearInterval(this.fetchInterval);
                this.fetchInterval = null;
            }

            this.scheduleFetch();
        }
    },

    scheduleFetch() {
        if (!this.config) {
            console.error("[MMM-SonarrCalendar] Cannot schedule fetch: configuration not set");
            return;
        }

        // Clear any existing interval
        if (this.fetchInterval) {
            clearInterval(this.fetchInterval);
            this.fetchInterval = null;
        }

        console.log(`[MMM-SonarrCalendar] Scheduling calendar fetch every ${this.refreshInterval}ms`);
        
        // Immediate fetch
        console.log("[MMM-SonarrCalendar] Performing initial fetch");
        this.fetchCalendar();

        // Schedule regular fetches
        this.fetchInterval = setInterval(() => {
            console.log("[MMM-SonarrCalendar] Interval triggered - fetching calendar");
            this.fetchCalendar();
        }, this.refreshInterval);
    },

    async fetchCalendar() {
        
        if (!this.config.apiKey) {
            console.error("[MMM-SonarrCalendar] Cannot fetch calendar: No API key available");
            return;
        }
        
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const start = now.toISOString();

        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + (this.config.maxDays || 1)); // fallback to 1 day
        const end = endDate.toISOString();
            
        const url = `${this.config.host}/api/v3/calendar?start=${start}&end=${end}&includeSeries=true`;
        let episodes = []; 


        console.log('Fetching Calendar');
        try {
            const response = await fetch(url,
                {
                    headers: { "X-Api-Key": this.config.apiKey },
                }
            );

            if (!response.ok) throw new Error("[MMM-SonarrCalendar] Failed to fetch calendar");

            episodes = await response.json();

            // Trim to maxEpisodes (default 30)
            const limit = this.config.maxEpisodes || 30;
            episodes = episodes.slice(0, limit);
            
        } catch (error) {
            console.error(`Failed to fetch calendar:`, error.message);
        } finally {
            this.sendSocketNotification("SONARRCALENDAR_EPISODES", episodes);
        }

    },

    validateConfig() {
        if (!this.config.host || !this.config.apiKey) {
            throw new Error("Host and API key is required");
        }
        if (!this.config.refreshInterval || this.config.refreshInterval < 1) {
            console.warn("[MMM-SonarrCalendar] Refresh interval too short, defaulting to 1 minute");
            this.config.refreshInterval = 1; // minutes
        }
        if (!this.config.maxEpisodes || this.config.maxEpisodes <= 0) {
            console.warn("[MMM-SonarrCalendar] maxEpisodes missing or invalid, defaulting to 30");
            this.config.maxEpisodes = 30;
        }
        if (!this.config.maxDays || this.config.maxDays <= 0) {
            console.warn("[MMM-SonarrCalendar] maxDays missing or invalid, defaulting to 7");
            this.config.maxDays = 7;
        }
    }
});

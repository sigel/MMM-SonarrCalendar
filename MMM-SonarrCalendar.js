Module.register("MMM-SonarrCalendar", {
    defaults: {
        host: "http://192.168.1.10:8989", // Sonarr URL
        apiKey: "", // Sonarr API Key
        refreshInterval: 15, // Fetch Calendar every 15 minutes
        title: "Upcoming Episodes", // Title Displayed in Header
        displayHeader: true, // Show Sonarr Logo & Title
        maxDays: 7, // Max number of days to pull
        maxEpisodes: 10 // Max number of episodes to display
    },

    start() {
        console.log("[MMM-SonarrCalendar] Module started");
        this.episodes = [];
        this.updateDom();
    },

    getStyles() {
        return ["MMM-SonarrCalendar.css"];
    },

    getTemplate() {
	    return "templates/default.njk";
    },

    getTemplateData() {
        return {
            title: this.config.title,
            displayHeader: this.config.displayHeader,
            episodes: this.episodes.map(ep => {
                const posterImage = ep.series.images.find(img => img.coverType === "poster");
                const airDateObj = new Date(ep.airDateUtc);
                const now = new Date();
                now.setHours(0, 0, 0, 0);

                const tomorrow = new Date(now);
                tomorrow.setDate(now.getDate() + 1);

                const airDateOnly = new Date(airDateObj);
                airDateOnly.setHours(0, 0, 0, 0);

                let label = airDateObj.toLocaleString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric"
                });

                let dateClass = "";

                if (airDateOnly.getTime() === now.getTime()) {
                    label = `TODAY · ${airDateObj.toLocaleTimeString(undefined, {
                        hour: "numeric",
                        minute: "numeric"
                    })}`;
                    dateClass = "today";
                } else if (airDateOnly.getTime() === tomorrow.getTime()) {
                    label = `TOMORROW · ${airDateObj.toLocaleTimeString(undefined, {
                        hour: "numeric",
                        minute: "numeric"
                    })}`;
                    dateClass = "tomorrow";
                }
                return {
                    title: ep.title,
                    show: ep.series.title,
                    season: ep.seasonNumber,
                    episode: ep.episodeNumber,
                    finaleType: ep.finaleType || "regular",
                    hasFile: ep.hasFile,
                    poster: posterImage ? posterImage.remoteUrl : null,
                    airDate: label,
                    airClass: dateClass
                };
            })
        };
    },

    requiresVersion: "2.2.0",

    notificationReceived(notification, payload, sender) {
        if (notification === "DOM_OBJECTS_CREATED") {
            const config = {
                host: this.config.host,
                apiKey: this.config.apiKey,
                refreshInterval: this.config.refreshInterval,
                maxDays: this.config.maxDays,
                maxEpisodes: this.config.maxEpisodes
            };
            this.sendSocketNotification("SONARRCALENDAR_CONFIG", config);
        }
    },

    socketNotificationReceived(notification, payload) {
        if (notification === "SONARRCALENDAR_EPISODES") {
            this.episodes = payload;
            this.updateDom();
        }
    },

});

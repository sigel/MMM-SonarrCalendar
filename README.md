# MMM-SonarrCalendar

MagicMirror² module to display upcoming shows from Sonarr. (In Progress)

# Screenshots

![Example of MMM-SonarrCalendar](http://sigelnetwork.com/wp-content/uploads/2025/06/MMM-SonarrCalendar-Screenshot-1.jpg)

## Installation

### Install

In your terminal, go to your [MagicMirror²][mm] Module folder and clone MMM-SonarrCalendar:

```bash
cd ~/MagicMirror/modules
git clone https://github.com/sigel/MMM-SonarrCalendar.git
```

### Update

```bash
cd ~/MagicMirror/modules/MMM-SonarrCalendar
git pull
```

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:

```js
    {
        module: 'MMM-SonarrCalendar',
        position: 'top_left',
        config: {
            host: "http://192.168.1.10:8989", // Sonarr URL
            apiKey: "", // Sonarr API Key
            refreshInterval: 15, // Fetch Calendar every 15 minutes
            title: "Upcoming Episodes", // Title Displayed in Header
            displayHeader: true, // Show Sonarr Logo & Title
            maxDays: 7, // Max number of days to pull
            maxEpisodes: 10 // Max number of episodes to display
        }
    },
```

[mm]: https://github.com/MagicMirrorOrg/MagicMirror
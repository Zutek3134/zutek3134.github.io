window.DiscordPlayFabAuth = {
    PLAYFAB_TITLE_ID: "1154D7",
    DISCORD_CLIENT_ID: "1510368755010502778",
    WORKER_ENDPOINT: "https://goforword-backend.goforword-zutek3134.workers.dev/",
    discordId: "",
    global_name: "",
    unique_username: "",
    accessToken: "",
    isLoggedIn: false,

    async init() {
        if (typeof PlayFab !== 'undefined') PlayFab.settings.titleId = this.PLAYFAB_TITLE_ID;

        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (code) {
            await this._handleOAuthCallback(code);
            return;
        }

        const savedSession = localStorage.getItem("dpf_session");
        if (savedSession) {
            try {
                const sessionData = JSON.parse(savedSession);
                this.discordId = sessionData.discordId;
                this.global_name = sessionData.global_name;
                this.unique_username = sessionData.unique_username;
                this.accessToken = sessionData.accessToken;

                if (typeof PlayFabClientSDK !== 'undefined') {
                    PlayFabClientSDK.LoginWithCustomID({ TitleId: this.PLAYFAB_TITLE_ID, CustomId: this.discordId, CreateAccount: false }, (result) => {
                        if (result && result.data) {
                            this.isLoggedIn = true;
                            window.dispatchEvent(new CustomEvent("DiscordAuthSuccess", {
                                detail: { discordId: this.discordId, global_name: this.global_name, unique_username: this.unique_username }
                            }));
                        } else {
                            localStorage.removeItem("dpf_session");
                        }
                    });
                }
            } catch (e) {
                localStorage.removeItem("dpf_session");
            }
        }
    },

    login() {
        const uri = window.location.origin + window.location.pathname;
        window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${this.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(uri)}&response_type=code&scope=identify`;
    },

    async syncState(matchId, gameStateString) {
        if (!this.isLoggedIn) return false;
        try {
            const endpoint = this.WORKER_ENDPOINT.endsWith('/') ? this.WORKER_ENDPOINT.slice(0, -1) : this.WORKER_ENDPOINT;
            const res = await fetch(`${endpoint}/sync-state`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accessToken: this.accessToken, dtS: matchId, gameState: gameStateString })
            });
            return res.ok;
        } catch (e) { return false; }
    },

    async _handleOAuthCallback(code) {
        window.history.replaceState({}, document.title, window.location.pathname);
        try {
            const uri = window.location.origin + window.location.pathname;
            const endpoint = this.WORKER_ENDPOINT.endsWith('/') ? this.WORKER_ENDPOINT.slice(0, -1) : this.WORKER_ENDPOINT;
            const res = await fetch(`${endpoint}/auth?code=${code}&redirect_uri=${encodeURIComponent(uri)}`);
            if (!res.ok) return;
            const data = await res.json();
            console.log(data);

            this.discordId = data.discordId;
            this.global_name = data.global_name;
            this.unique_username = data.unique_username;
            this.accessToken = data.accessToken;

            if (typeof PlayFabClientSDK !== 'undefined') {
                PlayFabClientSDK.LoginWithCustomID({ TitleId: this.PLAYFAB_TITLE_ID, CustomId: this.discordId, CreateAccount: false }, (result) => {
                    if (result && result.data) {
                        this.isLoggedIn = true;

                        localStorage.setItem("dpf_session", JSON.stringify({
                            discordId: this.discordId,
                            global_name: this.global_name,
                            unique_username: this.unique_username,
                            accessToken: this.accessToken
                        }));

                        PlayFabClientSDK.UpdateUserTitleDisplayName({ DisplayName: this.unique_username }, () => { });
                        window.dispatchEvent(new CustomEvent("DiscordAuthSuccess", { detail: { discordId: this.discordId, global_name: this.global_name, unique_username: this.unique_username } }));
                    }
                });
            }
        } catch (e) { }
    }
};
class IexApi {
    static getSymbolLogo(symbol) {
        return `https://storage.googleapis.com/iex/api/logos/${symbol}.png`;
    }

    static getSymbolInformation(symbol) {
        const url = `https://cloud.iexapis.com/stable/stock/${symbol}/quote?token=YOUR_API_KEY`;

        return new Promise((resolve, reject) => {
            fetch(url).then(res => {
                if (res.ok) {
                    return res.json();
                }
                else {
                    reject(res.status);
                    return;
                }
            }).then(json => {
                if (!json) {
                    return;
                }

                const companyName = json.companyName;
                const symbol = json.symbol;
                const price = json.latestPrice;
                // previousVolume is used instead of volume or latestVolume because they are sometimes null.
                // The documentation does not mention what a null value is supposed to mean (for this property).
                const volume = json.previousVolume;
                const marketCap = json.marketCap;
                const primaryExchange = json.primaryExchange;

                const change = json.change;
                const changePercent = json.changePercent * 100;
                const outstandingShares = Math.floor(marketCap / json.latestPrice); 

                resolve({
                    companyName,
                    symbol,
                    primaryExchange,
                    price,
                    volume,
                    marketCap,
                    change,
                    changePercent,
                    outstandingShares
                });
            }).catch(e => {
                reject();
            });
        });
    }
    // https://iexcloud.io/docs/api/#error-codes
    static getErrorText(code) {
        if (!code) {
            return "Something went wrong while getting stock information.";
        }

        if (code === 404) {
            return "Looks like we don't have any data for this symbol yet";
        }
        else if ([400, 401, 402, 403].includes(code)) {
            return `Something went wrong while getting stock information.
If this continues to happen, please let us know about it on the support page`;
        }
        else if (code === 429 || code === 500) {
            return "Something went wrong while getting stock information. Please try again in a few seconds";
        }
        else {
            if (navigator && !navigator.onLine) {
                return "Something went wrong while getting stock information. Please check your connection";
            }
            else {
                return "Something went wrong while getting stock information.";
            }
        }
    }
}

const animations = {
    opening: [
        {opacity: 0},
        {opacity: 1, offset: 0.75},
        {opacity: 1}
    ],
    closing: [
        {opacity: 1},
        {opacity: 0, offset: 0.75},
        {opacity: 0}
    ]
};

class StiqurPopup {
    constructor(parentElement) {
        this.createElement();
        // this.element.classList.add("data-unavailable");

        if (parentElement) {
            parentElement.append(this.element);
        }

        this.element.style.visibility = "hidden";
    }

    createHeaderElement() {
        this.headerEl = document.createElement("div");
        this.headerEl.classList.add("header");

        this.companyIdentifierEl = document.createElement("div");
        this.companyIdentifierEl.classList.add("company-identifier");

        this.logoContainerEl = document.createElement("div");
        this.logoContainerEl.setAttribute("id", "logo-container");

        this.companyLogoEl = document.createElement("img");
        this.companyLogoEl.classList.add("company-logo");
        this.companyLogoEl.setAttribute("aria-label", "Company Logo");

        this.companyNameEl = document.createElement("span");
        this.companyNameEl.classList.add("company-name");
        this.companyNameEl.setAttribute("aria-label", "Company Name");

        this.companySymbolEl = document.createElement("span");
        this.companySymbolEl.classList.add("symbol");


        this.companyLogoEl.addEventListener("load", () => {
            this.headerEl.classList.remove("no-logo");
        });

        this.companyLogoEl.addEventListener("error", () => {
            if (this.companyLogoEl.complete && this.companyLogoEl.naturalHeight === 0) {
                this.headerEl.classList.add("no-logo");
            }
        });

        this.shareEl = document.createElement("button");
        this.shareEl.classList.add("share-button");
        this.shareEl.textContent = "Share";

        this.shareEl.addEventListener("click", () => this.shareButtonHandler());

        this.twitterLogo = document.createElement("img");
        this.twitterLogo.classList.add("twitter-logo");
        const twitterLogoUrl = chrome.extension.getURL("popup/twitter.svg");
        this.twitterLogo.setAttribute("src", twitterLogoUrl);
        this.shareEl.prepend(this.twitterLogo);

        this.companyIdentifierEl.append(this.companyNameEl, this.companySymbolEl);

        this.logoContainerEl.append(this.companyLogoEl);

        this.headerEl.append(
            this.logoContainerEl, this.companyIdentifierEl,
            this.shareEl
        );
    }
    createContentElement() {
        this.contentEl = document.createElement("div");
        this.contentEl.classList.add("content");

        this.priceContainerEl = document.createElement("div");
        this.priceContainerEl.classList.add("price-container");

        this.priceEl = document.createElement("span");
        this.priceEl.classList.add("price");
        this.priceEl.textContent = "$0.00";
        this.priceEl.setAttribute("aria-label", "Stock Price");

        this.priceChangeEl = document.createElement("span");
        this.priceChangeEl.classList.add("price-change");
        this.priceChangeEl.setAttribute("aria-label", "Stock Price Change");

        this.priceContainerEl.append(this.priceEl, this.priceChangeEl);

        this.statsEl = document.createElement("ul");
        this.statsEl.classList.add("stats");
        this.statsEl.setAttribute("aria-label", "Additional Market Stats");

        this.marketCapTitleEl = document.createElement("span");
        this.marketCapTitleEl.classList.add("stat-title");
        this.marketCapTitleEl.textContent = "Market Cap";

        this.marketCapEl = document.createElement("span");
        this.marketCapEl.classList.add("stat");
        this.marketCapEl.setAttribute("aria-label", "Market Cap");

        this.volumeTitleEl = document.createElement("span");
        this.volumeTitleEl.classList.add("stat-title");
        this.volumeTitleEl.textContent = "Volume (24hr)";

        this.volumeEl = document.createElement("span");
        this.volumeEl.classList.add("stat");
        this.volumeEl.setAttribute("aria-label", "Volume");

        this.sharesTitleEl = document.createElement("span");
        this.sharesTitleEl.classList.add("stat-title");
        this.sharesTitleEl.textContent = "Shares Outstanding";

        this.sharesEl = document.createElement("span");
        this.sharesEl.classList.add("stat");
        this.sharesEl.setAttribute("aria-label", "Outstanding Shares");

        this.statsEl.append(
            this.marketCapTitleEl, this.marketCapEl,
            this.volumeTitleEl, this.volumeEl,
            this.sharesTitleEl, this.sharesEl
        );

        this.contentEl.append(this.priceContainerEl, this.statsEl);
    }
    createFooterElement() {
        this.footerEl = document.createElement("div");
        this.footerEl.classList.add("footer");

        this.apiAttributionEl = document.createElement("a");
        this.apiAttributionEl.classList.add("attribution");
        this.apiAttributionEl.textContent = "Data provided by IEX Cloud";
        this.apiAttributionEl.setAttribute("href", "https://iexcloud.io");
        this.apiAttributionEl.setAttribute("target", "_blank");
        this.apiAttributionEl.setAttribute("rel", "noopener noreferrer");

        this.stiqurLogoEl = document.createElement("img");

        let logoUrl = chrome.extension.getURL("popup/stiqur_logo_fit.png");

        this.stiqurLogoEl.setAttribute("src", logoUrl);
        this.stiqurLogoEl.classList.add("stiqur-logo");
        this.stiqurLogoEl.setAttribute("alt", "Stiqur Logo");

        this.footerEl.append(
            this.apiAttributionEl, this.stiqurLogoEl
        );
    }
    createLoaderElement() {
        this.loaderContainer = document.createElement("div");
        this.loaderContainer.setAttribute("id", "loader-container");
        const loaderUrl = chrome.extension.getURL("popup/stiqur_load.svg");

        this.loaderElement = document.createElement("img");
        this.loaderElement.setAttribute("src", loaderUrl);
        this.loaderElement.setAttribute("id", "loader");

        this.loaderContainer.append(this.loaderElement);
    }
    createErrorElement() {
        this.errorContainerEl = document.createElement("div");
        this.errorContainerEl.setAttribute("id", "error-container");

        this.errorHeader = document.createElement("span");
        this.errorHeader.classList.add("error-header");

        this.errorText = document.createElement("span");
        this.errorText.classList.add("error-text");

        this.errorContainerEl.append(this.errorHeader, this.errorText);

        this.element.append(this.errorContainerEl);
    }
    createElement() {
        this.element = document.createElement("div");
        this.element.setAttribute("id", "stiqur-popup");
        this.element.setAttribute("aria-label", "Stiqur Popup");

        this.createHeaderElement();
        this.createContentElement();
        this.createFooterElement();
        this.createLoaderElement();
        this.createErrorElement();

        this.contentContainerEl = document.createElement("div");
        this.contentContainerEl.setAttribute("id", "content-container");

        this.contentContainerEl.append(
            this.headerEl, this.contentEl, this.footerEl
        );

        this.element.append(this.contentContainerEl, this.loaderContainer);
    }

    open() {
        return new Promise((resolve, reject) => {
            this.closePopup = false;
            this.element.style.visibility = "visible";

            const anim = this.element.animate(
                animations.opening,
                {duration: 200, easing: "ease-in-out"}
            );

            anim.addEventListener("finish", () => {
                this.element.style.pointerEvents = "auto";
                resolve();
            });
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this.closePopup = true;
            this.element.style.pointerEvents = "none";
            const anim = this.element.animate(
                animations.closing,
                {duration: 200, easing: "ease-in-out"}
            );

            anim.addEventListener("finish", () => {
                if (this.closePopup) {
                    this.element.style.visibility = "hidden";
                }
                resolve();
            });
        });
    }

    positionAroundElement(element, spacing = 20) {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const popup = this.element;

        const elDimensions = element.getBoundingClientRect();

        const elementMiddle = (elDimensions.left + elDimensions.width / 2);
        const popupLeft = (elementMiddle - popup.offsetWidth / 2);

        this.element.style.left = popupLeft + "px";

        if (popupLeft < spacing) {
            this.element.style.left = spacing + "px";
        }
        else if (popupLeft + popup.offsetWidth > windowWidth - spacing) {
            this.element.style.left = 
                (windowWidth - popup.offsetWidth - spacing) + "px";
        }

        const popupTop = elDimensions.top - popup.offsetHeight - spacing;

        this.element.style.top = popupTop + "px";

        const bottomHeightRemaining =
            windowHeight - elDimensions.top - elDimensions.height -
            popup.offsetHeight;
            
        if (this.isLoading && elDimensions.top - (Math.max(popup.offsetHeight, 210)) - spacing < spacing) {
            this.element.style.top =
                (elDimensions.top + elDimensions.height + spacing) + "px";
        }
        else if (popupTop < spacing && bottomHeightRemaining > popup.offsetHeight + popupTop) {
            this.element.style.top =
                (elDimensions.top + elDimensions.height + spacing) + "px";
        }
    }

    loadSymbolData(json) {
        this.loadedSymbol = json.symbol;
        this.setCompanyName(json.companyName);

        const logoUrl = IexApi.getSymbolLogo(json.symbol);
        this.setCompanyLogo(logoUrl);
        this.setCompanySymbol(json.symbol, json.primaryExchange);

        this.setPrice(json.price);
        this.setPriceChange(json.change, json.changePercent);

        this.setMarketCap(json.marketCap);
        this.setVolume(json.volume);
        this.setSharesOutstanding(json.outstandingShares);

        this.element.classList.remove("data-unavailable");
    }

    fetchAndLoadSymbol(symbol) {
        return new Promise((resolve, reject) => {
            IexApi.getSymbolInformation(symbol).then(info => {
                this.loadSymbolData(info);

                this.element.classList.remove("data-unavailable");
                resolve(info);
                
                // console.log(info);

            }).catch(() => {
                this.setAsUnavailable(symbol, "Unable to retrieve stock data");
                reject();
            });
        });
    }

    clearData() {
        this.loadSymbolData({
            change: null,
            changePercent: null,
            companyName: "",
            marketCap: 0,
            outstandingShares: 0,
            price: 0,
            primaryExchange: "",
            symbol: "",
            volume: 0
        });

        this.companyNameEl.textContent = "";
        this.marketCapEl.textContent = "";
        this.volumeEl.textContent = "";
        this.sharesEl.textContent = "";
    }

    setLoading(val) {
        if (val) {
            this.element.classList.add("loading");
        }
        else {
            this.element.classList.remove("loading");
        }
    }

    setAsAvailable() {
        this.element.classList.remove("data-unavailable");
    }
    setAsUnavailable(symbol, text) {
        this.errorHeader.textContent = "Unable to retrieve stock information";
        this.errorText.textContent = text;

        this.element.classList.add("data-unavailable");
        this.setLoading(false);
    }

    setCompanyLogo(url) {
        this.companyLogoEl.setAttribute("src", "");
        this.companyLogoEl.setAttribute("src", url);
    }
    setCompanyName(name) {
        const value = name ? name : "Unavailable";
        this.companyNameEl.setAttribute("title", value);
        this.companyNameEl.textContent = value;
    }
    setCompanySymbol(symbol, exchange) {
        let value = "";

        if (symbol && exchange) {
            value = `$${symbol} (${exchange})`;
        }
        else if (symbol) {
            value = "$" + symbol;
        }

        this.companySymbolEl.textContent = value;
    }
    setPrice(price) {
        const value = price ? price.toLocaleString(
            undefined,
            {
                "minimumFractionDigits": 2,
                "maximumFractionDigits": 2
            }
        ) : "0.00";

        if (price < 10) {
            this.setPriceFontSizes("3.3rem", "1rem");
        }else if (price < 100) {
            this.setPriceFontSizes("3.2rem", "1rem");
        }
        else if (price < 1000) {
            this.setPriceFontSizes("3rem", "1rem");
        }
        else if (price < 10000) {
            this.setPriceFontSizes("2.7rem", "1rem");
        }
        else if (price < 100000) {
            this.setPriceFontSizes("2.5em", "1rem");
        }
        else if (price < 1000000) {
            this.setPriceFontSizes("2.2em", "1rem");
        }
        else {
            this.setPriceFontSizes("2rem", "1rem");
        }

        this.priceEl.textContent = `$${value}`;
    }
    setPriceFontSizes(priceSize = "2.5rem", changeSize = "1rem") {
        this.priceContainerEl.style.setProperty("--price-font-size", priceSize);
        this.priceContainerEl.style.setProperty("--change-font-size", changeSize);
    } 
    setPriceChange(shareChange, percentChange) {

        if (shareChange !== 0 && !shareChange) {
            this.priceChangeEl.textContent = "";
            return;
        }

        let value = "";

        const symbol = shareChange >= 0 ? "+" : "";
        value += symbol + shareChange.toLocaleString(
            undefined,
            {
                "minimumFractionDigits": 2,
                "maximumFractionDigits": 2
            }
        );

        if (percentChange || percentChange === 0) {
            value += ` (${symbol}${percentChange.toFixed(2)}%)`;
        }

        if (shareChange < 0) {
            this.priceChangeEl.classList.add("down");
        }
        else {
            this.priceChangeEl.classList.remove("down");
        }

        this.priceChangeEl.textContent = value;
    }
    setMarketCap(cap) {
        const value = cap ? "$" + abbreviateNumber(cap) : "Unavailable";
        this.marketCapEl.textContent = value;
    }
    setVolume(volume) {
        const value = volume ? abbreviateNumber(volume) : "Unavailable";
        this.volumeEl.textContent = value;
    }
    setSharesOutstanding(outstanding) {
        const value = outstanding ? outstanding.toLocaleString() : "Unavailable";
        this.sharesEl.textContent = value;
    }

    shareButtonHandler() {
        // https://github.com/tsayen/dom-to-image/issues/69#issuecomment-486146688
        const node = this.element;
        const scale = 2;

        const options = {
            // The width and height are slightly too small and cut off
            // the rounded edges without adding 2
            width: (node.offsetWidth + 2) * scale,
            height: (node.offsetHeight + 2) * scale,

            style: {
                position: "static",
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                width: node.offsetWidth + "px",
                height: node.offsetHeight + "px"
            }
            // bgcolor: "white"
        };

        // Company logo must be changed because the Google storage endpoint does
        // not allow CORS

        const previousLogoUrl = this.companyLogoEl.getAttribute("src");

        this.companyLogoEl.src = 
            "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
        // popup.companyLogoEl.remove();
        this.headerEl.classList.add("no-logo");
        this.shareEl.style.display = "none";
        
        domtoimage.toBlob(node, options).then(blob => {

                // const img = new Image();
                // img.src = window.URL.createObjectURL(blob);
                // img.style.width = "50%";
                this.headerEl.classList.remove("no-logo");
                this.shareEl.style.display = "flex";
                // document.body.appendChild(img);

                this.companyLogoEl.src = previousLogoUrl;

                this.close();

                let editor = document.querySelector(".public-DraftEditor-content");

                if (editor) {
                    pasteImageIntoEditor(editor, blob);
                }
                else {

                    document.querySelector("a[href=\"/compose/tweet\"]").click();

                    waitForEditor().then(editor => {
                        pasteImageIntoEditor(editor, blob);
                    });

                }

                // window.open("https://twitter.com/intent/tweet?text=This%20is%20an%20example%20of%20a%20pre-written%20tweet-%20don%27t%20forget%20that%20it%20needs%20to%20be%20less%20than%20280%20characters...", "_blank");
            }).catch(error => {
                this.headerEl.classList.remove("no-logo");
                this.shareEl.style.display = "flex";
                this.companyLogoEl.src = previousLogoUrl;
                console.error("Something went wrong while generating popup image", error);
            });
    }

    get isOpen() {
        return this.element.style.visibility !== "hidden";
    }
    get isLoading() {
        return this.element.classList.contains("loading");
    }
}

function waitForEditor() {
    return new Promise((resolve, reject) => {
        let tries = 0;
        let editor;
        const tryId = setInterval(() => {
            editor = document.querySelector(".public-DraftEditor-content");

            if (editor) {
                resolve(editor);
                clearInterval(tryId);
            }
            else if (tries > 30) {
                reject();
                clearInterval(tryId);
            }
            tries++;
        }, 200);
    });
}

function pasteImageIntoEditor(editorElement, imageData) {
    const dataTransfer = new DataTransfer();
    const pasteEvent = new ClipboardEvent("paste", {bubbles: true, clipboardData: dataTransfer});

    const file = new File([imageData], "image.png", {type: "image/png"});

    pasteEvent.clipboardData.items.add(file);
    editorElement.dispatchEvent(pasteEvent);
}

function abbreviateNumber(num) {
    if (num === 0) {
        return "0";
    }
    else if (num < 1000) {
        return num.toString();
    }
    else if (num >= 1000 && num <= 1000000) {
        return (num / 1000).toFixed(2) + " Thousand";
    }
    else if (num >= 1000000 && num <= 1000000000) {
        return (num / 1000000).toFixed(2) + " Million";
    }
    else if (num >= 1000000000 && num <= 1000000000000) {
        return (num / 1000000000).toFixed(2) + " Billion";
    }
    else {
        return (num / 1000000000000).toFixed(2) + " Trillion";
    }
}


// TODO: Once the local storage space is full we should optionally ask for the
// unlimitedStorage permission. Also, symbols in the cache older than X days should
// be removed to preserve space (if close-ish to reaching the limit anyway)

// TODO: Move all of the tooltip-related functionality out of the main file
// and make it less messy


// DONE:

// TODO: When data cannot be found, the popup is really ugly and not useful (just text
// with no explanation as to what went wrong)
// TODO: Handle network errors / communicate failure

// FIXME: Moving from a symbol that has a logo to one that doesn't causes
// a little flicker (presumably because it has to check to make sure the url
// is still 404 and so can't cache it)

// FIXME: Moving to another symbol that isn't cached causes a flicker with
// the icon

// TODO: There should be a loading animation so that users on slower
// connections don't think that the extension isn't working

// FIXME: On slow network connections, the mouse might be off of
// the symbol by the time the data finally comes in. This causes
// popup to open seemingly at random

// FIXME: On mouseover, there should be a small delay before actually
// fetching the data so that we don't spam the IEX API if the mouse
// quickly goes over a lot of symbols. Also makes it less likely to open
// the popup when you didn't mean to

// FIXME: Sometimes the popup does not close (usually when the mouse goes
// off the page)

// TODO: When you hover over the ticker symbol and the preview card with the
// information pops up, as soon as you move the mouse, the card goes away.
// Initially, I think we programmed a bit of delay in the card going away
// and I think we had it so that if you moved the cursor from the ticker
// symbol and onto the preview card itself, the card kept showing
// (again, we got this idea from how native twitter pop up cards work, if you
// hover over a profile name and you move the cursor onto the card, the card
// keeps showing, until you move your cursor away from the card and name itself)

// TODO: If a request for a symbol is made while one is already out,
// reuse the previous one

// TODO: Make sure text case of a symbol does not affect anything

const popup = new StiqurPopup(document.body);
const pendingRequests = {};
// How long cached symbol data will be allowed
// to remain before a new request is made to the API
const DATA_REFRESH_THRESHOLD_MSEC = 5 * 60 * 1000;
const OPEN_DELAY_MSEC = 600;
const CLOSE_DELAY_MSEC = 400;

function isCashtagElement(element) {
    const text = element.textContent;

    return element.tagName === "A" &&
        text.startsWith("$") &&
        text.indexOf("$", 1) === -1 &&
        text.length < 8 && text.length > 1;
}

function cacheSymbolData(json) {
    // console.log("Caching symbol data", json);

    const data = {};
    data[json.symbol] = json;
    json.timestamp = Date.now();

    if ("symbol" in json) {
        chrome.storage.local.set(data, () => {
            // console.log("Symbol data has been cached", json);
            if (json.symbol in pendingRequests) {
                delete pendingRequests[json.symbol];
            }
        });
    }
    else {
        delete pendingRequests[json.symbol];
        throw new Error(`Symbol data missing "symbol" key`);
    }
}

function shouldRefreshData(timestamp) {
    return Date.now() - timestamp >= DATA_REFRESH_THRESHOLD_MSEC;
}

function loadSymbol(symbol, symbolElement, openId) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([symbol], result => {
            if (symbol in result && !shouldRefreshData(result[symbol].timestamp)) {
                // console.log("Using cached data for " + symbol, popup.isOpen, popup.element.style.visibility);
                
                if (popup.openId === openId) {
                    popup.loadSymbolData(result[symbol]);
                    popup.positionAroundElement(symbolElement);
                    popup.open();
                }

                resolve();
            }
            else {

                popup.setLoading(true);
                popup.setAsAvailable();
                popup.positionAroundElement(symbolElement);
                popup.open();
                // console.log("Fetching and then caching...");
                // console.log("Fetching data for " + symbol, result);

                let req;
                let reusedPending = false;

                // console.log("Pending requests", pendingRequests);

                if (symbol in pendingRequests) {
                    req = pendingRequests[symbol];
                    reusedPending = true;
                }
                else {
                    req = IexApi.getSymbolInformation(symbol);
                    pendingRequests[symbol] = req;
                }

                req.then(info => {
                    // console.log("data came in");
                    if (popup.openId === openId) {
                        popup.loadSymbolData(info);
                        popup.setAsAvailable();
                        popup.positionAroundElement(symbolElement);
                    }

                    if (!reusedPending) {
                        cacheSymbolData(info);
                    }

                    resolve();
                }).catch(e => {
                    delete pendingRequests[symbol];
                    if (popup.openId === openId) {

                        const errorText = IexApi.getErrorText(e);

                        popup.setAsUnavailable(
                            symbol,
                            errorText
                        );
                        popup.positionAroundElement(symbolElement);
                    }
                    reject(e);
                });
            }
        });
    });
}

popup.element.addEventListener("mouseover", () => {
    if (popup.closeId !== null) {
        clearTimeout(popup.closeId);
        popup.closeId = null;
    }
});

popup.element.addEventListener("mouseleave", () => {
    if (popup.closeId !== null) {
        clearTimeout(popup.closeId);
        popup.closeId = null;
    }

    const closeId = setTimeout(() => {
        if (popup.closeId === closeId) {
            popup.close();
            popup.closeId = null;
        }
    }, CLOSE_DELAY_MSEC);
    popup.closeId = closeId;
});

document.addEventListener("mouseover", e => {
    const target = e.target;
    const text = target.textContent;

    if (isCashtagElement(target)) {
        const symbol = text.substring(1).toUpperCase();

        const openId = setTimeout(() => {
            // console.log("Opening if the openId is still", openId);

            if (popup.openId === openId) {
                // console.log("Opening for", symbol);

                // popup.setLoading(true);
                // popup.positionAroundElement(target);
                // popup.open();

                const closePopup = function() {
                    if (popup.closeId !== null) {
                        clearTimeout(popup.closeId);
                    }

                    const closeId = setTimeout(() => {
                        if (popup.closeId === closeId) {
                            popup.close();
                            popup.closeId = null;
                        }
                    }, CLOSE_DELAY_MSEC);
                    popup.closeId = closeId;
                };

                // console.log(popup.openId);
                loadSymbol(symbol, target, openId).then(() => {
                    target.removeEventListener("mouseleave", mouseOffBeforeLoad, {passive: true, once: true});
                    if (popup.openId !== openId) {
                        return;
                    }

                    // console.log("Loading...", symbol, popup.openId, openId);

                    target.addEventListener("mouseleave", closePopup, {passive: true, once: true});
                    console.log(popup.companyLogoEl.complete);
                    if (!popup.companyLogoEl.complete) {

                        popup.companyLogoEl.style.opacity = "0";

                        const ready = function() {
                            popup.setLoading(false);
                            popup.positionAroundElement(target);
                            popup.companyLogoEl.style.opacity = "1";

                            popup.companyLogoEl.removeEventListener("error", error, {passive: true, once: true});
                        };

                        const error = function() {
                            if (popup.companyLogoEl.complete && popup.companyLogoEl.naturalHeight === 0) {
                                popup.setLoading(false);
                                popup.positionAroundElement(target);
                            }

                            popup.companyLogoEl.style.opacity = "1";
                            popup.companyLogoEl.removeEventListener("load", ready, {passive: true, once: true});
                        };

                        popup.companyLogoEl.addEventListener("load", ready, {passive: true, once: true});
                        popup.companyLogoEl.addEventListener("error", error, {passive: true, once: true});
                    }
                    else {
                        popup.setLoading(false);
                        popup.positionAroundElement(target);
                    }
                }).catch(() => {
                    target.removeEventListener("mouseleave", mouseOffBeforeLoad, {passive: true, once: true});
                    target.addEventListener("mouseleave", closePopup, {passive: true, once: true});
                });
            }

        }, OPEN_DELAY_MSEC);
        if (popup.openId) {
            clearTimeout(popup.openId);
        }
        popup.openId = openId;

        const mouseOffBeforeLoad = function() {
            console.log("mouseoff before load", openId, popup.openId, symbol, popup.loadedSymbol, popup.closeId);
            if (popup.isLoading && popup.closeId === null) {
                popup.closeId = 1;
                popup.close().then(() => {
                    popup.closeId = null;
                });
            }
            popup.openId = null;
            clearTimeout(openId);
        };

        target.addEventListener("mouseleave", mouseOffBeforeLoad, {passive: true, once: true});

        // console.log(symbol);
       
    }
}, {passive: true});

const amd = document.getElementById("AMD");

// popup.positionAroundElement(amd);
// popup.setLoading(true);
// popup.open();

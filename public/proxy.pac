function FindProxyForURL(url, host) {
    PROXY = "PROXY 1.2.3.4"

    // Apple.com via proxy
    if (shExpMatch(host,"*.apple.com")) {
        return PROXY;
    }
    // Everything else directly!
    return "DIRECT";
}
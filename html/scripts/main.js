document.addEventListener("DOMContentLoaded", async () => {
    let {hostname, url} = await getCurrentTabDomain(),
        txtIDEKey = document.querySelector("#txtKey"),
        btnTrigger = document.querySelector('#btnTrigger'),
        settings = {
            hosts: [],
        };

    let storage = await new Promise(resolve => {
            chrome.storage.local.get(["config"], result => {
                resolve(result);
            });
        });

    if (storage["config"]) {
        settings = storage["config"];
    }

    let currentHost = settings.hosts.find(host => host.name === hostname);

    if (!currentHost || !currentHost.status) {
        setDisabled(btnTrigger);
    } else {
        setEnabled(btnTrigger);
        txtIDEKey.value = currentHost.idekey;
    }

    btnTrigger.addEventListener("click", () => {
        if (btnTrigger.classList.contains("enable")) {
            setEnabled(btnTrigger);

            const ideKey = txtIDEKey.value;
    
            if (currentHost) {
                currentHost.idekey = ideKey;
                currentHost.status = true;
            } else {
                currentHost = {
                    name: hostname,
                    idekey: ideKey,
                    status: true,
                };

                settings.hosts.push(currentHost);
            }

            chrome.cookies.set({
                "name": "XDEBUG_SESSION",
                "url": url,
                "domain": hostname,
                "value": ideKey
            });
        } else {
            setDisabled(btnTrigger);

            chrome.cookies.set({
                "name": "XDEBUG_SESSION",
                "url": url,
                "domain": hostname,
                "value": null
            });

            currentHost.status = false;
        }
    });
});

async function getCurrentTabDomain() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({active: true}, tabs => {
            const url = tabs[0].url;
            const matchUrl = url.match(new RegExp(/http(s?):\/\/[a-z-1-9]+([.]?[a-z]{1,3})?/));

            resolve({
                hostname: url.substr(7).split("/")[0],
                url: matchUrl ? matchUrl[0] : "",
            });
        });
    });
}

function setEnabled(btnTrigger) {
    btnTrigger.classList.remove("enable");
    btnTrigger.classList.add("disable");
    btnTrigger.textContent = "Disable";
}

function setDisabled(btnTrigger) {
    btnTrigger.classList.remove("disable");
    btnTrigger.classList.add("enable");
    btnTrigger.textContent = "Enable";
}
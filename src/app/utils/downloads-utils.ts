import { DownloadLinksModel } from "../..";

export function stringifyLinks(selectedLinks: DownloadLinksModel) {
    return flatLinks(selectedLinks).join("\n");
}

export function flatLinks(selectedLinks: DownloadLinksModel) {
    const allLinks: string[] = [];
    selectedLinks.links.forEach(l => allLinks.push(...l));
    return allLinks;
}

export function parseLinks(txt: string) {
    const linksArray: string[][] = [];
    let hostArray: string[] = [];
    let prevHostName = "";
    txt.split("\n").forEach(link => {
        const currentHostname = this.getHostName(link);
        if (hostArray.length > 0 && prevHostName !== currentHostname) {
            linksArray.push(hostArray);
            hostArray = [];
        }
        const finalLink = link.trim();
        if (finalLink !== "") {
            hostArray.push(finalLink);
        }
        prevHostName = currentHostname;
    });
    if (hostArray.length > 0) {
        linksArray.push(hostArray);
    }
    return linksArray;
}

export function getHostName(url) {
    const l = document.createElement("a");
    l.href = url;
    const hostname = l.hostname;
    l.remove();
    return hostname;
}

export function removeFromArray(arr: any[], e) {
    const index = arr.indexOf(e);
    if (index > -1) {
        arr.splice(index, 1);
    }
}

export function copyText(text: string) {
    const input = document.createElement("textarea");
    input.textContent = text;
    document.body.appendChild(input);
    input.select();
    const successful = document.execCommand('copy');
    input.remove();
    alert(successful ? 'Copied' : 'Not copied');
}

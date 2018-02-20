import { DownloadLinks } from "../model/dl-links";

const handleError: JQuery.jqXHR.FailCallback<JQuery.jqXHR<any>> = (xhr, textStatus, error) => {
    if (textStatus) {
        console.error(textStatus);
    }
    if (error) {
        console.error(error);
    }
};

$.get("http://localhost:3000/api/downloads").done(function (data: DownloadLinks[]) {
    data.forEach(links => {
        $.get("http://localhost:3000/api/downloads/" + links._id).done(function (l: DownloadLinks) {
            console.log("download", l);
        }).fail(handleError);
    });
}).fail(handleError);

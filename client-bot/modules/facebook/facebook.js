"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Facebook;
(function (Facebook) {
    function checkEventType(url) {
        console.log('parse url: ' + url);
        let type = 'not found';
        let searchKeys = ['photo', '/videos/', 'story.php', '/events/'];
        for (let i = 0; i < searchKeys.length; i++) {
            console.log('Search key: ' + searchKeys[i]);
            let n = url.search(searchKeys[i]);
            if (n != -1) {
                if (searchKeys[i] == searchKeys[0])
                    type = 'photo_likes';
                else if (searchKeys[i] == searchKeys[1])
                    type = 'video_likes';
                else if (searchKeys[i] == searchKeys[2])
                    type = 'story_likes';
                else if (searchKeys[i] == searchKeys[3])
                    type = 'events_likes';
                break;
            }
        }
        console.log('Url Action type  --------> ' + type);
        return type;
    }
    Facebook.checkEventType = checkEventType;
})(Facebook = exports.Facebook || (exports.Facebook = {}));

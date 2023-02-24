import * as MongoClient from 'mongodb'
import * as  assert from 'assert';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import {Browser} from "../browser/browser";
import {ServerAPI} from "../../API/server-connect";
import {SETTINGS} from "../../../settings";

let ObjectId = require('mongodb').ObjectId;
let moment = require('moment');

let db = SETTINGS.DB_URL;
let appRef;

export module Storage {

    import sendEvent = ServerAPI.sendEvent;

    export function initStorage(app): void {
        appRef = app;
    }

    export function getNameData(collectionName): Observable<object> {

        return Observable.create(observer => {
            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                }
                else {
                    assert.equal(null, err);

                    let collection = db.collection(collectionName);

                    collection.findOne({}, (err, res) => {
                        if (err) {
                            console.log('@getSidData no sids found');
                            observer.complete();
                        }
                        observer.next(res);
                        db.close();
                    });
                }
            });
        });
    }


    export function getData(collectionName): Observable<object> {

        return Observable.create(observer => {

            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                    db.close();
                }
                else {
                    assert.equal(null, err);

                    let collection = db.collection(collectionName);

                    collection.find({}).toArray((err, res) => {
                        assert.equal(err, null);
                        observer.next(res[0]);
                        db.close();
                    });

                }
            });
        });
    }

    export function getTopGermanData(): Observable<object> {

        return Observable.create(observer => {
            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                    db.close();
                }
                else {
                    assert.equal(null, err);

                    getTopGermanNames(db, (res) => {
                        observer.next(res);
                        db.close();
                    });
                }
            });
        });
    }


    export function getSidData(query): Observable<object> {

        return Observable.create(observer => {

            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                    db.close();
                }
                else {
                    assert.equal(null, err);
                    let collection = db.collection('sids');
                    collection.findOne(query, (err, res) => {
                        if (err) {
                            console.log('@getSidData no sids found');
                            observer.complete();
                        }
                        observer.next(res);
                        db.close();
                    });
                }
            });
        });
    }

    export function storeActionUrl(url): Observable<object> {

        return Observable.create(observer => {

            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                    db.close();
                }
                else {
                    assert.equal(null, err);
                    let collection = db.collection('actionUrls');
                    collection.findOne({url: url}, (err, res) => {

                        console.log('RES: ', res);
                        if (res === null) {

                            collection.insert({
                                url: url,
                            }, (err, result) => {
                                console.log('Url not found, store');
                            });

                            observer.complete();
                        }
                        else {
                            console.log('Url already stored.');
                        }
                        observer.next(res);
                        db.close();
                    });
                }
            });
        });
    }

    export function getCityData(cityName): Observable<object> {

        return Observable.create(observer => {

            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                    db.close();
                }
                else {
                    assert.equal(null, err);
                    let collection = db.collection('city');
                    collection.findOne({
                        name: cityName
                    }, (err, res) => {
                        if (err) {
                            console.log('@getSidData no sids found');
                            observer.complete();
                        }
                        observer.next(res);
                        db.close();
                    });
                }
            });
        });
    }

    export function storeSidLocation(sid): Observable<object> {

        return Observable.create(observer => {
            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                    db.close();
                }
                else {
                    assert.equal(null, err);
                    console.log('@Saved sid ID: ', sid._id);
                    console.log('@Saved sid location: ', sid.location);

                    let collection = db.collection('sids');
                    collection.updateOne({_id: sid._id}
                        , {$set: {location: sid.location}}, (err, res) => {
                            observer.next(res);
                            db.close();
                        });
                }

            });
        });
    }

    export function storeimageUrls(sid): Observable<object> {

        return Observable.create(observer => {
            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                    db.close();
                }
                else {
                    assert.equal(null, err);
                    console.log('@Saved sid ID: ', sid._id);
                    console.log('@Saved sid imageArray: ', sid.imageUrls);

                    let collection = db.collection('sids');
                    collection.updateOne({_id: sid._id}
                        , {$set: {imageUrls: sid.imageUrls}}, (err, res) => {
                            observer.next(res);
                            db.close();
                        });
                }

            });
        });
    }

    export function getAllSidsData(query): Observable<object> {

        return Observable.create(observer => {

            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                    db.close();
                }
                else {
                    assert.equal(null, err);
                    let collection = db.collection('sids');
                    collection.find(query).toArray((err, res) => {
                        if (err) {
                            console.log('@getSidData no sids found');
                            observer.complete();
                        }

                        console.log('@found sids count: ', res.length);
                        observer.next(res);
                        db.close();
                    });
                }
            });
        });
    }

    export function getInitialPages(query, pagesCollection): Observable<object> {

        return Observable.create(observer => {

            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                    db.close();
                }
                else {
                    assert.equal(null, err);
                    let collection = db.collection(pagesCollection);
                    collection.findOne(query, (err, res) => {
                        if (err) {
                            console.log('@getSidData no pages found');
                            observer.complete();
                        }
                        observer.next(res);
                        db.close();
                    });
                }
            });
        });
    }

    export function updateInitialLikes(app): Observable<object> {

        return Observable.create(observer => {
            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                    db.close();
                }
                else {
                    assert.equal(null, err);
                    console.log('@Saved sid Initial Likes: ', app.userData._id);

                    sendEvent(app, true).subscribe(() => {
                    });

                    let collection = db.collection('sids');
                    collection.updateOne({_id: app.userData._id}, {$set: {haveInitialLikes: new Date()}}, (err, res) => {
                        observer.next(res);
                        db.close();
                    });
                }

            });
        });
    }

    export function updateVerifySid(id): Observable<object> {

        return Observable.create(observer => {
            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                    db.close();
                }
                else {
                    assert.equal(null, err);

                    appRef.sidVerify++;
                    let collection = db.collection('sids');
                    collection.updateOne({_id: id}
                        , {$set: {sidVerify: true}}, (err, res) => {
                            observer.next(res);
                            db.close();
                        });
                }

            });
        });
    }

    export function updateInfo(id): Observable<object> {

        return Observable.create(observer => {
            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                    db.close();
                }
                else {
                    assert.equal(null, err);

                    let collection = db.collection('sids');
                    collection.updateOne({_id: id}
                        , {$set: {updateInfo: new Date()}}, (err, res) => {
                            observer.next(res);
                            db.close();
                        });
                }

            });
        });
    }

    export function updateParsedLikes(id): Observable<object> {

        console.log('@UPDATE PAARSED SIDS: SID parsed:', id);
        return Observable.create(observer => {
            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                    db.close();
                }
                else {
                    assert.equal(null, err);

                    let parseDate = new Date();
                    console.log('@verificationDate: ', parseDate);
                    let collection = db.collection('sids');
                    collection.updateOne({_id: id}
                        , {
                            $set: {
                                parsedLikes: parseDate,
                            }
                        }, (err, res) => {
                            observer.next(res);
                            db.close();
                        });
                }

            });
        });
    }

    export function updateInitialShares(app): Observable<object> {

        console.log('@UPDATE Initial Shares:', app.userData._id);

        return Observable.create(observer => {
            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                    db.close();
                }
                else {
                    assert.equal(null, err);
                    sendEvent(app, true).subscribe(() => {
                    });
                    let collection = db.collection('sids');
                    collection.updateOne({_id: app.userData._id}
                        , {
                            $set: {
                                initialShares: new Date(),
                            }
                        }, (err, res) => {
                            observer.next(res);
                            db.close();
                        });
                }

            });
        });
    }

    export function updateCampaigns(sidID): Observable<object> {
        console.log('Updated : updateCampaigns dimana sidID', sidID);
        return Observable.create(observer => {
            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                    db.close();
                }
                else {
                    assert.equal(null, err);

                    let collection = db.collection('sids');
                    collection.updateOne({_id: sidID}

                        , {$set: {sg: 1}}, (err, res) => {
                            observer.next(res);
                            db.close();
                        });
                }

            });
        });
    }

    export function updateGame(sidID): Observable<object> {
        console.log('Updated : game', sidID);
        return Observable.create(observer => {
            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                    db.close();
                }
                else {
                    assert.equal(null, err);

                    let collection = db.collection('sids');
                    collection.updateOne({_id: sidID}

                        , {$set: {game: 1}}, (err, res) => {
                            observer.next(res);
                            db.close();
                        });
                }

            });
        });
    }

    export function updateGroup(sidID): Observable<object> {

        return Observable.create(observer => {
            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                    db.close();
                }
                else {
                    assert.equal(null, err);

                    let collection = db.collection('sids');
                    collection.updateOne({_id: sidID}

                        , {$set: {group: 2}}, (err, res) => {
                            observer.next(res);
                            db.close();
                        });
                }

            });
        });
    }

    export function updateGroupInvited(sidID): Observable<object> {

        return Observable.create(observer => {
            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                    db.close();
                }
                else {
                    assert.equal(null, err);
                    console.log('updateGroupInvited: ', sidID);
                    let collection = db.collection('sids');
                    collection.updateOne({_id: sidID}

                        , {$set: {groupInvited: 2}}, (err, res) => {
                            observer.next(res);
                            db.close();
                        });
                }

            });
        });
    }


    export function updateStartShares(sidID): Observable<object> {

        return Observable.create(observer => {
            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                    db.close();
                }
                else {
                    assert.equal(null, err);
                    let collection = db.collection('sids');
                    collection.updateOne({_id: sidID}
                        , {$set: {startShares: new Date()}}, (err, res) => {
                            observer.next(res);
                            db.close();
                        });
                }

            });
        });
    }

    export function updateInitialFriends(id): Observable<object> {

        return Observable.create(observer => {
            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                    db.close();
                }
                else {
                    assert.equal(null, err);
                    console.log('@Saved sid Initial Friends: ', id);

                    let collection = db.collection('sids');
                    collection.updateOne({_id: id}
                        , {$set: {haveInitialFriends: 1}}, (err, res) => {
                            observer.next(res);
                            db.close();
                        });
                }

            });
        });
    }

    export function updateLastAddFriends(id): Observable<object> {

        return Observable.create(observer => {
            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                    db.close();
                }
                else {
                    assert.equal(null, err);
                    console.log('@Saved sid updateLastAddFriends: ', id);

                    let collection = db.collection('sids');
                    collection.updateOne({_id: id}
                        , {$set: {lastAddFriends: new Date()}}, (err, res) => {
                            observer.next(res);
                            db.close();
                        });
                }

            });
        });
    }

    export function settings(id): Observable<object> {

        return Observable.create(observer => {
            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                    db.close();
                }
                else {
                    assert.equal(null, err);
                    console.log('@Saved sid updateLastAddFriends: ', id);

                    let collection = db.collection('sids');
                    collection.updateOne({_id: id}
                        , {$set: {settings: new Date()}}, (err, res) => {
                            observer.next(res);
                            db.close();
                        });
                }

            });
        });
    }

    export function getCampaigns(query): Observable<object> {

        return Observable.create(observer => {
            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                }
                else {
                    assert.equal(null, err);
                    let collection = db.collection('campaigns');
                    collection.findOne(query, (err, res) => {
                        if (err) {
                            console.log('@getCampaigns no campaigns found');
                            observer.complete();
                        }
                        observer.next(res);
                        db.close();
                    });
                }
            });
        });
    }

    export function getSidByID(id): Observable<object> {

        return Observable.create(observer => {

            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                }
                else {
                    assert.equal(null, err);

                    let collection = db.collection('sids');

                    console.log('@Search SID by id: ', id);
                    let o_id = new ObjectId(id);

                    collection.findOne({'_id': o_id}, (err, res) => {
                        if (err) {
                            console.log('@sid not found');
                            observer.complete();
                        }
                        observer.next(res);
                        db.close();
                    });

                }
            });
        });
    }

    export function getVKSidByID(id): Observable<object> {

        return Observable.create(observer => {

            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                }
                else {
                    assert.equal(null, err);

                    let collection = db.collection('vkSIDS');

                    console.log('@Search SID by id: ', id);
                    let o_id = new ObjectId(id);

                    collection.findOne({'_id': o_id}, (err, res) => {
                        if (err) {
                            console.log('@sid not found');
                            observer.complete();
                        }
                        observer.next(res);
                        db.close();
                    });

                }
            });
        });
    }

    export function getRandomSidData(query): Observable<object> {

        return Observable.create(observer => {

            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                    db.close();
                }
                else {
                    assert.equal(null, err);

                    db.collection('sids').count(query).then((n) => {

                        let r = Math.floor(Math.random() * n);

                        let collection = db.collection('sids');
                        let cursor = collection.find(query).skip(r).limit(1);

                        cursor.each((err, item) => {
                            observer.next(item);
                            observer.complete();
                            db.close();
                        });
                    });
                }
            });
        });
    }

    export function getRandomData(query, collectionName): Observable<object> {

        return Observable.create(observer => {

            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                }
                else {
                    assert.equal(null, err);

                    db.collection(collectionName).count(query).then((n) => {

                        let r = Math.floor(Math.random() * n);

                        let collection = db.collection(collectionName);
                        let cursor = collection.find(query).skip(r).limit(1);

                        cursor.each((err, item) => {
                            observer.next(item);
                            observer.complete();
                            db.close();
                        });
                    });
                }
            });
        });
    }

    export function updateSidData(app): Observable<object> {

        return Observable.create(observer => {

            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                }
                else {
                    console.log('updateSidData !');
                    assert.equal(null, err);
                    sendEvent(app, true).subscribe(() => {
                    });
                    let collection = db.collection('sids');
                    collection.updateOne({_id: app.userData._id}
                        , {
                            $set: app.userData
                        }, (err, res) => {
                            observer.next(res);
                            db.close();
                        });
                }

            });
        });
    }


    export function updateSidCookie(app, cookieData): Observable<object> {

        return Observable.create(observer => {
            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                }
                else {
                    assert.equal(null, err);

                    let collection = db.collection('sids');


                    if (cookieData == null) {
                        collection.updateOne({_id: app.userData._id}
                            , {
                                $set: {
                                    cookie: null
                                }
                            }, (err, res) => {
                                observer.next(res);
                                db.close();
                            });
                    }
                    else {
                        let facebookId = JSON.parse(cookieData)[0];
                        app.userData.lastLogin = new Date();

                        console.log('@cookie facebookID: ', facebookId.value);
                        console.log('@last login: ', app.userData.lastLogin);
                        collection.updateOne({_id: app.userData._id}
                            , {
                                $set: {
                                    lastLogin: app.userData.lastLogin,
                                    facebookID: facebookId.value,
                                    cookie: cookieData
                                }
                            }, (err, res) => {
                                observer.next(res);
                                db.close();
                            });
                    }

                }
            });
        });
    }

    export function updateSid(sid): Observable<object> {

        return Observable.create(observer => {
            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                }
                else {
                    assert.equal(null, err);
                    console.log('@SID Updated');
                    let collection = db.collection('sids');
                    collection.updateOne(
                        {
                            _id: sid['_id']
                        }
                        , {
                            $set: sid
                        }, (err, res) => {
                            observer.next(res);
                            db.close();
                        });
                }
            });
        });
    }

    export function updateSidProfilePhoto(app): Observable<object> {


        return Observable.create(observer => {
            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                }
                else {
                    assert.equal(null, err);

                    console.log('@Saved sid profile photo, ID: ', app.userData._id);
                    sendEvent(app, true).subscribe(() => {
                    });

                    let SIDsCollection = db.collection('sids');

                    SIDsCollection.updateOne({_id: app.userData._id}
                        , {
                            $set: {
                                VKSIDID: app.VKSIDData._id,
                                haveProfilePhoto: true
                            }
                        }, (err, res) => {
                            observer.next(res);
                            db.close();
                        });


                    let VKSIDSCollection = db.collection('vkSIDS');

                    VKSIDSCollection.updateOne({_id: app.VKSIDData._id,}
                        , {
                            $set: {
                                SIDID: app.userData._id,
                            }
                        }, (err, res) => {
                            observer.next(res);
                            db.close();
                        });

                }

            });
        });
    }

    export function updateSidID(id, SidID): Observable<object> {

        return Observable.create(observer => {
            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                }
                else {
                    assert.equal(null, err);

                    console.log('@Saved Social Bot to API SidID: ', SidID);

                    let collection = db.collection('sids');
                    collection.updateOne({_id: id}
                        , {$set: {sidID: SidID}}, (err, res) => {
                            observer.next(res);
                            db.close();
                        });
                }
            });
        });
    }

    export function haveInitialPhotos(app): Observable<object> {

        return Observable.create(observer => {
            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                }
                else {
                    assert.equal(null, err);

                    console.log('@Saved sid InitialPhotos photo, ID: ', app.userData._id);

                    sendEvent(app, true).subscribe(() => {
                    });

                    let collection = db.collection('sids');
                    let date = new Date();

                    collection.updateOne({_id: app.userData._id}
                        , {$set: {haveInitialPhotos: date}}, (err, res) => {
                            observer.next(res);
                            db.close();
                        });
                }

            });
        });
    }

    export function updateSidCoverPhoto(app): Observable<object> {

        return Observable.create(observer => {
            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                }
                else {
                    assert.equal(null, err);
                    sendEvent(app, true).subscribe(() => {
                    });
                    console.log('@Saved sid cover photo, ID: ', app.userData._id);
                    let collection = db.collection('sids');
                    collection.updateOne({_id: app.userData._id}
                        , {$set: {haveCoverPhoto: true}}, (err, res) => {
                            observer.next(res);
                            db.close();
                        });
                }
            });
        });
    }

    export function removeSid(SID): Observable<object> {


        console.log('@RemoveSid: ', SID._id);

        storeRemovedSID(SID);

        return Observable.create(observer => {

            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                }
                else {
                    assert.equal(null, err);
                    let collection = db.collection('sids');
                    collection.deleteOne({_id: SID._id}, (err, result) => {
                        console.log("Removed the document with the _id: ", SID._id);
                        observer.complete();
                        db.close();
                    });
                }
            });
        });
    }

    export function removeVKSid(vkSID, SID): Observable<object> {

        console.log('SID: ', SID._id);
        return Observable.create(observer => {

            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                }
                else {
                    assert.equal(null, err);

                    if (SID) {
                        let collectionSids = db.collection('sids');
                        console.log('Remove VKSID from sid: ', SID._id);
                        collectionSids.update({_id: SID._id}, {$unset: {VKSIDID: 1}}, {multi: false});
                    }

                    let collection = db.collection('vkSIDS');
                    collection.deleteOne({_id: vkSID._id}, (err, result) => {
                        console.log("Removed VK SID with id _id: ", vkSID._id);
                        observer.complete();
                        db.close();
                    });

                }
            });
        });
    }

    export function updateCampaignData(id, userArray, newQuantity): Observable<object> {

        return Observable.create(observer => {
            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                }
                else {
                    assert.equal(null, err);

                    let collection = db.collection('campaigns');
                    collection.updateOne({
                            _id: id
                        }
                        , {
                            $set: {
                                sids: userArray,
                                currentQuantity: newQuantity
                            }
                        }, (err, res) => {
                            observer.next(res);
                            db.close();
                        });
                }

            });
        });
    }


    export function storeSID(sid): void {

        MongoClient.connect(db, (err, db) => {
            if (err) {
                console.log('@DB Connection error, restart.');
                Browser.restart();
            }
            else {
                assert.equal(null, err);

                let collection = db.collection('sids');

                let registrationDate = new Date();
                console.log('@Sid registered on: ', registrationDate);
                sid.registrationDate = registrationDate;

                collection.insert(sid, (err, result) => {
                    if (err) console.log('Error');
                    if (result) console.log('storeSID: ', result);
                    console.log("Inserted SID");
                    db.close();
                });
            }
        });

    }

    export function storeVKSID(sid): void {

        MongoClient.connect(db, (err, db) => {
            if (err) {
                console.log('@DB Connection error, restart.');
                Browser.restart();
            }
            else {
                assert.equal(null, err);

                let collection = db.collection('vkSIDS');

                let registrationDate = new Date();
                console.log('@VK registered on: ', registrationDate);
                sid.registrationDate = registrationDate;

                collection.insert(sid, (err, result) => {
                    console.log("Inserted Sid");
                    db.close();
                });
            }
        });

    }

    export function storeIPData(data): void {

        MongoClient.connect(db, (err, db) => {
            if (err) {
                console.log('@DB Connection error, restart.');
                Browser.restart();
            }
            else {
                assert.equal(null, err);

                let collection = db.collection('ipdata');

                collection.findOne({"query": data.query, "provider": data.provider}, (err, res) => {

                    console.log('@ISP: ', res.isp + ' ID: ' + res.query);

                    if (res === null) {
                        data.registrationDate = new Date();
                        collection.insert(data, (err, result) => {
                            console.log("Inserted ipdata: ", result);
                            db.close();
                        });
                    }
                    else {
                        console.log('@IP + ISP Already exists');
                    }
                    db.close();
                });


            }
        });

    }

    export function getVKSIDData(query): Observable<object> {

        return Observable.create(observer => {

            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                }
                else {
                    assert.equal(null, err);
                    let collection = db.collection('vkSIDS');
                    collection.findOne(query, (err, res) => {
                        if (err) {
                            console.log('@getSidData no sids found');
                            observer.complete();
                        }
                        observer.next(res);
                        db.close();
                    });
                }
            });
        });
    }


    export function getVKCookie(): Observable<object> {

        return Observable.create(observer => {

            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                }
                else {
                    assert.equal(null, err);
                    let collection = db.collection('vkCookie');
                    collection.findOne({}, (err, res) => {
                        if (err) {
                            console.log('@getSidData no sids found');
                            observer.complete();
                        }
                        observer.next(res);
                        db.close();
                    });
                }
            });
        });
    }

    export function setVKCookie(cookie): Observable<object> {

        return Observable.create(observer => {

            MongoClient.connect(db, (err, db) => {
                if (err) {
                    console.log('@DB Connection error, restart.');
                    Browser.restart();
                }
                else {
                    assert.equal(null, err);
                    let collection = db.collection('vkCookie');
                    collection.updateOne({}
                        , {
                            $set: {
                                cookie: cookie
                            }
                        }, (err, res) => {
                            observer.next(res);
                            db.close();
                        });
                }
            });
        });
    }

    export function storeRemovedSID(sid): void {

        console.log('@Store Removed SID');

        MongoClient.connect(db, (err, db) => {
            if (err) {
                console.log('@DB Connection error, restart.');
                Browser.restart();
            }
            else {
                assert.equal(null, err);

                let collection = db.collection('removedSids');

                let removedDate = new Date();

                console.log('@Sid removed on: ', removedDate);
                sid.removedDate = removedDate;

                collection.insert(sid, (err, result) => {
                    console.log("Removed Sid");
                    db.close();
                });
            }

        });

    }

    function getTopGermanNames(db, callback): void {
        let collection = db.collection('topgermannames');
        collection.find({}).toArray((err, res) => {
            assert.equal(err, null);
            let names = res[0];
            callback(names);
        });
    }

}


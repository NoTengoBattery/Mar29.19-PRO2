/* Funciones que interactúan con la base de datos */
const neo4j = require('neo4j-driver'); /* El driver de JavaScript */

var dbDriver = neo4j.v1.driver("bolt://localhost", neo4j.v1.auth.basic("neo4j", "db1")); /* Conexión al driver */
var dbSession = dbDriver.session(); /* Sesión de peticiones */

module.exports = {
    MergeSomeUser: function (callback, SpotifyUser) {
        var TheUser = SpotifyUser.id;
        var UserPlusId = 'user' + TheUser;
        var UserIsPremium = ("premium".localeCompare(SpotifyUser.product) ? true : false);
        var UserAllowExplicit = (SpotifyUser.explicit_content.filter_enabled ? false : true);
        var User = dbSession.run(
            'MERGE (' + UserPlusId + ':User ' +
            '{userID: $id, ' +
            'userDisplayName: $name, ' +
            'isPremium: $premium, ' +
            'haveExplicit: $explicit, ' +
            'email: $email, ' +
            'country: $country}) ' +
            'RETURN ' + UserPlusId, {
                id: TheUser,
                name: SpotifyUser.display_name || TheUser,
                premium: UserIsPremium,
                explicit: UserAllowExplicit,
                email: SpotifyUser.email,
                country: SpotifyUser.country
            });
        User.then(function (result) {
            if (result.records.length == 0) {
                callback.negative(callback, SpotifyUser);
                callback.after(callback, SpotifyUser, false);
            } else {
                callback.positive(callback, SpotifyUser);
                callback.after(callback, SpotifyUser, true);
            }
        });
    },
    MergeSomeTrack: function (callback, SpotifyTrack) {
        var TheTrack = SpotifyTrack.id;
        var TrackPlusId = 'track' + TheTrack;
        var Track = dbSession.run(
            'MERGE (' + TrackPlusId + ':Track ' +
            '{trackID: $id, ' +
            'durationMs: $duration, ' +
            'isExplicit: $explicit, ' +
            'trackName: $name, ' +
            'popularity: $popularity}) ' +
            'RETURN ' + TrackPlusId, {
                id: TheTrack,
                duration: SpotifyTrack.duration_ms,
                explicit: SpotifyTrack.explicit,
                name: SpotifyTrack.name,
                popularity: SpotifyTrack.popularity
            });
        Track.then(function (result) {
            if (result.records.length == 0) {
                callback.negative(callback, SpotifyTrack);
                callback.after(callback, SpotifyTrack, false);
            } else {
                callback.positive(callback, SpotifyTrack);
                callback.after(callback, SpotifyTrack, true);
            }
        });
    },
    UpdateAudioFeatures: function (callback, TheAnalisys) {
        var TheTrack = TheAnalisys.id;
        var TrackPlusId = 'track' + TheTrack;
        var Analisys = dbSession.run(
            'MATCH (' + TrackPlusId + ':Track ' +
            '{ trackID: $id })' +
            'SET ' + TrackPlusId + ' += {' +
            'duration_ms: $duration_ms,' +
            'key: $key,' +
            'mode: $mode,' +
            'time_signature: $time_signature,' +
            'acousticness: $acousticness,' +
            'danceability: $danceability,' +
            'energy: $energy,' +
            'instrumentalness: $instrumentalness,' +
            'liveness: $liveness,' +
            'loudness: $loudness,' +
            'speechiness: $speechiness,' +
            'valence: $valence,' +
            'tempo: $tempo' +
            '} RETURN ' + TrackPlusId, {
                id: TheTrack,
                duration_ms: TheAnalisys.duration_ms,
                key: TheAnalisys.key,
                mode: TheAnalisys.mode,
                time_signature: TheAnalisys.time_signature,
                acousticness: TheAnalisys.acousticness,
                danceability: TheAnalisys.danceability,
                energy: TheAnalisys.energy,
                instrumentalness: TheAnalisys.instrumentalness,
                liveness: TheAnalisys.liveness,
                loudness: TheAnalisys.loudness,
                speechiness: TheAnalisys.speechiness,
                valence: TheAnalisys.valence,
                tempo: TheAnalisys.tempo
            });
        Analisys.then(function (result) {
            if (result.records.length == 0) {
                callback.negative(callback, TheAnalisys);
                callback.after(callback, TheAnalisys, false);
            } else {
                callback.positive(callback, TheAnalisys);
                callback.after(callback, TheAnalisys, true);
            }
        });
    },
    RelateUserToTrackInLibrary: function (callback, TheUser, TheTrack) {
        var Relation = dbSession.run(
            'MATCH (u:User),(t:Track) WHERE u.userID = $uid AND t.trackID = $tid ' +
            'MERGE (t)-[r:IN_LIBRARY]->(u) ' +
            'RETURN type(r)', {
                uid: TheUser,
                tid: TheTrack
            });
        Relation.then(function (result) {
            if (result.records.length == 0) {
                callback.negative(callback, TheUser, TheTrack);
                callback.after(callback, TheUser, TheTrack, false);
            } else {
                callback.positive(callback, TheUser, TheTrack);
                callback.after(callback, TheUser, TheTrack, true);
            }
        });
    },
    MergeSomeAlbum: function (callback, SpotifyAlbum) {
        var TheAlbum = SpotifyAlbum.id;
        var AlbumPlusId = 'album' + TheAlbum;
        var Album = dbSession.run(
            'MERGE (' + AlbumPlusId + ':Album ' +
            '{albumID: $id, ' +
            'albumName: $name, ' +
            'albumPopularity: $popularity}) ' +
            'RETURN ' + AlbumPlusId, {
                id: SpotifyAlbum.id,
                name: SpotifyAlbum.name,
                popularity: SpotifyAlbum.popularity,
            });
        Album.then(function (result) {
            if (result.records.length == 0) {
                callback.negative(callback, SpotifyAlbum);
                callback.after(callback, SpotifyAlbum, false);
            } else {
                callback.positive(callback, SpotifyAlbum);
                callback.after(callback, SpotifyAlbum, true);
            }
        });
    },
    RelateTrackToAlbum: function (callback, TheTrack, TheAlbum) {
        var Relation = dbSession.run(
            'MATCH (a:Album),(t:Track) WHERE a.albumID = $aid AND t.trackID = $tid ' +
            'MERGE (t)-[r:PRESENT_IN]->(a) ' +
            'RETURN type(r)', {
                aid: TheAlbum,
                tid: TheTrack
            });
        Relation.then(function (result) {
            if (result.records.length == 0) {
                callback.negative(callback, TheTrack, TheAlbum);
                callback.after(callback, TheTrack, TheAlbum, false);
            } else {
                callback.positive(callback, TheTrack, TheAlbum);
                callback.after(callback, TheTrack, TheAlbum, true);
            }
        });
    },
};

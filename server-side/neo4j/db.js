/* Funciones que interactúan con la base de datos */
const neo4j = require('neo4j-driver'); /* El driver de JavaScript */

var dbDriver = neo4j.v1.driver("bolt://localhost", neo4j.v1.auth.basic("neo4j", "db1")); /* Conexión al driver */
var dbSession = dbDriver.session(); /* Sesión de peticiones */

module.exports = {
    MergeSomeUser: function (SpotifyUser, positive, negative, after) {
        var TheUser = SpotifyUser.id;
        var UserPlusId = 'user' + TheUser;
        var UserIsPremium = ("premium".localeCompare(SpotifyUser.product) ? true : false);
        var UserAllowExplicit = (SpotifyUser.explicit_content.filter_enabled ? false : true);
        var track = dbSession.run(
            'MERGE (' + UserPlusId + ':User ' +
            '{userID: $id, ' +
            'userDisplayName: $name, ' +
            'isPremium: $premium, ' +
            'haveExplicit: $explicit, ' +
            'email: $email, ' +
            'country: $country}) ' +
            'RETURN ' + UserPlusId, {
                name: SpotifyUser.display_name || TheUser,
                id: TheUser,
                premium: UserIsPremium,
                explicit: UserAllowExplicit,
                email: SpotifyUser.email,
                country: SpotifyUser.country
            });
        track.then(function (result) {
            if (result.records.length == 0) {
                negative(TheUser);
            } else {
                positive(TheUser);
            }
            after(TheUser);
        });
    },
    MergeSomeTrack: function (SpotifyTrack, positive, negative, after) {
        var TrackPlusId = 'track' + SpotifyTrack.id;
        var track = dbSession.run(
            'MERGE (' + TrackPlusId + ':Track ' +
            '{trackID: $id, ' +
            'durationMs: $duration, ' +
            'isExplicit: $explicit, ' +
            'trackName: $name, ' +
            'popularity: $popularity}) ' +
            'RETURN ' + TrackPlusId, {
                id: SpotifyTrack.id,
                duration: SpotifyTrack.duration_ms,
                explicit: SpotifyTrack.explicit,
                name: SpotifyTrack.name,
                popularity: SpotifyTrack.popularity
            });
        track.then(function (result) {
            if (result.records.length == 0) {
                negative();
            } else {
                positive();
            }
            after();
        });
    },
    MergeSomeAlbum: function (SpotifyAlbum, positive, negative, after) {
        var AlbumPlusId = 'album' + SpotifyAlbum.id;
        var album = dbSession.run(
            'MERGE (' + AlbumPlusId + ':Album ' +
            '{albumID: $id, ' +
            'albumName: $name, ' +
            'albumPopularity: $popularity, ' +
            'totalTracks: $tracks}) ' +
            'RETURN ' + AlbumPlusId, {
                id: SpotifyAlbum.id,
                name: SpotifyAlbum.name,
                popularity: SpotifyAlbum.popularity,
                tracks: SpotifyAlbum.total_tracks,
            });
        album.then(function (result) {
            if (result.records.length == 0) {
                negative();
            } else {
                positive();
            }
            after();
        });
    },
    IsAlbumOnDatabase: function (id, positive, negative, after) {
        var album = dbSession.run(
            'MATCH (n:Album) WHERE ' +
            'n.albumID = $did ' +
            'RETURN n', {
                did: id
            }
        )
        album.then(function (result) {
            if (result.records.length == 0) {
                negative();
            } else {
                positive();
            }
            after();
        });
    },
    MergeSomeArtist: function (SpotifyArtist, positive, negative, after) {
        var ArtistPlusId = 'artist' + SpotifyArtist.id;
        var artist = dbSession.run(
            'MERGE (' + ArtistPlusId + ':Artist ' +
            '{artistID: $id, ' +
            'artistName: $name, ' +
            'artistPopularity: $popularity}) ' +
            'RETURN ' + ArtistPlusId, {
                id: SpotifyArtist.id,
                name: SpotifyArtist.name,
                popularity: SpotifyArtist.popularity
            });
        artist.then(function (result) {
            if (result.records.length == 0) {
                negative();
            } else {
                positive();
            }
            after();
        });
    },
    IsArtistOnDatabase: function (id, positive, negative, after) {
        var album = dbSession.run(
            'MATCH (n:Artist) WHERE ' +
            'n.artistID = $did ' +
            'RETURN n', {
                did: id
            }
        )
        album.then(function (result) {
            if (result.records.length == 0) {
                negative();
            } else {
                positive();
            }
            after();
        });
    },
    RelateTrackToAlbum: function (albumID, trackID, positive, negative, after) {
        var relation = dbSession.run(
            'MATCH (a:Album),(t:Track) WHERE a.albumID = $aid AND t.trackID = $tid ' +
            'MERGE (t)-[r:PRESENT_IN]->(a) ' +
            'RETURN type(r)', {
                aid: albumID,
                tid: trackID
            });
        relation.then(function (result) {
            if (result.records.length == 0) {
                negative();
            } else {
                positive();
            }
            after();
        });
    },
    RelateTrackToArtist: function (atristID, trackID, positive, negative, after) {
        var relation = dbSession.run(
            'MATCH (a:Artist),(t:Track) WHERE a.artistID = $aid AND t.trackID = $tid ' +
            'MERGE (t)-[r:INTERPRETED_BY]->(a) ' +
            'RETURN type(r)', {
                aid: atristID,
                tid: trackID
            });
        relation.then(function (result) {
            if (result.records.length == 0) {
                negative();
            } else {
                positive();
            }
            after();
        });
    },
    RelateArtistToAlbum: function (albumID, atristID, positive, negative, after) {
        var relation = dbSession.run(
            'MATCH (a:Album),(b:Artist) WHERE a.albumID = $aid AND b.artistID = $bid ' +
            'MERGE (b)-[r:DEBOUT_IN]->(a) ' +
            'RETURN type(r)', {
                aid: albumID,
                bid: atristID
            });
        relation.then(function (result) {
            if (result.records.length == 0) {
                negative();
            } else {
                positive();
            }
            after();
        });
    },
    RelateUserToTrackInLibrary: function (userID, trackID, positive, negative, after) {
        "use strict";
        var relation = dbSession.run(
            'MATCH (u:User),(t:Track) WHERE u.userID = $uid AND t.trackID = $tid ' +
            'MERGE (t)-[r:IN_LIBRARY]->(u) ' +
            'RETURN type(r)', {
                uid: userID,
                tid: trackID
            });
        relation.then(function (result) {
            if (result.records.length == 0) {
                negative();
            } else {
                positive();
            }
            after();
        });
    }
};

const fixtures = {
    sig: '0x' +
    '8951ff6182aca2e98fe4a797fbfeec0a28c87aae2fe41a4110a5f0ec17d55b86' + //r
    '15c4c73788e1b7b0c54ebf7cf60458b4948d93d85a8fc61b5de83b4285a141c4' + // S
    '01', // v
    address: '0xb95473916dac71a8039089cdf2ca0af2413c68f9',
    screenName: 'twitterapi',
    tweetId: '210462857140252672',
    badTweetId: '310462857140252672',
    tweetIdWrongSig: '410462857140252672',
    tweets: {
        // good
        '210462857140252672': {
            text: '@tweedentity 0x8951ff6182aca2e98fe4a797fbfeec0a28c87aae2fe41a4110a5f0ec17d55b8615c4c73788e1b7b0c54ebf7cf60458b4948d93d85a8fc61b5de83b4285a141c401 :-)',
            user: {
                screen_name: 'twitterapi'
            }
        },
        // no sig
        '310462857140252672': {
            text: '@tweedentity Registering for 0xNIL IFO without a sig :-)',
            user: {
                screen_name: 'twitterapi'
            }
        },
        // wrong sig
        '410462857140252672': {
            text: 'Registering for 0xNIL IFO @tweedentity 0x0000000000aca2e98fe4a797fbfeec0a28c87aae2fe41a4110a5f0ec17d55b8615c4c73788e1b7b0c54ebf7cf60458b4948d93d85a8fc61b5de83b4285a141c401 :-)',
            user: {
                screen_name: 'twitterapi'
            }
        }
    }
}

module.exports = fixtures